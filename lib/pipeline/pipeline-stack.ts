import {Stack, StackProps} from 'aws-cdk-lib';
import {Construct} from 'constructs';
import {CodeBuildStep, CodePipeline, CodePipelineSource} from 'aws-cdk-lib/pipelines';
import PipelineStage from './pipeline-stage';
import Constants from '../constants';

export default class PipelineStack extends Stack {
    constructor(
        scope: Construct,
        id: string,
        props?: StackProps
    ) {
        super(scope, id, props);

        const pipeline = new CodePipeline(this, `${Constants.APP_NAME}Pipeline`, {
            pipelineName: `${Constants.APP_NAME}Pipeline`,
            synth: new CodeBuildStep('SynthStep', {
                input: CodePipelineSource.connection(
                    'ksco92/aphrodite',
                    'master',
                    {
                        connectionArn:
                            `arn:aws:codestar-connections:${Stack.of(this).region}:${Stack.of(this).account}:connection/${Constants.getCodeStarId()}`,
                    }
                ),
                installCommands: [
                    'npm install -g aws-cdk',
                ],
                commands: [
                    'npm ci',
                    'npm run build',
                    'npx cdk synth',
                ],
            }),
        });

        const stage = new PipelineStage(this, `${Constants.APP_NAME}${Constants.getStageName()}DeployStage`);
        pipeline.addStage(stage);
    }
}
