import {Construct} from 'constructs';
import {Vpc} from 'aws-cdk-lib/aws-ec2';

export default function makeVpc(scope: Construct, appName: string, stageName: string) {
    return new Vpc(scope, `${appName}${stageName}VPC`, {
        cidr: '10.0.0.0/16',
        vpcName: `${appName}${stageName}VPC`,
    });
}
