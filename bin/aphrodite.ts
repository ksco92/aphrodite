#!/usr/bin/env node
import {App} from 'aws-cdk-lib';
import AphroditePipelineStack from '../lib/pipeline-stack';

const app = new App();
const appName = 'aphrodite';
new AphroditePipelineStack(app, `${appName}PipelineStack`, appName, {
    stackName: `${appName}MainStack`,
});
