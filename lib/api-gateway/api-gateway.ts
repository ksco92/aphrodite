import {Construct} from 'constructs';
import {
    Deployment, LambdaIntegration, LambdaRestApi, Model, PassthroughBehavior,
} from 'aws-cdk-lib/aws-apigateway';
import {Function} from 'aws-cdk-lib/aws-lambda';
import * as fs from 'fs';
import {ARecord, HostedZone, RecordTarget} from 'aws-cdk-lib/aws-route53';
import {Certificate} from 'aws-cdk-lib/aws-certificatemanager';
import {ApiGateway} from 'aws-cdk-lib/aws-route53-targets';
import Constants from '../constants';

export default function makeApiGateway(
    scope: Construct,
    publicHostedZone: HostedZone,
    functions: Function[],
    certificate: Certificate,
    domainName: string
) {
    const requestTemplate = fs.readFileSync('./lib/api-gateway/mapping_template.txt', 'utf8');

    const api = new LambdaRestApi(scope, `${Constants.APP_NAME}${Constants.getStageName()}API`, {
        proxy: false,
        handler: functions[0],
        domainName: {
            certificate,
            domainName: `api.${domainName}`,
        },
    });

    new Deployment(scope, `${Constants.APP_NAME}${Constants.getStageName()}APIDeployment`, {
        api,
    });

    new ARecord(scope, `${Constants.APP_NAME}${Constants.getStageName()}APIARecord`, {
        recordName: `api.${domainName}`,
        zone: publicHostedZone,
        target: RecordTarget.fromAlias(new ApiGateway(api)),
    });

    // //////////////////////////////////////////////
    // //////////////////////////////////////////////
    // //////////////////////////////////////////////
    // //////////////////////////////////////////////
    // Create user

    const createUserResource = api.root.addResource('create_user');

    const createUserIntegration = new LambdaIntegration(functions[0], {
        proxy: true,
        integrationResponses: [
            {
                statusCode: '500',
                selectionPattern: '.*[ERROR].*',
            },
            {
                statusCode: '200',
            },
        ],
        passthroughBehavior: PassthroughBehavior.WHEN_NO_MATCH,
        requestTemplates: {
            'application/json': requestTemplate,
        },
    });

    const createUserPostMethod = createUserResource.addMethod('POST', createUserIntegration);

    createUserPostMethod.addMethodResponse({
        statusCode: '500',
        responseModels: {
            'application/json': Model.EMPTY_MODEL,
        },
    });

    createUserPostMethod.addMethodResponse({
        statusCode: '200',
        responseModels: {
            'application/json': Model.EMPTY_MODEL,
        },
    });

    // //////////////////////////////////////////////
    // //////////////////////////////////////////////
    // //////////////////////////////////////////////
    // //////////////////////////////////////////////
    // Get user

    const getUserResource = api.root.addResource('get_user');

    const getUserIntegration = new LambdaIntegration(functions[1], {
        proxy: true,
        integrationResponses: [
            {
                statusCode: '500',
                selectionPattern: '.*[ERROR].*',
            },
            {
                statusCode: '200',
            },
            {
                statusCode: '404',
                selectionPattern: '.*[NOT_FOUND].*',
            },
        ],
        passthroughBehavior: PassthroughBehavior.WHEN_NO_MATCH,
        requestTemplates: {
            'application/json': requestTemplate,
        },
    });

    const getUserGetMethod = getUserResource.addMethod('GET', getUserIntegration);

    getUserGetMethod.addMethodResponse({
        statusCode: '500',
        responseModels: {
            'application/json': Model.EMPTY_MODEL,
        },
    });

    getUserGetMethod.addMethodResponse({
        statusCode: '200',
        responseModels: {
            'application/json': Model.EMPTY_MODEL,
        },
    });

    getUserGetMethod.addMethodResponse({
        statusCode: '404',
        responseModels: {
            'application/json': Model.EMPTY_MODEL,
        },
    });
}
