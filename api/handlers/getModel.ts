import { upperCase } from 'change-case';
const AWS = require('aws-sdk');
const ddb = new AWS.DynamoDB.DocumentClient();


async function getModel(aggregate: string, id: string) {
    let tableName = process.env[`TABLE_NAME_${upperCase(aggregate)}`];
    if (!tableName) {
        throw new Error(`Could not find an aggregate table with the name ${aggregate}`);
    }
    return ddb.get({ TableName: tableName, Key: { id } }).promise();
}

async function getModels(aggregate: string) {
    let tableName = process.env[`TABLE_NAME_${upperCase(aggregate)}`];
    if (!tableName) {
        throw new Error(`Could not find an aggregate table with the name ${aggregate}`);
    }
    return ddb.scan({ TableName: tableName }).promise();
    
}

export {getModel, getModels};
