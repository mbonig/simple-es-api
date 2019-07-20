
const AWS = require('aws-sdk');
import { processEvent } from './lib/event-aggregator';
import { DynamoDBStreamEvent } from "aws-lambda";
const ddb = new AWS.DynamoDB.DocumentClient();

module.exports.aggregator = async (event: DynamoDBStreamEvent) => {
    console.log({ event: JSON.stringify(event, null, 4) });
    for (let record of event.Records) {
        if (record.dynamodb) {

            const apiEvent = AWS.DynamoDB.Converter.unmarshall(record.dynamodb.NewImage);
            await processEvent(apiEvent);
        }
    }
}

module.exports.create = async function echoHandlerCode(event: any) {

    const eventModel = JSON.parse(event.body);
    try {
        await validateModel(eventModel);
    } catch (err) {
        return {
            isBase64Encoded: false,
            statusCode: 400,
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify(err)
        }
    }

    try {
        await saveEvent(eventModel);
    } catch (err) {
        return {
            isBase64Encoded: false,
            statusCode: 500,
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ message: 'An error occurred while trying to save your event. Please try again later.' })
        }
    }
}

async function validateModel(eventModel: IEvent){
    if (!eventModel.eventId){
        throw new Error("Please provide an 'eventId' on your event.");
    }
    
    if (!eventModel.type){
        throw new Error("Please provide a 'type' on your event.");
    }
    // additional validations will go here.
}

async function saveEvent(eventModel: IEvent){
    const timestamp = new Date().toISOString();
    await ddb.putItem({TableName: process.env.TABLE_NAME, Item: {timestamp, ...eventModel}}).promise();
}

module.exports.get = async function echoHandlerCode(event: any, _: any, callback: any) {
    return callback(undefined, {
        isBase64Encoded: false,
        statusCode: 200,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ...event, TABLE_NAME: process.env.TABLE_NAME })
    });
}

interface IEvent {
    type: string;
    eventId: string;
}