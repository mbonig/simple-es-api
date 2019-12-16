import 'mocha';
import 'should';

const proxyquire = require('proxyquire')
import sinon = require('sinon');

describe("Get handler", () => {
    /*it("uses default when aggregate doesn't match tables available", async () => {
        const event = {
            path: "/asdfasdf"
        };
        const mockGetModel = sinon.fake.returns({ Item: {} })
        var { get } = proxyquire('./index', {
            './getModel': {
                getModel: mockGetModel
            }
        });

        delete process.env.TABLE_NAME_ASDFASDF;
        get(event);

        mockGetModel.calledWith('default', 'asdfasdf').should.be.true(mockGetModel.firstCall.toString());

    });*/

    it("uses first pathpart as aggregate when matches table", async () => {
        const event = {
            path: "/default/test"
        };
        const mockGetModel = sinon.fake.returns({Item: {}});
        var {get} = proxyquire('./index', {
            './getModel': {
                getModel: mockGetModel
            }
        });
        process.env[`TABLE_NAME_DEFAULT`] = 'default';
        get(event);

        mockGetModel.calledWith({
            partitionKey: undefined,
            sortKey: undefined
        }, 'default', 'test').should.be.true(mockGetModel.firstCall.toString());

    });

    it("calls get models with aggregate matches but no id", async () => {
        const event = {
            path: "/default"
        };
        const mockGetModel = sinon.fake.returns({Items: []});
        var {get} = proxyquire('./index', {
            './getModel': {
                getModels: mockGetModel
            }
        });
        process.env[`TABLE_NAME_DEFAULT`] = 'default';
        get(event);

        mockGetModel.calledWith('default').should.be.true(mockGetModel.firstCall.toString());

    });

    it("calls get models with no aggregate and no id", async () => {
        const event = {
            path: "/"
        };
        const mockGetModel = sinon.fake.returns({Items: []});
        var {get} = proxyquire('./index', {
            './getModel': {
                getModels: mockGetModel
            }
        });
        process.env[`TABLE_NAME_DEFAULT`] = 'default';
        get(event);

        mockGetModel.calledWith('default').should.be.true(mockGetModel.firstCall.toString());

    });

    it("passes lastEvaluatedKey", async () => {
        const event = {
            path: "/",
            headers: {
                ExclusiveStartKey: 'asdf'
            }
        };
        const mockGetModel = sinon.fake.returns({Items: []});
        var {get} = proxyquire('./index', {
            './getModel': {
                getModels: mockGetModel
            }
        });
        process.env[`TABLE_NAME_DEFAULT`] = 'default';
        get(event);

        let message = mockGetModel.firstCall.toString();
        mockGetModel.calledWith('default', 'asdf').should.be.true(message);

    });


});
