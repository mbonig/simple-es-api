const AWS = require('aws-sdk');
const ddb = new AWS.DynamoDB.DocumentClient();

import {APIEvent, processEvent} from './lib/event-aggregator';
import {DynamoDBStreamEvent} from "aws-lambda";
import {getModel, getModels} from './getModel';

export interface PrimaryKey {
    partitionKey: string;
    sortKey: string;
}

const primaryKeyDefinition: PrimaryKey = {partitionKey: process.env.PARTITION_KEY!, sortKey: process.env.SORT_KEY!};


module.exports.aggregator = async (event: DynamoDBStreamEvent) => {
    console.log({event: JSON.stringify(event, null, 4)});
    for (let record of event.Records) {
        if (record.eventName === "REMOVE") {
            // let's do nothing for now;
            continue;
        }
        if (record.dynamodb) {

            const apiEvent: APIEvent = <APIEvent>AWS.DynamoDB.Converter.unmarshall(record.dynamodb.NewImage!);
            await processEvent(apiEvent, primaryKeyDefinition);
        }
    }
};

module.exports.create = async function createEvent(event: any) {

    const eventModel = JSON.parse(event.body);
    try {
        await validateModel(primaryKeyDefinition, eventModel);
    } catch (err) {
        return {
            isBase64Encoded: false,
            statusCode: 400,
            headers: {'content-type': 'text/plain'},
            body: err.message
        }
    }

    try {
        const updatedEventModel = await saveEvent(primaryKeyDefinition, eventModel);
        return {
            statusCode: 200,
            body: JSON.stringify(updatedEventModel)
        }
    } catch (err) {
        return {
            isBase64Encoded: false,
            statusCode: 500,
            headers: {'content-type': 'text/plain'},
            body: 'An error occurred while trying to save your event. Please try again later.'
        }
    }
};

async function validateModel(primaryKeyDefinition: PrimaryKey, eventModel: IEvent) {
    if (!eventModel[primaryKeyDefinition.partitionKey]) {
        throw new Error(`Please provide the '${primaryKeyDefinition.partitionKey}' on your event.`);
    }

    if (!eventModel.type) {
        throw new Error("Please provide a 'type' on your event.");
    }
    // additional validations will go here.
}


async function saveEvent({partitionKey, sortKey}: PrimaryKey, eventModel: IEvent) {
    const sk = `event_${new Date().toISOString()}`;
    const newModel = {...eventModel, [sortKey]: sk};
    await ddb.put({TableName: process.env.TABLE_NAME, Item: newModel}).promise();
    return newModel;
}

const get = async function getHandler(event: any) {
    let [_, aggregate, id] = event.path.split("/");


    aggregate = aggregate || 'default';

    if (!id) {
        const models = await getModels(aggregate, event.headers && event.headers.ExclusiveStartKey);
        return {
            isBase64Encoded: false,
            statusCode: 200,
            headers: {
                'content-type': 'application/json',
                'LastEvaluatedKey': models.LastEvaluatedKey && models.LastEvaluatedKey.id
            },
            body: JSON.stringify(models.Items)
        };

    } else {
        const model = await getModel({
            partitionKey: process.env.PARTITION_KEY!,
            sortKey: process.env.SORT_KEY!
        }, aggregate, id);
        return {
            isBase64Encoded: false,
            statusCode: 200,
            headers: {'content-type': 'application/json'},
            body: JSON.stringify(model.Item)
        };
    }
};

interface IEvent {
    type: string;
    [key: string]: string;
}

export {get};
