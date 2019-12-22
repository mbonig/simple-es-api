import 'mocha';
import 'should';
import * as Sinon from "sinon";

const proxyquire = require('proxyquire');
import sinon = require('sinon');

process.env.AGGREGATORS = JSON.stringify(["default", "sales"]);

const {handler} = require('./get');
const {ModelRepository} = require('./lib/repository');

describe("Get handler", () => {

    let mockGetModelCall: Sinon.SinonStub;
    let mockGetModelsCall: Sinon.SinonStub;
    before(() => {
        mockGetModelCall = sinon.stub(ModelRepository.prototype, 'getModel');
        mockGetModelsCall = sinon.stub(ModelRepository.prototype, 'getModels').callsFake(() => Promise.resolve({}));

    });
    afterEach(() => {
        mockGetModelCall.reset();
        mockGetModelsCall.reset();
    });

    it("uses default when aggregate doesn't match tables available", async () => {
        mockGetModelCall.callsFake(() => Promise.resolve({}));
        handler({
            path: "/asdfasdf"
        });

        (mockGetModelCall.firstCall.args[0]).should.be.equal('default');
        (mockGetModelCall.firstCall.args[1]).should.be.equal("asdfasdf");

    });

    it("uses first pathpart as aggregate when matches table", async () => {
        mockGetModelCall.callsFake(() => Promise.resolve({}));

        handler({
            path: "/default/test"
        });

        (mockGetModelCall.firstCall.args[0]).should.be.equal("default");
        (mockGetModelCall.firstCall.args[1]).should.be.equal("test");

    });
    it("returns item on body", async () => {
        let stubItem: any = {};
        mockGetModelCall.callsFake(() => Promise.resolve({Item: stubItem}));

        const results = await handler({
            path: "/default/test"
        });

        results.body.should.be.equal(JSON.stringify(stubItem));
    });

    it("calls get models with aggregate matches but no id", async () => {
        mockGetModelsCall.callsFake(() => Promise.resolve([]));

        handler({
            path: "/default"
        });

        (mockGetModelsCall.firstCall.args[0]).should.be.equal("default");
    });

    it("calls get models with no aggregate and no id", async () => {
        mockGetModelsCall.callsFake(() => Promise.resolve([]));

        handler({
            path: "/"
        });

        (mockGetModelsCall.firstCall.args[0]).should.be.equal("default");
    });

    it("returns items on body", async () => {
        let items: any[] = ["one", "two", "three"];
        mockGetModelsCall.callsFake(() => Promise.resolve({Items: items}));

        const results = await handler({
            path: "/"
        });

        results.body.should.be.equal(JSON.stringify(items));
    });

    it("passes lastEvaluatedKey", async () => {
        mockGetModelsCall.callsFake(() => Promise.resolve([]));

        handler({
            path: "/",
            headers: {
                ExclusiveStartKey: 'asdf'
            }
        });

        (mockGetModelsCall.firstCall.args[0]).should.be.equal("default");
        (mockGetModelsCall.firstCall.args[1]).should.be.equal("asdf");
    });


});
