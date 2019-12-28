import 'mocha';
import 'should';
import * as Sinon from "sinon";
import sinon = require('sinon');

process.env.PARTITION_KEY = "pk";

const {handler} = require('./create');
const {ModelRepository} = require('./lib/repository');

describe("create - handler", () => {


    let mockSaveEvent: Sinon.SinonStub;
    before(() => {
        mockSaveEvent = sinon.stub(ModelRepository.prototype, 'saveEvent');
    });

    afterEach(() => {
        mockSaveEvent.reset();
    });

    it("calls save", async () => {
        let mockModel = {pk: "something", type: 'create', one: "two", three: "four"};
        mockSaveEvent.callsFake(() => Promise.resolve(mockModel));
        await handler({
            body: JSON.stringify(mockModel)
        });
        (mockSaveEvent.firstCall.args[0]).should.be.eql(mockModel);
    });

    it("returns error if doesn't have pk", async () => {
        let mockModel = {type: 'create', one: "two", three: "four"};
        mockSaveEvent.callsFake(() => Promise.resolve(mockModel));
        const results = await handler({
            body: JSON.stringify(mockModel)
        });
        (results.statusCode).should.be.eql(400);
    });

    it("returns error if pk is empty", async () => {
        let mockModel = {pk: "", type: 'create', one: "two", three: "four"};
        mockSaveEvent.callsFake(() => Promise.resolve(mockModel));
        const results = await handler({
            body: JSON.stringify(mockModel)
        });
        (results.statusCode).should.be.eql(400);
    });

    it("returns error if saveEvent throws error", async () => {
        let mockModel = {pk: "asdf", type: 'create', one: "two", three: "four"};
        mockSaveEvent.throws(new Error());
        const results = await handler({
            body: JSON.stringify(mockModel)
        });
        (results.statusCode).should.be.eql(500);
    });

});
