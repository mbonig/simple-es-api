import 'mocha';
import { ApiStack } from './api-stack';
import { expect, haveResource, Assertion, beASupersetOfTemplate } from '@aws-cdk/assert';

import { Stack, IConstruct } from '@aws-cdk/core';
import { RestApi, Resource, CfnRestApi } from '@aws-cdk/aws-apigateway';

describe('the api ', () => {
    it('Creates API Gateway with AWS integration', () => {
        const mockApp = new Stack();
        mockApp.node.setContext('s3_deploy_bucket', 'testing-bucket');
        mockApp.node.setContext('lambda_hash', '');
        const stack = new ApiStack(mockApp, 'testing', {
            aggregators: ['default'],
            buildAPIGateway: true
        });

        // console.dir(stack.node.children[4]);
        expect(stack).to(haveResource("AWS::ApiGateway::RestApi"));
        const apiNode: IConstruct = stack.node.findChild('simple-es-model-api');
        apiNode.should.be.ok();

        console.log(apiNode instanceof RestApi);
        const rootMethod = (apiNode as any).methods[0];
        rootMethod.resource.path.should.be.equal("/");
        rootMethod.httpMethod.should.be.equal("POST");

        // console.log(stack.node);

        expect(stack).to(beASupersetOfTemplate({
            Resources: {
                "simpleesmodelapi5E7C0D18": {
                    "Type": "AWS::ApiGateway::RestApi",
                    "Properties": {
                        "Name": "simple-es-model-api"
                    }
                }
            }
        }));
    });
});