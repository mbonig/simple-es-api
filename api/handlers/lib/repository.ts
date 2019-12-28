import {PrimaryKey} from "./primaryKey";
import {DocumentClient} from "aws-sdk/clients/dynamodb";
import {IEvent} from "./event";

interface ModelRepositoryOptions {
    tableName: string;
    primaryKey: PrimaryKey
}

export class ModelRepository {

    constructor(private documentClient: DocumentClient, private options: ModelRepositoryOptions) {

    }

    getModel(aggregate: string, id: string) {
        return this.documentClient.get({
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
        return this.documentClient.query(params).promise();
    }

    async saveEvent(eventModel: IEvent) {
        const sk = `event_${new Date().toISOString()}`;
        const newModel = {...eventModel, [this.options.primaryKey.sortKey]: sk};
        await this.documentClient.put({TableName: this.options.tableName, Item: newModel}).promise();
        return newModel;
    }
}
