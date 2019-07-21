import { APIEvent } from "../../event-aggregator";

export const summaryAggregators = {
    "create": async (event: APIEvent, model: any = {}) => {
        return { ...model, name: event.name, timestamp: event.timestamp }
    }
}