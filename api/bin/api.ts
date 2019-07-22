#!/usr/bin/env node
import 'source-map-support/register';
import cdk = require('@aws-cdk/core');
import { ApiStack } from '../lib/api-stack';
import { readdirSync } from 'fs';
const path = require('path');
const app = new cdk.App();

const aggregators = readdirSync(path.resolve('handlers/lib/events'), { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);

const props = {
    buildAPIGateway: true,
    aggregators,
    ...require('../apiStack.props.json')
};

new ApiStack(app, 'ApiStack', props);
