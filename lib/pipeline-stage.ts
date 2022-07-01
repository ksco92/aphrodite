import {Stage, StageProps} from 'aws-cdk-lib';
import {Construct} from 'constructs';
import AphroditeStack from './aphrodite-stack';

export default class AphroditePipelineStage extends Stage {
    constructor(
        scope: Construct,
        id: string,
        appName: string,
        stageName: string,
        props?: StageProps
    ) {
        super(scope, id, props);

        new AphroditeStack(this, `${appName}${stageName}Stack`, appName, stageName);
    }
}
