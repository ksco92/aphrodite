#!/usr/bin/env node
import {App} from 'aws-cdk-lib';
import PipelineStack from '../lib/pipeline/pipeline-stack';
import Constants from '../lib/constants';

const app = new App();
new PipelineStack(app, `${Constants.APP_NAME}PipelineStack`, {
    stackName: `${Constants.APP_NAME}MainStack`,
});
