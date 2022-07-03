import {Construct} from 'constructs';
import {SecurityGroup, Vpc} from 'aws-cdk-lib/aws-ec2';
import {ManagedPolicy, Role, ServicePrincipal} from 'aws-cdk-lib/aws-iam';
import {Code, LayerVersion} from 'aws-cdk-lib/aws-lambda';
import * as path from 'path';
import makeCreateUser from './create-user';
import Constants from '../constants';
import makeGetUser from './get-user';

export default function makeLambda(
    scope: Construct,
    vpc: Vpc
) {
    const lambdaRole = new Role(scope, `${Constants.APP_NAME}${Constants.getStageName()}LambdaRole`, {
        roleName: `${Constants.APP_NAME}${Constants.getStageName()}LambdaImportRole`,
        assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
        managedPolicies: [
            ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaVPCAccessExecutionRole'),
        ],
    });

    const lambdaSecurityGroup = new SecurityGroup(scope, `${Constants.APP_NAME}${Constants.getStageName()}LambdaSecurityGroup`, {
        vpc,
        securityGroupName: `${Constants.APP_NAME}${Constants.getStageName()}LambdaSecurityGroup`,
    });

    const mainRequirementsLayer = new LayerVersion(scope, `${Constants.APP_NAME}${Constants.getStageName()}MainRequirementsLayer`, {
        code: Code.fromAsset(path.join(__dirname, '../../requirements.zip')),
    });

    const createUser = makeCreateUser(
        scope,
        vpc,
        lambdaRole,
        lambdaSecurityGroup,
        mainRequirementsLayer
    );

    const getUser = makeGetUser(
        scope,
        vpc,
        lambdaRole,
        lambdaSecurityGroup,
        mainRequirementsLayer
    );

    return {
        lambdaRole,
        lambdaSecurityGroup,
        functions: [
            createUser,
            getUser,
        ],
    };
}
