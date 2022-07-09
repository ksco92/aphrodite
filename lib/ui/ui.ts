import {BlockPublicAccess, Bucket} from 'aws-cdk-lib/aws-s3';
import {Key} from 'aws-cdk-lib/aws-kms';
import {Construct} from 'constructs';
import {RemovalPolicy, Stack} from 'aws-cdk-lib';
import {
    AllowedMethods, Distribution, OriginAccessIdentity, ViewerProtocolPolicy,
} from 'aws-cdk-lib/aws-cloudfront';
import {S3Origin} from 'aws-cdk-lib/aws-cloudfront-origins';
import {Certificate} from 'aws-cdk-lib/aws-certificatemanager';
import {ARecord, IHostedZone, RecordTarget} from 'aws-cdk-lib/aws-route53';
import {CloudFrontTarget} from 'aws-cdk-lib/aws-route53-targets';
import Constants from '../constants';

export default function makeUi(
    scope: Construct,
    certificate: Certificate,
    publicHostedZone: IHostedZone
) {
    const uiBucketKey = new Key(scope, `${Constants.APP_NAME}${Constants.getStageName()}UIBucketKMSKey`, {
        enableKeyRotation: true,
    });

    const uiBucket = new Bucket(scope, `${Constants.APP_NAME}${Constants.getStageName()}UIBucket`, {
        blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
        publicReadAccess: false,
        bucketName: publicHostedZone.zoneName,
        encryptionKey: uiBucketKey,
        enforceSSL: true,
        removalPolicy: RemovalPolicy.DESTROY,
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
        recordName: `${Constants.getStageName()}.${publicHostedZone.zoneName}`,
        target: RecordTarget.fromAlias(new CloudFrontTarget(uiDistribution)),
        zone: publicHostedZone,
    });
}
