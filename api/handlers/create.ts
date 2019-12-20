import {IEvent} from "./lib/event";
import {PrimaryKey} from "./lib/primaryKey";

const AWS = require('aws-sdk');
const ddb = new AWS.DynamoDB.DocumentClient();

const primaryKeyDefinition: PrimaryKey = {partitionKey: process.env.PARTITION_KEY!, sortKey: process.env.SORT_KEY!};

export async function validateModel(eventModel: IEvent) {
    if (!eventModel[primaryKeyDefinition.partitionKey]) {
        throw new Error(`Please provide the '${primaryKeyDefinition.partitionKey}' on your event.`);
    }

    if (!eventModel.type) {
        throw new Error("Please provide a 'type' on your event.");
    }
    // additional validations will go here.
}

export async function saveEvent(eventModel: IEvent) {
    const sk = `event_${new Date().toISOString()}`;
    const newModel = {...eventModel, [primaryKeyDefinition.sortKey]: sk};
    await ddb.put({TableName: process.env.TABLE_NAME, Item: newModel}).promise();
    return newModel;
}


async function handler(event: any) {

    const eventModel = JSON.parse(event.body);
    try {
        await validateModel(eventModel);
    } catch (err) {
        return {
            isBase64Encoded: false,
            statusCode: 400,
            headers: {'content-type': 'text/plain'},
            body: err.message
        }
    }

    try {
        const updatedEventModel = await saveEvent(eventModel);
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
}

export {handler};
