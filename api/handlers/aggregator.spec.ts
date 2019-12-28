import 'mocha';
import 'should';
import * as AWS from 'aws-sdk';
import * as Sinon from "sinon";
import sinon = require('sinon');

import {EventAggregator} from './lib/event-aggregator';


describe("aggregator - handler", () => {
    let mockProcessCall: Sinon.SinonStub;
    let handler: Function;
    let ORIGINAL_SORT_KEY = process.env.SORT_KEY;

    before(() => {
        process.env.SORT_KEY = "sk";
        handler = require('./aggregator').handler;
        mockProcessCall = sinon.stub(EventAggregator.prototype, 'process');
    });

    afterEach(() => {
        mockProcessCall.reset();
    });

    after(() => {
        process.env.SORT_KEY = ORIGINAL_SORT_KEY;
        sinon.restore();
    });

    it("if not event, don't do anything", async () => {
        mockProcessCall.callsFake(() => Promise.resolve({}));
        let newImage: AWS.DynamoDB.AttributeMap = {"sk": {"S": "test"}};
        await handler({
            Records: [
                {
                    dynamodb: {
                        NewImage: newImage
                    }
                }]
        });

        (mockProcessCall.callCount).should.be.equal(0);

    });

    it("calls if event", async () => {
        mockProcessCall.callsFake(() => Promise.resolve({}));
        let newImage: AWS.DynamoDB.AttributeMap = {"sk": {"S": "event_test"}};
        await handler({
            Records: [
                {
                    dynamodb: {
                        NewImage: newImage
                    }
                }]
        });

        (mockProcessCall.callCount).should.be.equal(1);
    });
});
