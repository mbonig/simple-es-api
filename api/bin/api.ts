#!/usr/bin/env node
import 'source-map-support/register';
import cdk = require('@aws-cdk/core');
import { ApiStack } from '../lib/api-stack';

const app = new cdk.App();

const props = {
    buildAPIGateway: true,
    aggregators: ['default'],
    ...require('../apiStack.props.json')
};

new ApiStack(app, 'ApiStack', props);
