import 'mocha';
import * as should from 'should';

import {processEvent} from './event-aggregator';
import {eventHandlers} from './events';

import * as AWSMock from "aws-sdk-mock";
import * as AWS from "aws-sdk";
import {GetItemInput} from "aws-sdk/clients/dynamodb";

describe('process event', () => {
    process.env.TABLE_NAME = 'some_table';
    process.env.AGGREGATOR_NAME = 'thing';
    it('throws error if can\'t find event type', async () => {
        try {
            await processEvent({eventId: '', timestamp: '', type: 'asdf'}, {
                partitionKey: 'eventId',
                sortKey: 'timestamp'
            });
            throw new Error("Expected error did not occur")
        } catch (err) {

        }
    });

    it("doesn't try to process non-event", async () => {
        await processEvent({eventId: '', timestamp: '', type: 'asdf'}, {
            partitionKey: 'eventId',
            sortKey: 'timestamp'
        });

    });

    it('calls process chain as expected', async () => {
        let getCalled, putCalled, eventHandlerCalled;
        process.env.AGGREGATOR_NAME = 'default';
        AWSMock.setSDKInstance(AWS);

        AWSMock.mock('DynamoDB.DocumentClient', 'get', (params: GetItemInput, callback: Function) => {
            getCalled = true;
            callback(null, {});
        });

        AWSMock.mock('DynamoDB.DocumentClient', 'put', (params: GetItemInput, callback: Function) => {
            putCalled = true;
            callback(null, {});
        });

        const oldCreate = eventHandlers.default.create;
        eventHandlers.default.create = async () => eventHandlerCalled = true;

        await processEvent({
            eventId: 'someId',
            type: 'create',
            timestamp: Date.now.toString()
        }, {
            partitionKey: 'eventId',
            sortKey: 'timestamp'
        });
        eventHandlers.default.create = oldCreate;

        should(getCalled).true();
        should(eventHandlerCalled).true();
        should(putCalled).true();

        AWSMock.restore();
    });
});
