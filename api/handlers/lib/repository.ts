import {PrimaryKey} from "./primaryKey";
import {DocumentClient} from "aws-sdk/clients/dynamodb";

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

interface ModelRepositoryOptions {
    tableName: string;
    primaryKey: PrimaryKey
}

export class ModelRepository {

    constructor(private dynamoDBClient: DocumentClient, private options: ModelRepositoryOptions) {

    }

    getModel(aggregate: string, id: string) {
        return ddb.get({
            TableName: this.options.tableName,
            Key: {
                [this.options.primaryKey.partitionKey]: id,
                [this.options.primaryKey.sortKey]: aggregate
            }
        }).promise();
    }

    getModels(aggregate: string, exclusiveStartKey?: string) {
        const params: any = {
            TableName: this.options.tableName!,
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
}
