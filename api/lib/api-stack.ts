import cdk = require('@aws-cdk/core');
import {AttributeType, ProjectionType, StreamViewType, Table} from '@aws-cdk/aws-dynamodb';
import {Code, Function, Runtime, StartingPosition} from '@aws-cdk/aws-lambda';
import {DynamoEventSource} from '@aws-cdk/aws-lambda-event-sources';
import {Bucket, HttpMethods, IBucket} from '@aws-cdk/aws-s3';
import {PolicyStatement} from '@aws-cdk/aws-iam';
import {LambdaIntegration, RestApi} from '@aws-cdk/aws-apigateway';

export interface ApiStackProps extends cdk.StackProps {
    aggregators: string[];
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

    constructor(scope: cdk.Construct, id: string, props: ApiStackProps) {
        super(scope, id, props);

        const {buildAPIGateway, aggregators, partitionKey, sortKey} = props;
        this.props = props;

        if (this.node.tryGetContext("s3_deploy_bucket")) {
            this.deployBucket = Bucket.fromBucketName(this, 's3_deploy_bucket', this.node.tryGetContext("s3_deploy_bucket"));
        }
        const code = !this.deployBucket ? Code.asset('handlers') : Code.bucket(this.deployBucket, `${this.node.tryGetContext("lambda_hash")}.zip`)

        let sortKeyOrDefault = sortKey || "timestamp";
        this.buildDatabase(partitionKey, sortKeyOrDefault);
        this.buildAggregators(aggregators, code, partitionKey, sortKeyOrDefault);
        this.buildFunctions(code, partitionKey, sortKeyOrDefault);
        if (buildAPIGateway) {
            this.buildAPIGateway();
        }
    }

    buildAPIGateway() {
        this.apiGateway = new RestApi(this, 'simple-es-model-api', {});

        const postLambdaIntegration = new LambdaIntegration(this.createFunction);
        const getLambdaIntegration = new LambdaIntegration(this.getFunction);

        this.apiGateway.root.addMethod(HttpMethods.POST, postLambdaIntegration);
        this.apiGateway.root.addMethod(HttpMethods.GET, getLambdaIntegration);

        const proxyResource = this.apiGateway.root.addResource('{proxy+}', {});
        proxyResource.addMethod(HttpMethods.GET, getLambdaIntegration);
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
