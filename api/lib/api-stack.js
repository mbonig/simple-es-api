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
        console.log('here:', this.node.tryGetContext("s3_deploy_bucket"));
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
                    TABLE_NAME: aggregateTable.tableName
                },
                handler: 'handlers/index.aggregator',
                runtime: aws_lambda_1.Runtime.NODEJS_10_X,
                code: aws_lambda_1.Code.bucket(aws_s3_1.Bucket.fromBucketName(this, 's3_deploy_bucket', this.node.tryGetContext("s3_deploy_bucket")), 'lambda.zip')
            });
            aggregateLambda.addEventSource(new aws_lambda_event_sources_1.DynamoEventSource(this.eventsTable, { startingPosition: aws_lambda_1.StartingPosition.LATEST }));
            this.aggregateTables.push(aggregateTable);
        }
    }
}
exports.ApiStack = ApiStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBpLXN0YWNrLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYXBpLXN0YWNrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEscUNBQXNDO0FBQ3RDLHdEQUEwRjtBQUMxRixvREFBZ0Y7QUFDaEYsZ0ZBQXNFO0FBQ3RFLDRDQUF5QztBQU16QyxNQUFhLFFBQVMsU0FBUSxHQUFHLENBQUMsS0FBSztJQUlyQyxZQUFZLEtBQW9CLEVBQUUsRUFBVSxFQUFFLEtBQW9CO1FBQ2hFLEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBRXhCLE1BQU0sRUFBRSxlQUFlLEVBQUUsV0FBVyxFQUFFLEdBQUcsS0FBSyxDQUFDO1FBRS9DLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztRQUNyQixJQUFJLENBQUMsZ0JBQWdCLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDbkMsSUFBSSxlQUFlLEVBQUU7WUFDbkIsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO1NBQ3hCO0lBQ0gsQ0FBQztJQUVELGVBQWU7SUFFZixDQUFDO0lBRUQsYUFBYTtRQUNYLElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxvQkFBSyxDQUFDLElBQUksRUFBRSxjQUFjLEVBQUU7WUFDakQsWUFBWSxFQUFFLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsNEJBQWEsQ0FBQyxNQUFNLEVBQUU7WUFDN0QsT0FBTyxFQUFFLEVBQUUsSUFBSSxFQUFFLFdBQVcsRUFBRSxJQUFJLEVBQUUsNEJBQWEsQ0FBQyxNQUFNLEVBQUU7WUFDMUQsTUFBTSxFQUFFLDZCQUFjLENBQUMsa0JBQWtCO1NBQzFDLENBQUMsQ0FBQztJQUVMLENBQUM7SUFFRCxnQkFBZ0IsQ0FBQyxXQUFxQjtRQUNwQyxPQUFPLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUM7UUFDbEUsSUFBSSxDQUFDLGVBQWUsR0FBRyxFQUFFLENBQUM7UUFDMUIsS0FBSyxJQUFJLFVBQVUsSUFBSSxXQUFXLEVBQUU7WUFDbEMsTUFBTSxjQUFjLEdBQUcsSUFBSSxvQkFBSyxDQUFDLElBQUksRUFBRSxHQUFHLFVBQVUsYUFBYSxFQUFFO2dCQUNqRSxZQUFZLEVBQUUsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSw0QkFBYSxDQUFDLE1BQU0sRUFBRTtnQkFDeEQsV0FBVyxFQUFFLDBCQUFXLENBQUMsV0FBVztnQkFDcEMsWUFBWSxFQUFFLENBQUM7Z0JBQ2YsYUFBYSxFQUFFLENBQUM7YUFDakIsQ0FBQyxDQUFDO1lBQ0gsTUFBTSxlQUFlLEdBQUcsSUFBSSxxQkFBUSxDQUFDLElBQUksRUFBRSxHQUFHLFVBQVUsWUFBWSxFQUFFO2dCQUNwRSxXQUFXLEVBQUU7b0JBQ1gsVUFBVSxFQUFFLGNBQWMsQ0FBQyxTQUFTO2lCQUNyQztnQkFDRCxPQUFPLEVBQUUsMkJBQTJCO2dCQUNwQyxPQUFPLEVBQUUsb0JBQU8sQ0FBQyxXQUFXO2dCQUM1QixJQUFJLEVBQUUsaUJBQUksQ0FBQyxNQUFNLENBQUMsZUFBTSxDQUFDLGNBQWMsQ0FBQyxJQUFJLEVBQUUsa0JBQWtCLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxFQUFFLFlBQVksQ0FBQzthQUM5SCxDQUFDLENBQUM7WUFDSCxlQUFlLENBQUMsY0FBYyxDQUFDLElBQUksNENBQWlCLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxFQUFFLGdCQUFnQixFQUFFLDZCQUFnQixDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQztZQUN2SCxJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQztTQUMzQztJQUNILENBQUM7Q0FDRjtBQW5ERCw0QkFtREMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgY2RrID0gcmVxdWlyZSgnQGF3cy1jZGsvY29yZScpO1xuaW1wb3J0IHsgVGFibGUsIEF0dHJpYnV0ZVR5cGUsIEJpbGxpbmdNb2RlLCBTdHJlYW1WaWV3VHlwZSB9IGZyb20gJ0Bhd3MtY2RrL2F3cy1keW5hbW9kYic7XG5pbXBvcnQgeyBGdW5jdGlvbiwgUnVudGltZSwgQ29kZSwgU3RhcnRpbmdQb3NpdGlvbiB9IGZyb20gJ0Bhd3MtY2RrL2F3cy1sYW1iZGEnO1xuaW1wb3J0IHsgRHluYW1vRXZlbnRTb3VyY2UgfSBmcm9tICdAYXdzLWNkay9hd3MtbGFtYmRhLWV2ZW50LXNvdXJjZXMnO1xuaW1wb3J0IHsgQnVja2V0IH0gZnJvbSAnQGF3cy1jZGsvYXdzLXMzJztcbmV4cG9ydCBpbnRlcmZhY2UgQXBpU3RhY2tQcm9wcyBleHRlbmRzIGNkay5TdGFja1Byb3BzIHtcbiAgYnVpbGRBUElHYXRld2F5OiBib29sZWFuO1xuICBhZ2dyZWdhdG9yczogc3RyaW5nW107XG59XG5cbmV4cG9ydCBjbGFzcyBBcGlTdGFjayBleHRlbmRzIGNkay5TdGFjayB7XG4gIGV2ZW50c1RhYmxlOiBUYWJsZTtcbiAgYWdncmVnYXRlVGFibGVzOiBUYWJsZVtdO1xuXG4gIGNvbnN0cnVjdG9yKHNjb3BlOiBjZGsuQ29uc3RydWN0LCBpZDogc3RyaW5nLCBwcm9wczogQXBpU3RhY2tQcm9wcykge1xuICAgIHN1cGVyKHNjb3BlLCBpZCwgcHJvcHMpO1xuXG4gICAgY29uc3QgeyBidWlsZEFQSUdhdGV3YXksIGFnZ3JlZ2F0b3JzIH0gPSBwcm9wcztcblxuICAgIHRoaXMuYnVpbGREYXRhYmFzZSgpO1xuICAgIHRoaXMuYnVpbGRBZ2dyZWdhdG9ycyhhZ2dyZWdhdG9ycyk7XG4gICAgaWYgKGJ1aWxkQVBJR2F0ZXdheSkge1xuICAgICAgdGhpcy5idWlsZEFQSUdhdGV3YXkoKTtcbiAgICB9XG4gIH1cblxuICBidWlsZEFQSUdhdGV3YXkoKSB7XG5cbiAgfVxuXG4gIGJ1aWxkRGF0YWJhc2UoKSB7XG4gICAgdGhpcy5ldmVudHNUYWJsZSA9IG5ldyBUYWJsZSh0aGlzLCAnZXZlbnRzLXRhYmxlJywge1xuICAgICAgcGFydGl0aW9uS2V5OiB7IG5hbWU6ICdldmVudElkJywgdHlwZTogQXR0cmlidXRlVHlwZS5TVFJJTkcgfSxcbiAgICAgIHNvcnRLZXk6IHsgbmFtZTogJ3RpbWVzdGFtcCcsIHR5cGU6IEF0dHJpYnV0ZVR5cGUuU1RSSU5HIH0sXG4gICAgICBzdHJlYW06IFN0cmVhbVZpZXdUeXBlLk5FV19BTkRfT0xEX0lNQUdFU1xuICAgIH0pO1xuXG4gIH1cblxuICBidWlsZEFnZ3JlZ2F0b3JzKGFnZ3JlZ2F0b3JzOiBzdHJpbmdbXSkge1xuICAgIGNvbnNvbGUubG9nKCdoZXJlOicsIHRoaXMubm9kZS50cnlHZXRDb250ZXh0KFwiczNfZGVwbG95X2J1Y2tldFwiKSk7XG4gICAgdGhpcy5hZ2dyZWdhdGVUYWJsZXMgPSBbXTtcbiAgICBmb3IgKGxldCBhZ2dyZWdhdG9yIG9mIGFnZ3JlZ2F0b3JzKSB7XG4gICAgICBjb25zdCBhZ2dyZWdhdGVUYWJsZSA9IG5ldyBUYWJsZSh0aGlzLCBgJHthZ2dyZWdhdG9yfS12aWV3LXRhYmxlYCwge1xuICAgICAgICBwYXJ0aXRpb25LZXk6IHsgbmFtZTogJ2lkJywgdHlwZTogQXR0cmlidXRlVHlwZS5TVFJJTkcgfSxcbiAgICAgICAgYmlsbGluZ01vZGU6IEJpbGxpbmdNb2RlLlBST1ZJU0lPTkVELFxuICAgICAgICByZWFkQ2FwYWNpdHk6IDMsXG4gICAgICAgIHdyaXRlQ2FwYWNpdHk6IDNcbiAgICAgIH0pO1xuICAgICAgY29uc3QgYWdncmVnYXRlTGFtYmRhID0gbmV3IEZ1bmN0aW9uKHRoaXMsIGAke2FnZ3JlZ2F0b3J9LXByb2Nlc3NvcmAsIHtcbiAgICAgICAgZW52aXJvbm1lbnQ6IHtcbiAgICAgICAgICBUQUJMRV9OQU1FOiBhZ2dyZWdhdGVUYWJsZS50YWJsZU5hbWVcbiAgICAgICAgfSxcbiAgICAgICAgaGFuZGxlcjogJ2hhbmRsZXJzL2luZGV4LmFnZ3JlZ2F0b3InLFxuICAgICAgICBydW50aW1lOiBSdW50aW1lLk5PREVKU18xMF9YLFxuICAgICAgICBjb2RlOiBDb2RlLmJ1Y2tldChCdWNrZXQuZnJvbUJ1Y2tldE5hbWUodGhpcywgJ3MzX2RlcGxveV9idWNrZXQnLCB0aGlzLm5vZGUudHJ5R2V0Q29udGV4dChcInMzX2RlcGxveV9idWNrZXRcIikpLCAnbGFtYmRhLnppcCcpXG4gICAgICB9KTtcbiAgICAgIGFnZ3JlZ2F0ZUxhbWJkYS5hZGRFdmVudFNvdXJjZShuZXcgRHluYW1vRXZlbnRTb3VyY2UodGhpcy5ldmVudHNUYWJsZSwgeyBzdGFydGluZ1Bvc2l0aW9uOiBTdGFydGluZ1Bvc2l0aW9uLkxBVEVTVCB9KSk7XG4gICAgICB0aGlzLmFnZ3JlZ2F0ZVRhYmxlcy5wdXNoKGFnZ3JlZ2F0ZVRhYmxlKTtcbiAgICB9XG4gIH1cbn1cbiJdfQ==