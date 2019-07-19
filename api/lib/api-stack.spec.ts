import 'mocha';
import { ApiStack } from './api-stack';
import {expect, haveResource, Assertion} from '@aws-cdk/assert';

import { Stack, IConstruct } from '@aws-cdk/core';
import { RestApi } from '@aws-cdk/aws-apigateway';

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
        console.log(apiNode.methods[0].resource.path);
        console.log(apiNode.methods[0].httpMethod);
    });
});