
const AWS = require('aws-sdk');
import { processEvent } from './lib/event-aggregator';
import { DynamoDBStreamEvent } from "aws-lambda";
module.exports.aggregator = async (event: DynamoDBStreamEvent) => {
    console.log({ event: JSON.stringify(event, null, 4) });
    for (let record of event.Records) {
        if (record.dynamodb) {

            const apiEvent = AWS.DynamoDB.Converter.unmarshall(record.dynamodb.NewImage);
            await processEvent(apiEvent);
        }
    }
}