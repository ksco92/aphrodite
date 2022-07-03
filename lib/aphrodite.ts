import {Construct} from 'constructs';
import {Peer, Port} from 'aws-cdk-lib/aws-ec2';
import makeVpc from './networking/vpc';
import makeHostedZones from './networking/hosted-zones';
import Constants from './constants';
import makeRds from './database/rds';
import makeBastion from './networking/bastion';
import makeLambda from './lambda/lambda';
import makeApiGateway from './api-gateway/api-gateway';

export default class Aphrodite extends Construct {
    constructor(scope: Construct, id: string) {
        super(scope, id);

        let domainName = '';

        if (Constants.getStageName() === 'beta') {
            domainName = `${Constants.getStageName()}aphrodite.ksco92.com`;
        } else {
            domainName = 'aphrodite.ksco92.com';
        }

        const vpc = makeVpc(this);

        const hostedZones = makeHostedZones(this, domainName);

        const rds = makeRds(this, vpc, hostedZones.publicHostedZone);

        const bastion = makeBastion(
            this,
            vpc,
            rds.rdsSecurityGroup,
            rds.rdsInstancePort,
            rds.rdsInstance.instanceEndpoint.hostname,
            hostedZones.publicHostedZone
        );

        const lambda = makeLambda(this, vpc);

        makeApiGateway(this, hostedZones.publicHostedZone, lambda.functions);

        // Allow SSH from anywhere
        bastion.bastionSecurityGroup.addIngressRule(Peer.anyIpv4(), Port.tcp(22));
        bastion.bastionSecurityGroup.addIngressRule(Peer.anyIpv4(), Port.tcp(rds.rdsInstancePort));

        rds.rdsSecurityGroup.addIngressRule(
            bastion.bastionSecurityGroup,
            Port.tcp(rds.rdsInstancePort)
        );

        rds.rdsSecurityGroup.addIngressRule(
            lambda.lambdaSecurityGroup,
            Port.tcp(rds.rdsInstancePort)
        );

        rds.rdsSecret.grantRead(lambda.lambdaRole);
    }
}
