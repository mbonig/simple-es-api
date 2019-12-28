import 'mocha';
import {ApiStack} from './api-stack';
import {expect, haveResource, Assertion, beASupersetOfTemplate, haveResourceLike} from '@aws-cdk/assert';
import 'should';
import {Stack, IConstruct} from '@aws-cdk/core';
import {RestApi, Resource, CfnRestApi} from '@aws-cdk/aws-apigateway';
import {AttributeType, StreamViewType, Table} from "@aws-cdk/aws-dynamodb";

describe('API Stack', () => {
    let stack: any;

    let partitionKey = 'testName';
    let AGGREGATORS: string[];
    beforeEach(() => {
        const mockApp = new Stack();
        mockApp.node.setContext('s3_deploy_bucket', 'testing-bucket');

        mockApp.node.setContext('lambda_hash', '');
        AGGREGATORS = ['default', 'sales'];
        stack = new ApiStack(mockApp, 'testing', {
            aggregators: AGGREGATORS,
            withLambdas: true,
            buildAPIGateway: true,
            modelName: 'testingModel',
            partitionKey
        });

    });

    describe('api gateway', () => {

        it('Creates API Gateway ', () => {
            expect(stack).to(haveResource("AWS::ApiGateway::RestApi", {
                Name: 'simple-es-model-api'
            }));

            // rootMethod.resource.path.should.be.equal("/");
            // rootMethod.httpMethod.should.be.equal("POST");
        });

        it('Creates api resource', () => {
            expect(stack).to(haveResource('AWS::ApiGateway::Resource', {
                "PathPart": "{proxy+}"
            }));
        });

        it('Creates api method to lambda for POST', () => {
            expect(stack).to(haveResourceLike('AWS::ApiGateway::Method', {
                "HttpMethod": "POST",
                "AuthorizationType": "NONE",
                "Integration": {
                    "IntegrationHttpMethod": "POST",
                    "Type": "AWS_PROXY",
                }
            }));
        });

        it('Creates api method to lambda for GET', () => {
            expect(stack).to(haveResourceLike('AWS::ApiGateway::Method', {
                "HttpMethod": "GET",
                "AuthorizationType": "NONE",
                "Integration": {
                    "IntegrationHttpMethod": "POST",
                    "Type": "AWS_PROXY",
                }
            }));
        });

        it('Creates API deployment', () => {
            expect(stack).to(haveResourceLike('AWS::ApiGateway::Deployment'));
        });

        it('Creates API stage', () => {
            expect(stack).to(haveResourceLike('AWS::ApiGateway::Stage'));
        });

        it('Creates API account', () => {
            expect(stack).to(haveResourceLike('AWS::ApiGateway::Account'));
        });

    });

    describe('dynamodb table', () => {

        it('Passes aggregator tables names to get function', () => {
            const getFunction: IConstruct = stack.node.findChild('get-function');

        });

        it('creates one dynamodb table with RANGE key default', () => {
            expect(stack).to(haveResource(
                "AWS::DynamoDB::Table",
                {
                    "KeySchema": [
                        {
                            "AttributeName": partitionKey,
                            "KeyType": "HASH"
                        },
                        {
                            "AttributeName": "timestamp",
                            "KeyType": "RANGE"
                        }
                    ],
                    "AttributeDefinitions": [
                        {
                            "AttributeName": partitionKey,
                            "AttributeType": "S"
                        },
                        {
                            "AttributeName": "timestamp",
                            "AttributeType": "S"
                        },
                        {
                            "AttributeName": "aggregateName",
                            "AttributeType": "S"
                        }
                    ]
                }
            ));
        });

        it('creates one dynamodb table with RANGE key override', () => {

            const mockApp = new Stack();

            let sortKey = "docType";
            stack = new ApiStack(mockApp, 'testing', {

                aggregators: ['default'],
                withLambdas: true,
                buildAPIGateway: false,
                modelName: 'testingModel',
                partitionKey,
                sortKey
            });

            expect(stack).to(haveResource(
                "AWS::DynamoDB::Table",
                {
                    "KeySchema": [
                        {
                            "AttributeName": partitionKey,
                            "KeyType": "HASH"
                        },
                        {
                            "AttributeName": sortKey,
                            "KeyType": "RANGE"
                        }
                    ],
                    "AttributeDefinitions": [
                        {
                            "AttributeName": partitionKey,
                            "AttributeType": "S"
                        },
                        {
                            "AttributeName": sortKey,
                            "AttributeType": "S"
                        },
                        {
                            "AttributeName": "aggregateName",
                            "AttributeType": "S"
                        }

                    ]
                }
            ));
        });

        it('creates only one dynamodb table', () => {
            let tables = stack.node.children.filter((x: IConstruct) => x instanceof Table);
            tables.length.should.be.equal(1);
        });

    });

    describe('lambdas',()=>{
        it('Creates lambda CREATE function', () => {
            expect(stack).to(haveResourceLike('AWS::Lambda::Function', {
                "Handler": "handlers/create.handler",
                "Runtime": "nodejs10.x",
                "Environment": {
                    "Variables": {
                        "TABLE_NAME": {
                            "Ref": "testingModel07DEE577"
                        },
                        "PARTITION_KEY": partitionKey,
                        "SORT_KEY": "timestamp"
                    }
                }
            }));
        });

        it('Creates lambda GET function', () => {
            expect(stack).to(haveResourceLike('AWS::Lambda::Function', {
                "Handler": "handlers/get.handler",
                "Runtime": "nodejs10.x",
                "Environment": {
                    "Variables": {
                        "TABLE_NAME": {
                            "Ref": "testingModel07DEE577"
                        },
                        "AGGREGATORS": JSON.stringify(AGGREGATORS),
                        "PARTITION_KEY": partitionKey,
                        "SORT_KEY": "timestamp"
                    }
                }
            }));
        });

        it('Creates lambda aggregator function', () => {
            expect(stack).to(haveResourceLike('AWS::Lambda::Function', {
                "Handler": "handlers/aggregator.handler",
                "Runtime": "nodejs10.x",
                "Environment": {
                    "Variables": {
                        "TABLE_NAME": {
                            "Ref": "testingModel07DEE577"
                        },
                        "PARTITION_KEY": partitionKey,
                        "SORT_KEY": "timestamp"
                    }
                }
            }));
        });

    });
});

