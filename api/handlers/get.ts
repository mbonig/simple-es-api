import {ModelRepository} from "./lib/repository";

const AWS = require('aws-sdk');
const ddb = new AWS.DynamoDB.DocumentClient();
const modelRepository = new ModelRepository(ddb, {
    primaryKey: {
        partitionKey: process.env.PARTITION_KEY!,
        sortKey: process.env.SORT_KEY!
    },
    tableName: process.env.TABLE_NAME!
});
const systemAggregators = JSON.parse(process.env.AGGREGATORS!);

async function handler(event: any): Promise<any> {
    let [_, aggregate, id] = event.path.split("/");
    aggregate = aggregate || 'default';

    if (!systemAggregators.find((x: string) => x === aggregate)) {
        // this means the thing we thought was an aggregate was actually an id...
        id = aggregate;
        aggregate = 'default';
    }
    if (!id) {
        const models = await modelRepository.getModels(aggregate, event.headers && event.headers.ExclusiveStartKey);
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
        const model = await modelRepository.getModel(aggregate, id);
        return {
            isBase64Encoded: false,
            statusCode: model.Item ? 200 : 404,
            headers: {'content-type': 'application/json'},
            body: JSON.stringify(model.Item)
        };
    }
}

export {handler};
