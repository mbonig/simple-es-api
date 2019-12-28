import {PrimaryKey} from "./primaryKey";
import {DocumentClient} from "aws-sdk/clients/dynamodb";

// todo: https://theburningmonk.com/2019/02/lambda-optimization-tip-enable-http-keep-alive/
/*
export const processEvent = async (apiEvent: APIEvent, {partitionKey, sortKey}: PrimaryKey) => {
    const AWS = require('aws-sdk');
    const ddb = new AWS.DynamoDB.DocumentClient();

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
    const getResult = await ddb.get({
        TableName,
        Key: {[partitionKey]: apiEvent[partitionKey], [sortKey]: aggregator}
    }).promise();
    const model = getResult.Item || {[partitionKey]: apiEvent[partitionKey], [sortKey]: aggregator};
    const updatedModel = await handler(apiEvent, model);
    updatedModel.aggregateName = aggregator;
    if (updatedModel) {
        await ddb.put({TableName, Item: updatedModel}).promise();
    }
};*/

export interface APIEvent {
    type: string;

    [key: string]: any;
}

function hasKey<O>(obj: O, key: keyof any): key is keyof O {
    return key in obj
}

interface EventAggregatorOptions {
    aggregatorName: string;
    tableName: string
}

interface EventAggregatorDependencies {
    documentClient: DocumentClient;
    eventHandlers: { [key: string]: { [key: string]: Function } }
}

export class EventAggregator {
    constructor(private primaryKeyDefinition: PrimaryKey, private options: EventAggregatorOptions, private dependencies: EventAggregatorDependencies) {

    }

    async process(event: APIEvent) {
        let aggregateHandlers;
        let aggregator = this.options.aggregatorName;

        if (hasKey(this.dependencies.eventHandlers, aggregator)) {
            aggregateHandlers = this.dependencies.eventHandlers[aggregator];
        } else {
            throw new Error("Cannot find proper aggregator");
        }

        let handler;
        if (hasKey(aggregateHandlers, event.type)) {
            handler = aggregateHandlers[event.type];
        }
        if (!handler) {
            throw new Error(`Could not find an event handler for the event type ${event.type}`);
        }

        let partitionKey = this.primaryKeyDefinition.partitionKey;
        let sortKey = this.primaryKeyDefinition.sortKey;
        let TableName = this.options.tableName;
        let documentClient = this.dependencies.documentClient;

        const getResult = await documentClient.get({
            TableName,
            Key: {
                [partitionKey]: event[partitionKey],
                [sortKey]: aggregator
            }
        }).promise();
        const model = getResult.Item || {[partitionKey]: event[partitionKey], [sortKey]: aggregator};
        const updatedModel = await handler(event, model);
        updatedModel.aggregateName = aggregator;
        if (updatedModel) {
            await documentClient.put({TableName, Item: updatedModel}).promise();
        }
    }
}
