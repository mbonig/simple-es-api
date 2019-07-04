import { DynamoDBStreamEvent } from "aws-lambda";

module.exports.aggregator = async (event: DynamoDBStreamEvent) => {
    console.log({ event });
}