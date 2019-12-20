import {PrimaryKey} from "./primaryKey";

const AWS = require('aws-sdk');
const ddb = new AWS.DynamoDB.DocumentClient();

async function getModel({partitionKey, sortKey}: PrimaryKey, aggregate: string, id: string) {
    let tableName = process.env['TABLE_NAME'];
    return ddb.get({TableName: tableName, Key: {[partitionKey]: id, [sortKey]: aggregate}}).promise();
}

async function getModels(aggregate: string, exclusiveStartKey?: string) {
    let tableName = process.env[`TABLE_NAME`];
    const params: any = {
        TableName: tableName!,
        Limit: 10,
        IndexName: 'by-aggregate',
        KeyConditionExpression: "#aggregateName = :aggregate",
        ExpressionAttributeNames: {"#aggregateName": "aggregateName"},
        ExpressionAttributeValues: {":aggregate": aggregate}
    };
    if (exclusiveStartKey) {
        params.ExclusiveStartKey = {id: {S: exclusiveStartKey}}
    }
    return ddb.query(params).promise();

}

export {getModel, getModels};
