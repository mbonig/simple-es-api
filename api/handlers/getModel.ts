import {upperCase} from 'change-case';
import {ScanInput} from 'aws-sdk/clients/dynamodb';
import {PrimaryKey} from "./index";

const AWS = require('aws-sdk');
const ddb = new AWS.DynamoDB.DocumentClient();


async function getModel({partitionKey, sortKey}: PrimaryKey, aggregate: string, id: string) {
    let tableName = process.env['TABLE_NAME'];
    return ddb.get({TableName: tableName, Key: {[partitionKey]: id, [sortKey]: aggregate}}).promise();
}

async function getModels(aggregate: string, exclusiveStartKey: string | undefined) {
    let tableName = process.env[`TABLE_NAME_${upperCase(aggregate)}`];
    if (!tableName) {
        throw new Error(`Could not find an aggregate table with the name ${aggregate}`);
    }
    const params: any = {TableName: tableName, Limit: 10};
    if (exclusiveStartKey) {
        params.ExclusiveStartKey = {id: exclusiveStartKey}
    }
    return ddb.scan(params).promise();

}

export {getModel, getModels};
