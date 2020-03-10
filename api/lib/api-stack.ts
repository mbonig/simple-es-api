import cdk = require('@aws-cdk/core');
import {AttributeType, ProjectionType, StreamViewType, Table} from '@aws-cdk/aws-dynamodb';
import {Code, Function, Runtime, StartingPosition} from '@aws-cdk/aws-lambda';
import {DynamoEventSource} from '@aws-cdk/aws-lambda-event-sources';
import {Bucket, HttpMethods, IBucket} from '@aws-cdk/aws-s3';
import {PolicyStatement} from '@aws-cdk/aws-iam';
import {IAuthorizer, LambdaIntegration, RestApi, TokenAuthorizer} from '@aws-cdk/aws-apigateway';

export interface ApiStackProps extends cdk.StackProps {
    aggregators: string[];
    authorizer?: IAuthorizer;
    buildAPIGateway: boolean;
    modelName: string;
    partitionKey: string;
    sortKey?: string;
    withLambdas: true;
}

export class ApiStack extends cdk.Stack {
    oneTable: Table;
    apiGateway: RestApi;
    deployBucket: IBucket;
    getFunction: Function;
    private createFunction: Function;
    private props: ApiStackProps;
    private id: string;

    constructor(scope: cdk.Construct, id: string, props: ApiStackProps) {
        super(scope, id, props);

        const {buildAPIGateway, aggregators, partitionKey, sortKey} = props;
        this.props = props;
        this.id = id;

        if (this.node.tryGetContext("s3_deploy_bucket")) {
            this.deployBucket = Bucket.fromBucketName(this, 's3_deploy_bucket', this.node.tryGetContext("s3_deploy_bucket"));
        }
        const code = !this.deployBucket ? Code.fromAsset('handlers') : Code.fromBucket(this.deployBucket, `${this.node.tryGetContext("lambda_hash")}.zip`)

        let sortKeyOrDefault = sortKey || "timestamp";
        this.buildDatabase(partitionKey, sortKeyOrDefault);
        this.buildAggregators(aggregators, code, partitionKey, sortKeyOrDefault);
        this.buildFunctions(code, partitionKey, sortKeyOrDefault);
        if (buildAPIGateway) {
            this.buildAPIGateway(code);
        }
    }

    buildAPIGateway(code: Code) {
        const apiName = `${this.id}-gateway`;
        const lambdaAuthorizer = new Function(this, 'authorizer', {
            handler: "authorizer.handler",
            code,
            runtime: Runtime.NODEJS_10_X
        });

        const authorizer = new TokenAuthorizer(this, 'token-authorizer', {handler: lambdaAuthorizer});
        this.apiGateway = new RestApi(this, apiName, {
            defaultMethodOptions: {
                authorizer
            },
            deployOptions:{
                throttlingRateLimit: 100,
                throttlingBurstLimit: 200
            }
        });

        this.apiGateway.root.addMethod(HttpMethods.POST, new LambdaIntegration(this.createFunction), {});
        this.apiGateway.root.addMethod(HttpMethods.GET, new LambdaIntegration(this.getFunction), {});

        const proxyResource = this.apiGateway.root.addResource('{proxy+}', {});
        proxyResource.addMethod(HttpMethods.GET, new LambdaIntegration(this.getFunction));
    }

    buildDatabase(partitionKey: string, sortKey: string) {
        this.oneTable = new Table(this, `${this.props.modelName}`, {
            partitionKey: {name: partitionKey, type: AttributeType.STRING},
            sortKey: {name: sortKey, type: AttributeType.STRING},
            stream: StreamViewType.NEW_AND_OLD_IMAGES
        });

        this.oneTable.addGlobalSecondaryIndex({
            indexName: 'by-aggregate',
            partitionKey: {name: 'aggregateName', type: AttributeType.STRING},
            projectionType: ProjectionType.ALL
        });
    }

    buildAggregators(aggregators: string[], code: Code, partitionkey: string, sortKey: string) {
        for (let aggregator of aggregators) {
            const aggregateLambda = new Function(this, `${aggregator}-processor`, {
                environment: {
                    TABLE_NAME: this.oneTable.tableName,
                    AGGREGATOR_NAME: aggregator,
                    PARTITION_KEY: partitionkey,
                    SORT_KEY: sortKey
                },
                handler: 'handlers/aggregator.handler',
                runtime: Runtime.NODEJS_10_X,
                code
            });
            aggregateLambda.addToRolePolicy(new PolicyStatement({
                actions: ["dynamodb:GetItem", "dynamodb:PutItem"],
                resources: [this.oneTable.tableArn]
            }));

            aggregateLambda.addEventSource(new DynamoEventSource(this.oneTable, {startingPosition: StartingPosition.LATEST}));
        }
    }

    private buildFunctions(code: Code, partitionKey: string, sortKey: string) {

        this.getFunction = new Function(this, 'get-function', {
            environment: {
                AGGREGATORS: JSON.stringify(this.props.aggregators),
                TABLE_NAME: this.oneTable.tableName,
                PARTITION_KEY: partitionKey,
                SORT_KEY: sortKey
            },
            handler: 'handlers/get.handler',
            runtime: Runtime.NODEJS_10_X,
            code
        });

        this.getFunction.addToRolePolicy(new PolicyStatement({
            actions: ["dynamodb:GetItem", "dynamodb:Scan", "dynamodb:Query"],
            resources: [this.oneTable.tableArn, `${this.oneTable.tableArn}/index/by-aggregate`]
        }));


        this.createFunction = new Function(this, 'create-function', {
            environment: {
                TABLE_NAME: this.oneTable.tableName,
                PARTITION_KEY: partitionKey,
                SORT_KEY: sortKey
            },
            handler: 'handlers/create.handler',
            runtime: Runtime.NODEJS_10_X,
            code
        });

        this.createFunction.addToRolePolicy(new PolicyStatement({
            actions: ['dynamodb:PutItem'],
            resources: [this.oneTable.tableArn]
        }));
    }
}
