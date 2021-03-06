import {BlockPublicAccess, Bucket, BucketEncryption} from 'aws-cdk-lib/aws-s3';
import {Construct} from 'constructs';
import {RemovalPolicy} from 'aws-cdk-lib';
import {AllowedMethods, Distribution, OriginAccessIdentity, ViewerProtocolPolicy,} from 'aws-cdk-lib/aws-cloudfront';
import {S3Origin} from 'aws-cdk-lib/aws-cloudfront-origins';
import {Certificate} from 'aws-cdk-lib/aws-certificatemanager';
import {ARecord, IHostedZone, RecordTarget} from 'aws-cdk-lib/aws-route53';
import {CloudFrontTarget} from 'aws-cdk-lib/aws-route53-targets';
import {BucketDeployment, Source} from 'aws-cdk-lib/aws-s3-deployment';
import Constants from '../constants';

export default function makeUi(
    scope: Construct,
    certificate: Certificate,
    publicHostedZone: IHostedZone
) {
    const uiBucket = new Bucket(scope, `${Constants.APP_NAME}${Constants.getStageName()}UIBucket`, {
        blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
        publicReadAccess: false,
        bucketName: publicHostedZone.zoneName,
        encryption: BucketEncryption.S3_MANAGED,
        enforceSSL: true,
        removalPolicy: RemovalPolicy.DESTROY,
        autoDeleteObjects: true,
    });

    const originAccessIdentity = new OriginAccessIdentity(scope, `${Constants.APP_NAME}${Constants.getStageName()}OriginAccessIdentity`);
    uiBucket.grantRead(originAccessIdentity);

    const uiDistribution = new Distribution(scope, `${Constants.APP_NAME}${Constants.getStageName()}Distribution`, {
        defaultBehavior: {
            origin: new S3Origin(uiBucket, {
                originAccessIdentity,
            }),
            allowedMethods: AllowedMethods.ALLOW_ALL,
            viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        },
        certificate,
        domainNames: [
            publicHostedZone.zoneName,
        ],
        defaultRootObject: 'index.html',
    });

    new ARecord(scope, `${Constants.APP_NAME}${Constants.getStageName()}DistributionARecord`, {
        recordName: publicHostedZone.zoneName,
        target: RecordTarget.fromAlias(new CloudFrontTarget(uiDistribution)),
        zone: publicHostedZone,
    });

    new BucketDeployment(scope, `${Constants.APP_NAME}${Constants.getStageName()}UIDeploymentCode`, {
        sources: [
            Source.asset('ui'),
        ],
        destinationBucket: uiBucket,
        distribution: uiDistribution,
        distributionPaths: [
            '/*',
        ],
    });
}
