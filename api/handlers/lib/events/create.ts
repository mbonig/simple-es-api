import { APIEvent } from "../event-aggregator";

const create = async (event: APIEvent, model: any = {})=> {
    return {...model, name: event.name}
};

export default create;