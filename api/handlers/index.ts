const AWS = require('aws-sdk');
import { DynamoDBStreamEvent } from "aws-lambda";
module.exports.aggregator = async (event: DynamoDBStreamEvent) => {
    console.log({ event: JSON.stringify(event, null, 4) });
    for (let record of event.Records) {
        if (record.dynamodb) {

            const apiEvent = AWS.DynamoDB.Converter.unmarshall(record.dynamodb.NewImage);
            console.log({ apiEvent });
        }
    }
}