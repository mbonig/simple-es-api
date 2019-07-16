import 'mocha';
import * as should from 'should';

import { processEvent } from './event-aggregator';

import * as AWSMock from "aws-sdk-mock";
import * as AWS from "aws-sdk";
import { GetItemInput } from "aws-sdk/clients/dynamodb";

const eventHandlers = require('./events').default;

describe('process event', () => {
    process.env.TABLE_NAME = 'some_table';
    it('throws error if can\'t find event type', async () => {
        try {
            await processEvent({ eventId: '', timestamp: '', type: 'asdf' });
            throw new Error("Expected error did not occur")
        } catch (err) {

        }
    });

    it('calls process chain as expected', async () => {
        let getCalled, putCalled, eventHandlerCalled;
        AWSMock.setSDKInstance(AWS);
        
        AWSMock.mock('DynamoDB.DocumentClient', 'get', (params: GetItemInput, callback: Function) => {
            getCalled = true;
            callback(null, {  });
        });

        AWSMock.mock('DynamoDB.DocumentClient', 'put', (params: GetItemInput, callback: Function) => {
            putCalled = true;
            callback(null, {  });
        });

        const oldCreate = eventHandlers.create;
        eventHandlers.create = () => eventHandlerCalled = true;

        await processEvent({eventId:'someId', type: 'create', timestamp: Date.now.toString()});
        
        should(getCalled).true();
        should(eventHandlerCalled).true();
        should(putCalled).true();

        eventHandlers.create = oldCreate;
        AWSMock.restore();
    });
});