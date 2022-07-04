import {Construct} from 'constructs';
import {
    Deployment,
    LambdaIntegration,
    LambdaRestApi,
    Model,
    PassthroughBehavior,
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
    // Create resources

    const functionsAndPaths = [
        {
            path: 'create_user',
            method: 'POST',
            lambda: functions[0],
        },
        {
            path: 'get_user',
            method: 'GET',
            lambda: functions[1],
        },
        {
            path: 'add_marker',
            method: 'POST',
            lambda: functions[2],
        },
        {
            path: 'get_calendar',
            method: 'GET',
            lambda: functions[3],
        },
    ];

    functionsAndPaths.forEach((func) => {
        const resource = api.root.addResource(func.path);

        const integration = new LambdaIntegration(func.lambda, {
            proxy: true,
            integrationResponses: [
                {
                    statusCode: '500',
                    selectionPattern: '.*[ERROR].*',
                },
                {
                    statusCode: '400',
                    selectionPattern: '.*[BAD_REQUEST].*',
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

        const method = resource.addMethod(func.method, integration);

        method.addMethodResponse({
            statusCode: '500',
            responseModels: {
                'application/json': Model.EMPTY_MODEL,
            },
        });

        method.addMethodResponse({
            statusCode: '400',
            responseModels: {
                'application/json': Model.EMPTY_MODEL,
            },
        });

        method.addMethodResponse({
            statusCode: '200',
            responseModels: {
                'application/json': Model.EMPTY_MODEL,
            },
        });
    });
}
