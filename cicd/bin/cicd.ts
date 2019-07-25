#!/usr/bin/env node
import 'source-map-support/register';
import { CicdStack } from '../lib/cicd-stack';
import { App } from '@aws-cdk/core';

const app = new App();
new CicdStack(app, 'CicdStack', {
    apiName: ''
});
