import {Construct} from 'constructs';
import {
    Deployment,
    LambdaIntegration,
    LambdaRestApi,
    Model,
    PassthroughBehavior,
    Stage,
} from 'aws-cdk-lib/aws-apigateway';
import {Function} from 'aws-cdk-lib/aws-lambda';
import * as fs from 'fs';
import {CnameRecord, HostedZone} from 'aws-cdk-lib/aws-route53';
import {Duration} from 'aws-cdk-lib';
import Constants from '../constants';

export default function makeApiGateway(
    scope: Construct,
    publicHostedZone: HostedZone,
    functions: Function[]
) {
    const api = new LambdaRestApi(scope, `${Constants.APP_NAME}${Constants.getStageName()}API`, {
        proxy: false,
        handler: functions[0],
    });

    const createUserResource = api.root.addResource('create_user');

    const requestTemplate = fs.readFileSync('./lib/api-gateway/mapping_template.txt', 'utf8');

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

    const postMethod = createUserResource.addMethod('POST', createUserIntegration);

    postMethod.addMethodResponse({
        statusCode: '500',
        responseModels: {
            'application/json': Model.EMPTY_MODEL,
        },
    });

    postMethod.addMethodResponse({
        statusCode: '200',
        responseModels: {
            'application/json': Model.EMPTY_MODEL,
        },
    });

    const deployment = new Deployment(scope, `${Constants.APP_NAME}${Constants.getStageName()}APIDeployment`, {
        api,
    });

    api.deploymentStage = new Stage(scope, `${Constants.APP_NAME}${Constants.getStageName()}APIStage`, {
        deployment,
        stageName: Constants.getStageName(),
    });

    // //////////////////////////////////////////////
    // //////////////////////////////////////////////
    // //////////////////////////////////////////////
    // //////////////////////////////////////////////
    // DNS assignment

    new CnameRecord(scope, `${Constants.APP_NAME}${Constants.getStageName()}APIGCNAME`, {
        domainName: api.url.split('/')[2],
        zone: publicHostedZone,
        recordName: `api.${publicHostedZone.zoneName}`,
        ttl: Duration.seconds(60),
    });
}
