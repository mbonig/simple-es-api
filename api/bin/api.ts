#!/usr/bin/env node
import 'source-map-support/register';
import cdk = require('@aws-cdk/core');
import {ApiStack, ApiStackProps} from '../lib/api-stack';
import {RequestAuthorizer} from "@aws-cdk/aws-apigateway";

const app = new cdk.App();
const index = require('../handlers/lib/events');
const aggregators = Object.keys(index.eventHandlers);

const props : ApiStackProps= {
    buildAPIGateway: true,
    aggregators,
    ...require('../apiStack.props.json')
};

new ApiStack(app, `${props.modelName}-api`, props);
