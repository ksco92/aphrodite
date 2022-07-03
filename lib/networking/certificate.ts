import {Construct} from 'constructs';
import {Certificate, CertificateValidation} from 'aws-cdk-lib/aws-certificatemanager';
import {HostedZone} from 'aws-cdk-lib/aws-route53';
import Constants from '../constants';

export default function makeCertificate(
    scope: Construct,
    domainName: string,
    publicHostedZone: HostedZone
) {
    return new Certificate(scope, `${Constants.APP_NAME}${Constants.getStageName()}Certificate`, {
        domainName,
        validation: CertificateValidation.fromDns(publicHostedZone),
        subjectAlternativeNames: [
            `*.${domainName}`,
        ],
    });
}
