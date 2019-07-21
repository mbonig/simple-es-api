import { eventHandlers } from './events';
const AWS = require('aws-sdk');

export const processEvent = async (apiEvent: APIEvent) => {
    const partitionKey: string = process.env.PARTITION_KEY || 'id';
    const TableName = process.env.TABLE_NAME;
    const aggregator = process.env.AGGREGATOR_NAME;
    if (!aggregator) {
        throw new Error("Cannot find the aggregator to use");
    }
    const ddb = new AWS.DynamoDB.DocumentClient();
    let aggregateHandlers;
    if (hasKey(eventHandlers, aggregator)) {
        aggregateHandlers = eventHandlers[aggregator];
    } else {
        throw new Error("Cannot find proper aggregator");
    }
    let handler;
    if (hasKey(aggregateHandlers, apiEvent.type)) {
        handler = aggregateHandlers[apiEvent.type];
    }
    if (!handler) {
        throw new Error(`Could not find an event handler for the event type ${apiEvent.type}`);
    }
    const getResult = await ddb.get({ TableName, Key: { [partitionKey]: apiEvent.eventId } }).promise();
    const model = getResult.Item || { [partitionKey]: apiEvent.eventId };
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

function hasKey<O>(obj: O, key: keyof any): key is keyof O {
    return key in obj
}