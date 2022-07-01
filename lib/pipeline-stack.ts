import {Stack, StackProps} from 'aws-cdk-lib';
import {Construct} from 'constructs';
import {CodeBuildStep, CodePipeline, CodePipelineSource} from 'aws-cdk-lib/pipelines';
import AphroditePipelineStage from './pipeline-stage';

export default class AphroditePipelineStack extends Stack {
    constructor(
        scope: Construct,
        id: string,
        appName: string,
        props?: StackProps
    ) {
        super(scope, id, props);

        const pipeline = new CodePipeline(this, `${appName}Pipeline`, {
            pipelineName: `${appName}Pipeline`,
            synth: new CodeBuildStep('SynthStep', {
                input: CodePipelineSource.connection(
                    'ksco92/aphrodite',
                    'master',
                    {
                        connectionArn:
                            'arn:aws:codestar-connections:us-east-1:200400004453:connection/f706a3ab-dec5-4a50-9152-ad1f695605f6',
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

        const beta = new AphroditePipelineStage(this, `${appName}BetaDeployStage`, appName, 'beta');
        pipeline.addStage(beta);
    }
}
