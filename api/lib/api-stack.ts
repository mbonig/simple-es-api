import cdk = require('@aws-cdk/core');
import { Table, AttributeType, BillingMode, StreamViewType } from '@aws-cdk/aws-dynamodb';
import { Function, Runtime, Code, StartingPosition } from '@aws-cdk/aws-lambda';
import { DynamoEventSource } from '@aws-cdk/aws-lambda-event-sources';
import { Bucket, IBucket, HttpMethods } from '@aws-cdk/aws-s3';
import { PolicyStatement, Role, ServicePrincipal, PolicyDocument } from '@aws-cdk/aws-iam';
import { RestApi, PassthroughBehavior, AwsIntegration, LambdaIntegration } from '@aws-cdk/aws-apigateway';
import { upperCase } from 'change-case';
export interface ApiStackProps extends cdk.StackProps {
  buildAPIGateway: boolean;
  aggregators: string[];
}

export class ApiStack extends cdk.Stack {
  eventsTable: Table;
  aggregateTables: Table[];
  apiGateway: RestApi;
  deployBucket: IBucket;
  aggregatorTableNames: any[];
  getFunction: Function;

  constructor(scope: cdk.Construct, id: string, props: ApiStackProps) {
    super(scope, id, props);

    const { buildAPIGateway, aggregators } = props;

    this.deployBucket = Bucket.fromBucketName(this, 's3_deploy_bucket', this.node.tryGetContext("s3_deploy_bucket"));
    this.buildDatabase();
    this.buildAggregators(aggregators);
    if (buildAPIGateway) {
      this.buildAPIGateway();
    }
  }

  buildAPIGateway() {

    this.apiGateway = new RestApi(this, 'simple-es-model-api', {});
    const envTables = this.aggregatorTableNames.reduce((b, x) => ({ ...b, [`TABLE_NAME_${upperCase(x.name)}`]: x.tableName }), {});

    this.getFunction = new Function(this, 'get-function', {
      environment: {
        ...envTables,
        PARTITION_KEY: 'eventId',
        SORT_KEY: 'timestamp'
      },
      handler: 'handlers/index.get',
      runtime: Runtime.NODEJS_10_X,
      code: Code.bucket(this.deployBucket, `${this.node.tryGetContext("lambda_hash")}.zip`)
    });

    this.getFunction.addToRolePolicy(new PolicyStatement({
      actions: ["dynamodb:GetItem", "dynamodb:Scan"],
      resources: this.aggregatorTableNames.map(x => x.tableArn)
    }));



    const getLambdaIntegration = new LambdaIntegration(this.getFunction);
    const createFunction = new Function(this, 'create-function', {
      environment: {
        TABLE_NAME: this.eventsTable.tableName,
        PARTITION_KEY: 'eventId',
        SORT_KEY: 'timestamp'
      },
      handler: 'handlers/index.create',
      runtime: Runtime.NODEJS_10_X,
      code: Code.bucket(this.deployBucket, `${this.node.tryGetContext("lambda_hash")}.zip`)
    });

    createFunction.addToRolePolicy(new PolicyStatement({
      actions: ['dynamodb:PutItem'],
      resources: [this.eventsTable.tableArn]
    }));

    this.apiGateway.root.addMethod(HttpMethods.POST, new LambdaIntegration(createFunction));
    this.apiGateway.root.addMethod(HttpMethods.GET, getLambdaIntegration);

    const proxyResource = this.apiGateway.root.addResource('{proxy+}', {});
    proxyResource.addMethod(HttpMethods.GET, getLambdaIntegration);

  }

  buildDatabase() {
    this.eventsTable = new Table(this, 'events-table', {
      partitionKey: { name: 'eventId', type: AttributeType.STRING },
      sortKey: { name: 'timestamp', type: AttributeType.STRING },
      stream: StreamViewType.NEW_AND_OLD_IMAGES
    });

  }

  buildAggregators(aggregators: string[]) {
    this.aggregateTables = [];
    this.aggregatorTableNames = [];
    for (let aggregator of aggregators) {

      const aggregateTable = new Table(this, `${aggregator}-view-table`, {
        partitionKey: { name: 'id', type: AttributeType.STRING },
        billingMode: BillingMode.PROVISIONED,
        readCapacity: 3,
        writeCapacity: 3
      });
      this.aggregatorTableNames.push({ name: aggregator, tableName: aggregateTable.tableName, tableArn: aggregateTable.tableArn });

      const aggregateLambda = new Function(this, `${aggregator}-processor`, {
        environment: {
          TABLE_NAME: aggregateTable.tableName,
          AGGREGATOR_NAME: aggregator,
          PARTITION_KEY: 'id',
          SORT_KEY: 'timestamp'
        },
        handler: 'handlers/index.aggregator',
        runtime: Runtime.NODEJS_10_X,
        code: Code.bucket(this.deployBucket, `${this.node.tryGetContext("lambda_hash")}.zip`)
      });
      aggregateLambda.addToRolePolicy(new PolicyStatement({
        actions: ["dynamodb:GetItem", "dynamodb:PutItem"],
        resources: [aggregateTable.tableArn]
      }));

      aggregateLambda.addEventSource(new DynamoEventSource(this.eventsTable, { startingPosition: StartingPosition.LATEST }));
      this.aggregateTables.push(aggregateTable);
    }
  }
}
