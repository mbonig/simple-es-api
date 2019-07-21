import { upperCase } from 'change-case';
import { ScanInput } from 'aws-sdk/clients/dynamodb';
const AWS = require('aws-sdk');
const ddb = new AWS.DynamoDB.DocumentClient();


async function getModel(aggregate: string, id: string) {
    let tableName = process.env[`TABLE_NAME_${upperCase(aggregate)}`];
    if (!tableName) {
        throw new Error(`Could not find an aggregate table with the name ${aggregate}`);
    }
    return ddb.get({ TableName: tableName, Key: { id } }).promise();
}

async function getModels(aggregate: string, lastEvaluatedKey: string | undefined) {
    let tableName = process.env[`TABLE_NAME_${upperCase(aggregate)}`];
    if (!tableName) {
        throw new Error(`Could not find an aggregate table with the name ${aggregate}`);
    }
    const params: any = { TableName: tableName, Limit: 10 };
    if (lastEvaluatedKey) {
        params.ExclusiveStartKey = {id: lastEvaluatedKey}
    }
    return ddb.scan(params).promise();

}

export { getModel, getModels };
