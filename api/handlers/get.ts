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

async function handler(event: any) {
    let [_, aggregate, id] = event.path.split("/");
    aggregate = aggregate || 'default';
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
            statusCode: 200,
            headers: {'content-type': 'application/json'},
            body: JSON.stringify(model.Item)
        };
    }
}

export {handler};
