import cdk = require('@aws-cdk/core');
import { Table, AttributeType, BillingMode, StreamViewType } from '@aws-cdk/aws-dynamodb';
import { Function, Runtime, Code, StartingPosition } from '@aws-cdk/aws-lambda';
import { DynamoEventSource } from '@aws-cdk/aws-lambda-event-sources';
import { Bucket, IBucket } from '@aws-cdk/aws-s3';
import { PolicyStatement, Role, ServicePrincipal, PolicyDocument } from '@aws-cdk/aws-iam';
import { RestApi, PassthroughBehavior, AwsIntegration, LambdaIntegration } from '@aws-cdk/aws-apigateway';

export interface ApiStackProps extends cdk.StackProps {
  buildAPIGateway: boolean;
  aggregators: string[];
}

export class ApiStack extends cdk.Stack {
  eventsTable: Table;
  aggregateTables: Table[];
  apiGateway: RestApi;
  deployBucket: IBucket;

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

    this.apiGateway.root.addMethod("POST", new LambdaIntegration(createFunction), {
        methodResponses: [{
          statusCode: '200'
        }]
      });

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
    for (let aggregator of aggregators) {

      const aggregateTable = new Table(this, `${aggregator}-view-table`, {
        partitionKey: { name: 'id', type: AttributeType.STRING },
        billingMode: BillingMode.PROVISIONED,
        readCapacity: 3,
        writeCapacity: 3
      });

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
