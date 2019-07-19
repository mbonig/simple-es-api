
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

module.exports.create = async function echoHandlerCode(event: any, _: any, callback: any) {
    return callback(undefined, {
      isBase64Encoded: false,
      statusCode: 200,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({...event, TABLE_NAME: process.env.TABLE_NAME})
    });
  }