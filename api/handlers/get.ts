import {getModel, getModels} from "./lib/repository";

async function handler(event: any) {
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
}

export {handler};
