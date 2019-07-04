import cdk = require('@aws-cdk/core');
import { Table, AttributeType } from '@aws-cdk/aws-dynamodb';

export class ApiStack extends cdk.Stack {
  eventsTable: Table;

  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const buildAPIGateway = this.node.tryGetContext('api-gateway-enabled') || false;



    this.buildDatabase();
    this.buildAggregators();
    if (buildAPIGateway) {
      this.buildAPIGateway();
    }
  }

  buildAPIGateway() {

  }

  buildDatabase() {
    this.eventsTable = new Table(this, 'events-table', {
      partitionKey: { name: 'eventId', type: AttributeType.STRING },
      sortKey: { name: 'timestamp', type: AttributeType.STRING }
    });
  }

  buildAggregators() {

  }
}
