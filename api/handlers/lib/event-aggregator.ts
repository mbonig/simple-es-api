import { eventHandlers } from './events';
import {PrimaryKey} from "../index";
const AWS = require('aws-sdk');
const ddb = new AWS.DynamoDB.DocumentClient();

// todo: https://theburningmonk.com/2019/02/lambda-optimization-tip-enable-http-keep-alive/

export const processEvent = async (apiEvent: APIEvent, {partitionKey, sortKey}: PrimaryKey) => {
    // this should get refactored up.
    const TableName = process.env.TABLE_NAME;
    const aggregator = process.env.AGGREGATOR_NAME;
    if (!aggregator) {
        throw new Error("Cannot find the aggregator to use");
    }
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
    const getResult = await ddb.get({ TableName, Key: { [partitionKey]: apiEvent[partitionKey], [sortKey]: aggregator } }).promise();
    const model = getResult.Item || { [partitionKey]: apiEvent[partitionKey], [sortKey]: aggregator };
    const updatedModel = await handler(apiEvent, model);
    if (updatedModel) {
        await ddb.put({ TableName, Item: updatedModel }).promise();
    }
};

export interface APIEvent {
    eventId: string;
    timestamp: string;
    type: string;
    [key: string]: any;
}

function hasKey<O>(obj: O, key: keyof any): key is keyof O {
    return key in obj
}
