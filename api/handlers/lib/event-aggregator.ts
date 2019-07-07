const eventHandlers = require('./events').default;
const AWS = require('aws-sdk');

export const processEvent = async (apiEvent: APIEvent) => {
    const TableName = process.env.TABLE_NAME;
    const ddb = new AWS.DynamoDB.DocumentClient();
    const handler = eventHandlers[apiEvent.type];
    if (!handler) {
        throw new Error(`Could not find an event handler for the event type ${apiEvent.type}`);
    }
    const getResult = await ddb.get({ TableName, Key: { eventId: apiEvent.eventId } }).promise();
    const model = getResult.Item || { eventId: apiEvent.eventId };
    const updatedModel = await handler(apiEvent, model);
    if (updatedModel) {
        await ddb.put({ TableName, Item: updatedModel }).promise();
    }
}

export interface APIEvent {
    eventId: string;
    timestamp: string;
    type: string;
    [key: string]: any;
}