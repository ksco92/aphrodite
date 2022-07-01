import {Stack, StackProps} from 'aws-cdk-lib';
import {Construct} from 'constructs';
import {Aphrodite} from './aphrodite';

export default class AphroditeStack extends Stack {
    constructor(
        scope: Construct,
        id: string,
        appName: string,
        stageName: string,
        props?: StackProps
    ) {
        super(scope, id, props);

        new Aphrodite(this, `${appName}${stageName}`, {
            appName,
            stageName,
        });
    }
}
