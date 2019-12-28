import 'mocha';
import 'should';
import * as AWS from "aws-sdk";
import * as Sinon from "sinon";
import sinon = require('sinon');

import {EventAggregator} from './event-aggregator';

describe('event aggregator - process', () => {
    const DocumentClient = new AWS.DynamoDB.DocumentClient();

    let eventAggregator: EventAggregator;
    let mockEventHandler: Sinon.SinonStub;
    let mockGet: any;
    let mockPut: any;

    before(() => {
        let primaryKeyDefinition = {
            partitionKey: 'eventId',
            sortKey: 'timestamp'
        };
        mockGet = sinon.stub(DocumentClient, "get");
        mockPut = sinon.stub(DocumentClient, "put");
        mockEventHandler = sinon.stub().returns({});
        eventAggregator = new EventAggregator(primaryKeyDefinition, {
            tableName: 'some_table',
            aggregatorName: 'sales'
        }, {
            documentClient: DocumentClient,
            eventHandlers: {"sales": {"create": <Function>mockEventHandler}}
        });
    });

    it('throws error if can\'t find event type', async () => {
        let errorThrown = false;
        try {
            await eventAggregator.process({eventId: '', timestamp: '', type: 'asdf'});
        } catch (err) {
            errorThrown = true;
        }
        errorThrown.should.be.true("the expected exception didn't occur");
    });

    it('calls get->update->put process chain as expected', async () => {

        mockGet.returns({promise: () => Promise.resolve({Item: {}})});
        mockPut.returns({promise: () => Promise.resolve({Item: {}})});
        await eventAggregator.process({
            eventId: 'someId',
            type: 'create',
            timestamp: Date.now.toString()
        });

        mockGet.called.should.be.true("The GET method on DocumentClient didn't get called.");
        mockEventHandler.called.should.be.true("The event handler wasn't called");
        mockPut.called.should.be.true("The PUT method on DocumentClient didn't get called.");

    });
});
