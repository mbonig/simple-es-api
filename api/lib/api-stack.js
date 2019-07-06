"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cdk = require("@aws-cdk/core");
const aws_dynamodb_1 = require("@aws-cdk/aws-dynamodb");
const aws_lambda_1 = require("@aws-cdk/aws-lambda");
const aws_lambda_event_sources_1 = require("@aws-cdk/aws-lambda-event-sources");
const aws_s3_1 = require("@aws-cdk/aws-s3");
class ApiStack extends cdk.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);
        const { buildAPIGateway, aggregators } = props;
        this.buildDatabase();
        this.buildAggregators(aggregators);
        if (buildAPIGateway) {
            this.buildAPIGateway();
        }
    }
    buildAPIGateway() {
    }
    buildDatabase() {
        this.eventsTable = new aws_dynamodb_1.Table(this, 'events-table', {
            partitionKey: { name: 'eventId', type: aws_dynamodb_1.AttributeType.STRING },
            sortKey: { name: 'timestamp', type: aws_dynamodb_1.AttributeType.STRING },
            stream: aws_dynamodb_1.StreamViewType.NEW_AND_OLD_IMAGES
        });
    }
    buildAggregators(aggregators) {
        this.aggregateTables = [];
        for (let aggregator of aggregators) {
            const aggregateTable = new aws_dynamodb_1.Table(this, `${aggregator}-view-table`, {
                partitionKey: { name: 'id', type: aws_dynamodb_1.AttributeType.STRING },
                billingMode: aws_dynamodb_1.BillingMode.PROVISIONED,
                readCapacity: 3,
                writeCapacity: 3
            });
            const aggregateLambda = new aws_lambda_1.Function(this, `${aggregator}-processor`, {
                environment: {
                    TABLE_NAME: aggregateTable.tableName,
                    PARTITION_KEY: 'eventId',
                    SORT_KEY: 'timestamp'
                },
                handler: 'handlers/index.aggregator',
                runtime: aws_lambda_1.Runtime.NODEJS_10_X,
                code: aws_lambda_1.Code.bucket(aws_s3_1.Bucket.fromBucketName(this, 's3_deploy_bucket', this.node.tryGetContext("s3_deploy_bucket")), `${this.node.tryGetContext("lambda_hash")}.zip`)
            });
            aggregateLambda.addEventSource(new aws_lambda_event_sources_1.DynamoEventSource(this.eventsTable, { startingPosition: aws_lambda_1.StartingPosition.LATEST }));
            this.aggregateTables.push(aggregateTable);
        }
    }
}
exports.ApiStack = ApiStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBpLXN0YWNrLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYXBpLXN0YWNrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEscUNBQXNDO0FBQ3RDLHdEQUEwRjtBQUMxRixvREFBZ0Y7QUFDaEYsZ0ZBQXNFO0FBQ3RFLDRDQUF5QztBQU16QyxNQUFhLFFBQVMsU0FBUSxHQUFHLENBQUMsS0FBSztJQUlyQyxZQUFZLEtBQW9CLEVBQUUsRUFBVSxFQUFFLEtBQW9CO1FBQ2hFLEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBRXhCLE1BQU0sRUFBRSxlQUFlLEVBQUUsV0FBVyxFQUFFLEdBQUcsS0FBSyxDQUFDO1FBRS9DLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztRQUNyQixJQUFJLENBQUMsZ0JBQWdCLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDbkMsSUFBSSxlQUFlLEVBQUU7WUFDbkIsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO1NBQ3hCO0lBQ0gsQ0FBQztJQUVELGVBQWU7SUFFZixDQUFDO0lBRUQsYUFBYTtRQUNYLElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxvQkFBSyxDQUFDLElBQUksRUFBRSxjQUFjLEVBQUU7WUFDakQsWUFBWSxFQUFFLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsNEJBQWEsQ0FBQyxNQUFNLEVBQUU7WUFDN0QsT0FBTyxFQUFFLEVBQUUsSUFBSSxFQUFFLFdBQVcsRUFBRSxJQUFJLEVBQUUsNEJBQWEsQ0FBQyxNQUFNLEVBQUU7WUFDMUQsTUFBTSxFQUFFLDZCQUFjLENBQUMsa0JBQWtCO1NBQzFDLENBQUMsQ0FBQztJQUVMLENBQUM7SUFFRCxnQkFBZ0IsQ0FBQyxXQUFxQjtRQUNwQyxJQUFJLENBQUMsZUFBZSxHQUFHLEVBQUUsQ0FBQztRQUMxQixLQUFLLElBQUksVUFBVSxJQUFJLFdBQVcsRUFBRTtZQUNsQyxNQUFNLGNBQWMsR0FBRyxJQUFJLG9CQUFLLENBQUMsSUFBSSxFQUFFLEdBQUcsVUFBVSxhQUFhLEVBQUU7Z0JBQ2pFLFlBQVksRUFBRSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLDRCQUFhLENBQUMsTUFBTSxFQUFFO2dCQUN4RCxXQUFXLEVBQUUsMEJBQVcsQ0FBQyxXQUFXO2dCQUNwQyxZQUFZLEVBQUUsQ0FBQztnQkFDZixhQUFhLEVBQUUsQ0FBQzthQUNqQixDQUFDLENBQUM7WUFDSCxNQUFNLGVBQWUsR0FBRyxJQUFJLHFCQUFRLENBQUMsSUFBSSxFQUFFLEdBQUcsVUFBVSxZQUFZLEVBQUU7Z0JBQ3BFLFdBQVcsRUFBRTtvQkFDWCxVQUFVLEVBQUUsY0FBYyxDQUFDLFNBQVM7b0JBQ3BDLGFBQWEsRUFBRSxTQUFTO29CQUN4QixRQUFRLEVBQUUsV0FBVztpQkFDdEI7Z0JBQ0QsT0FBTyxFQUFFLDJCQUEyQjtnQkFDcEMsT0FBTyxFQUFFLG9CQUFPLENBQUMsV0FBVztnQkFDNUIsSUFBSSxFQUFFLGlCQUFJLENBQUMsTUFBTSxDQUFDLGVBQU0sQ0FBQyxjQUFjLENBQUMsSUFBSSxFQUFFLGtCQUFrQixFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLGtCQUFrQixDQUFDLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUM7YUFDakssQ0FBQyxDQUFDO1lBQ0gsZUFBZSxDQUFDLGNBQWMsQ0FBQyxJQUFJLDRDQUFpQixDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsRUFBRSxnQkFBZ0IsRUFBRSw2QkFBZ0IsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDdkgsSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUM7U0FDM0M7SUFDSCxDQUFDO0NBQ0Y7QUFwREQsNEJBb0RDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGNkayA9IHJlcXVpcmUoJ0Bhd3MtY2RrL2NvcmUnKTtcbmltcG9ydCB7IFRhYmxlLCBBdHRyaWJ1dGVUeXBlLCBCaWxsaW5nTW9kZSwgU3RyZWFtVmlld1R5cGUgfSBmcm9tICdAYXdzLWNkay9hd3MtZHluYW1vZGInO1xuaW1wb3J0IHsgRnVuY3Rpb24sIFJ1bnRpbWUsIENvZGUsIFN0YXJ0aW5nUG9zaXRpb24gfSBmcm9tICdAYXdzLWNkay9hd3MtbGFtYmRhJztcbmltcG9ydCB7IER5bmFtb0V2ZW50U291cmNlIH0gZnJvbSAnQGF3cy1jZGsvYXdzLWxhbWJkYS1ldmVudC1zb3VyY2VzJztcbmltcG9ydCB7IEJ1Y2tldCB9IGZyb20gJ0Bhd3MtY2RrL2F3cy1zMyc7XG5leHBvcnQgaW50ZXJmYWNlIEFwaVN0YWNrUHJvcHMgZXh0ZW5kcyBjZGsuU3RhY2tQcm9wcyB7XG4gIGJ1aWxkQVBJR2F0ZXdheTogYm9vbGVhbjtcbiAgYWdncmVnYXRvcnM6IHN0cmluZ1tdO1xufVxuXG5leHBvcnQgY2xhc3MgQXBpU3RhY2sgZXh0ZW5kcyBjZGsuU3RhY2sge1xuICBldmVudHNUYWJsZTogVGFibGU7XG4gIGFnZ3JlZ2F0ZVRhYmxlczogVGFibGVbXTtcblxuICBjb25zdHJ1Y3RvcihzY29wZTogY2RrLkNvbnN0cnVjdCwgaWQ6IHN0cmluZywgcHJvcHM6IEFwaVN0YWNrUHJvcHMpIHtcbiAgICBzdXBlcihzY29wZSwgaWQsIHByb3BzKTtcblxuICAgIGNvbnN0IHsgYnVpbGRBUElHYXRld2F5LCBhZ2dyZWdhdG9ycyB9ID0gcHJvcHM7XG5cbiAgICB0aGlzLmJ1aWxkRGF0YWJhc2UoKTtcbiAgICB0aGlzLmJ1aWxkQWdncmVnYXRvcnMoYWdncmVnYXRvcnMpO1xuICAgIGlmIChidWlsZEFQSUdhdGV3YXkpIHtcbiAgICAgIHRoaXMuYnVpbGRBUElHYXRld2F5KCk7XG4gICAgfVxuICB9XG5cbiAgYnVpbGRBUElHYXRld2F5KCkge1xuXG4gIH1cblxuICBidWlsZERhdGFiYXNlKCkge1xuICAgIHRoaXMuZXZlbnRzVGFibGUgPSBuZXcgVGFibGUodGhpcywgJ2V2ZW50cy10YWJsZScsIHtcbiAgICAgIHBhcnRpdGlvbktleTogeyBuYW1lOiAnZXZlbnRJZCcsIHR5cGU6IEF0dHJpYnV0ZVR5cGUuU1RSSU5HIH0sXG4gICAgICBzb3J0S2V5OiB7IG5hbWU6ICd0aW1lc3RhbXAnLCB0eXBlOiBBdHRyaWJ1dGVUeXBlLlNUUklORyB9LFxuICAgICAgc3RyZWFtOiBTdHJlYW1WaWV3VHlwZS5ORVdfQU5EX09MRF9JTUFHRVNcbiAgICB9KTtcblxuICB9XG5cbiAgYnVpbGRBZ2dyZWdhdG9ycyhhZ2dyZWdhdG9yczogc3RyaW5nW10pIHtcbiAgICB0aGlzLmFnZ3JlZ2F0ZVRhYmxlcyA9IFtdO1xuICAgIGZvciAobGV0IGFnZ3JlZ2F0b3Igb2YgYWdncmVnYXRvcnMpIHtcbiAgICAgIGNvbnN0IGFnZ3JlZ2F0ZVRhYmxlID0gbmV3IFRhYmxlKHRoaXMsIGAke2FnZ3JlZ2F0b3J9LXZpZXctdGFibGVgLCB7XG4gICAgICAgIHBhcnRpdGlvbktleTogeyBuYW1lOiAnaWQnLCB0eXBlOiBBdHRyaWJ1dGVUeXBlLlNUUklORyB9LFxuICAgICAgICBiaWxsaW5nTW9kZTogQmlsbGluZ01vZGUuUFJPVklTSU9ORUQsXG4gICAgICAgIHJlYWRDYXBhY2l0eTogMyxcbiAgICAgICAgd3JpdGVDYXBhY2l0eTogM1xuICAgICAgfSk7XG4gICAgICBjb25zdCBhZ2dyZWdhdGVMYW1iZGEgPSBuZXcgRnVuY3Rpb24odGhpcywgYCR7YWdncmVnYXRvcn0tcHJvY2Vzc29yYCwge1xuICAgICAgICBlbnZpcm9ubWVudDoge1xuICAgICAgICAgIFRBQkxFX05BTUU6IGFnZ3JlZ2F0ZVRhYmxlLnRhYmxlTmFtZSxcbiAgICAgICAgICBQQVJUSVRJT05fS0VZOiAnZXZlbnRJZCcsXG4gICAgICAgICAgU09SVF9LRVk6ICd0aW1lc3RhbXAnXG4gICAgICAgIH0sXG4gICAgICAgIGhhbmRsZXI6ICdoYW5kbGVycy9pbmRleC5hZ2dyZWdhdG9yJyxcbiAgICAgICAgcnVudGltZTogUnVudGltZS5OT0RFSlNfMTBfWCxcbiAgICAgICAgY29kZTogQ29kZS5idWNrZXQoQnVja2V0LmZyb21CdWNrZXROYW1lKHRoaXMsICdzM19kZXBsb3lfYnVja2V0JywgdGhpcy5ub2RlLnRyeUdldENvbnRleHQoXCJzM19kZXBsb3lfYnVja2V0XCIpKSwgYCR7dGhpcy5ub2RlLnRyeUdldENvbnRleHQoXCJsYW1iZGFfaGFzaFwiKX0uemlwYClcbiAgICAgIH0pO1xuICAgICAgYWdncmVnYXRlTGFtYmRhLmFkZEV2ZW50U291cmNlKG5ldyBEeW5hbW9FdmVudFNvdXJjZSh0aGlzLmV2ZW50c1RhYmxlLCB7IHN0YXJ0aW5nUG9zaXRpb246IFN0YXJ0aW5nUG9zaXRpb24uTEFURVNUIH0pKTtcbiAgICAgIHRoaXMuYWdncmVnYXRlVGFibGVzLnB1c2goYWdncmVnYXRlVGFibGUpO1xuICAgIH1cbiAgfVxufVxuIl19