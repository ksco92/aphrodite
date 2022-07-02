import {Stage, StageProps} from 'aws-cdk-lib';
import {Construct} from 'constructs';
import MainStack from './main-stack';
import Constants from '../constants';

export default class PipelineStage extends Stage {
    constructor(
        scope: Construct,
        id: string,
        props?: StageProps
    ) {
        super(scope, id, props);

        new MainStack(this, `${Constants.APP_NAME}${Constants.getStageName()}Stack`);
    }
}
