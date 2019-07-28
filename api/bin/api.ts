#!/usr/bin/env node
import 'source-map-support/register';
import cdk = require('@aws-cdk/core');
import { ApiStack } from '../lib/api-stack';

const app = new cdk.App();
const index = require('../handlers/lib/events');
const aggregators = Object.keys(index.eventHandlers);

const props = {
    buildAPIGateway: true,
    aggregators,
    ...require('../apiStack.props.json')
};

new ApiStack(app, 'ApiStack', props);
