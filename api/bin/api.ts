#!/usr/bin/env node
import 'source-map-support/register';
import cdk = require('@aws-cdk/core');
import { ApiStack } from '../lib/api-stack';

const app = new cdk.App();
new ApiStack(app, 'ApiStack');
