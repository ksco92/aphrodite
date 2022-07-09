import {Construct} from 'constructs';
import {Certificate, CertificateValidation} from 'aws-cdk-lib/aws-certificatemanager';
import {IHostedZone} from 'aws-cdk-lib/aws-route53';
import Constants from '../constants';

export default function makeCertificate(
    scope: Construct,
    publicHostedZone: IHostedZone
) {
    return new Certificate(scope, `${Constants.APP_NAME}${Constants.getStageName()}Certificate`, {
        domainName: publicHostedZone.zoneName,
        validation: CertificateValidation.fromDns(publicHostedZone),
        subjectAlternativeNames: [
            `*.${publicHostedZone.zoneName}`,
        ],
    });
}
