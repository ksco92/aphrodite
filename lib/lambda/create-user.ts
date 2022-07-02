import {Construct} from 'constructs';
import {
    Code, Function, LayerVersion, Runtime,
} from 'aws-cdk-lib/aws-lambda';
import * as path from 'path';
import {SecurityGroup, SubnetType, Vpc} from 'aws-cdk-lib/aws-ec2';
import {Role} from 'aws-cdk-lib/aws-iam';
import {Duration} from 'aws-cdk-lib';
import Constants from '../constants';

export default function makeCreateUser(
    scope: Construct,
    vpc: Vpc,
    lambdaRole: Role,
    lambdaSecurityGroup: SecurityGroup,
    requirementsLayer: LayerVersion
) {
    return new Function(scope, `${Constants.APP_NAME}${Constants.getStageName()}AphroditeCreateUser2`, {
        code: Code.fromAsset(path.join(__dirname, '../../src')),
        runtime: Runtime.PYTHON_3_9,
        handler: 'lambdas.create_user.create_user',
        vpc,
        vpcSubnets: vpc.selectSubnets({
            subnetType: SubnetType.PRIVATE_WITH_NAT,
        }),
        securityGroups: [
            lambdaSecurityGroup,
        ],
        layers: [
            requirementsLayer,
        ],
        role: lambdaRole,
        functionName: `${Constants.APP_NAME}${Constants.getStageName()}AphroditeCreateUser2`,
        memorySize: 10240,
        environment: {
            SecretName: `${Constants.APP_NAME}${Constants.getStageName()}/rds/${Constants.APP_NAME}${Constants.getStageName()}`,
        },
        timeout: Duration.minutes(15),
    });
}
