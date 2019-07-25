#!/usr/bin/env node
import 'source-map-support/register';
import { CicdStack } from '../lib/cicd-stack';
import { App } from '@aws-cdk/core';

const app = new App();
const name = process.env.STACK_NAME || "cicd-simple-es-api";

new CicdStack(app, name, {
    apiName: name
});
