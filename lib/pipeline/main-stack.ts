import {Stack, StackProps} from 'aws-cdk-lib';
import {Construct} from 'constructs';
import Aphrodite from '../aphrodite';
import Constants from '../constants';

export default class MainStack extends Stack {
    constructor(
        scope: Construct,
        id: string,
        props?: StackProps
    ) {
        super(scope, id, props);

        new Aphrodite(this, `${Constants.APP_NAME}${Constants.getStageName()}`);
    }
}
