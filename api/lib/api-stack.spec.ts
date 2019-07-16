import 'mocha';
import { ApiStack } from './api-stack';
import {expect, haveResource} from '@aws-cdk/assert';

import { Stack } from '@aws-cdk/core';

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
           
        
    });
});