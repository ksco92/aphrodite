import {Construct} from 'constructs';
import {Vpc} from 'aws-cdk-lib/aws-ec2';
import Constants from '../constants';

export default function makeVpc(scope: Construct) {
    return new Vpc(scope, `${Constants.APP_NAME}${Constants.getStageName()}VPC`, {
        cidr: '10.0.0.0/16',
        vpcName: `${Constants.APP_NAME}${Constants.getStageName()}VPC`,
    });
}
