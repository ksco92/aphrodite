import {BlockPublicAccess, Bucket} from 'aws-cdk-lib/aws-s3';
import {Key} from 'aws-cdk-lib/aws-kms';
import {Construct} from 'constructs';
import {Duration, RemovalPolicy, Stack} from 'aws-cdk-lib';
import {Distribution} from 'aws-cdk-lib/aws-cloudfront';
import {S3Origin} from 'aws-cdk-lib/aws-cloudfront-origins';
import {Certificate} from 'aws-cdk-lib/aws-certificatemanager';
import {CnameRecord, HostedZone} from 'aws-cdk-lib/aws-route53';
import Constants from '../constants';

export default function makeUi(
    scope: Construct,
    certificate: Certificate,
    publicHostedZone: HostedZone
) {
    const uiBucketKey = new Key(scope, `${Constants.APP_NAME}${Constants.getStageName()}UIBucketKMSKey`, {
        enableKeyRotation: true,
    });

    const uiBucket = new Bucket(scope, `${Constants.APP_NAME}${Constants.getStageName()}UIBucket`, {
        blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
        bucketName: `${Constants.APP_NAME}-${Constants.getStageName()}-ui-${Stack.of(scope).account}-${Stack.of(scope).account}`,
        encryptionKey: uiBucketKey,
        enforceSSL: true,
        removalPolicy: RemovalPolicy.DESTROY,
        websiteIndexDocument: 'index.html',
    });

    const uiDistribution = new Distribution(scope, `${Constants.APP_NAME}${Constants.getStageName()}Distribution`, {
        defaultBehavior: {
            origin: new S3Origin(uiBucket),
        },
        certificate,
        domainNames: [
            publicHostedZone.zoneName,
        ],
    });

    new CnameRecord(scope, `${Constants.APP_NAME}${Constants.getStageName()}DistributionCNAME`, {
        domainName: uiDistribution.distributionDomainName,
        zone: publicHostedZone,
        recordName: publicHostedZone.zoneName,
        ttl: Duration.seconds(60),
    });
}
