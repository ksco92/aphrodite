import {Construct} from 'constructs';
import {
    AmazonLinuxGeneration,
    AmazonLinuxImage,
    Instance,
    InstanceClass,
    InstanceSize,
    InstanceType,
    SecurityGroup,
    SubnetType,
    UserData,
    Vpc,
} from 'aws-cdk-lib/aws-ec2';
import {CnameRecord, IHostedZone} from 'aws-cdk-lib/aws-route53';
import {Role, ServicePrincipal} from 'aws-cdk-lib/aws-iam';
import {readFileSync} from 'fs';
import {Duration} from 'aws-cdk-lib';
import Constants from '../constants';

export default function makeBastion(
    scope: Construct,
    vpc: Vpc,
    rdsSecurityGroup: SecurityGroup,
    rdsPort: number,
    rdsEndPoint: string,
    publicHostedZone: IHostedZone
) {
    // //////////////////////////////////////////////
    // //////////////////////////////////////////////
    // //////////////////////////////////////////////
    // //////////////////////////////////////////////
    // Security configuration

    const bastionSecurityGroup = new SecurityGroup(scope, `${Constants.APP_NAME}${Constants.getStageName()}BastionSecurityGroup`, {
        vpc,
        securityGroupName: `${Constants.APP_NAME}${Constants.getStageName()}BastionSecurityGroup`,
    });

    const role = new Role(scope, `${Constants.APP_NAME}${Constants.getStageName()}BastionIAMRole`, {
        assumedBy: new ServicePrincipal('ec2.amazonaws.com'),
        roleName: `${Constants.APP_NAME}${Constants.getStageName()}BastionIAMRole`,
    });

    // //////////////////////////////////////////////
    // //////////////////////////////////////////////
    // //////////////////////////////////////////////
    // //////////////////////////////////////////////
    // Bastion instance

    let userDataScript = readFileSync('./lib/networking/bastion-user-data.sh', 'utf-8');
    userDataScript = userDataScript.split('<actual_postgres_port>')
        .join(rdsPort.toString());
    userDataScript = userDataScript.split('<actual_postgres_endpoint>')
        .join(rdsEndPoint);

    const instance = new Instance(scope, `${Constants.APP_NAME}${Constants.getStageName()}Bastion`, {
        instanceType: InstanceType.of(InstanceClass.T3, InstanceSize.NANO),
        machineImage: new AmazonLinuxImage({
            generation: AmazonLinuxGeneration.AMAZON_LINUX_2,
        }),
        vpc,
        instanceName: `${Constants.APP_NAME}${Constants.getStageName()}Bastion`,
        keyName: `${Constants.APP_NAME}${Constants.getStageName()}BastionKeyPair`,
        securityGroup: bastionSecurityGroup,
        vpcSubnets: {
            subnetType: SubnetType.PUBLIC,
        },
        role,
        userData: UserData.custom(userDataScript),
        userDataCausesReplacement: true,
    });

    // //////////////////////////////////////////////
    // //////////////////////////////////////////////
    // //////////////////////////////////////////////
    // //////////////////////////////////////////////
    // DNS assignment

    new CnameRecord(scope, `${Constants.APP_NAME}${Constants.getStageName()}BastionCNAME`, {
        domainName: instance.instancePublicDnsName,
        zone: publicHostedZone,
        recordName: `bastion.${publicHostedZone.zoneName}`,
        ttl: Duration.seconds(60),
    });

    // //////////////////////////////////////////////
    // //////////////////////////////////////////////
    // //////////////////////////////////////////////
    // //////////////////////////////////////////////

    return {
        bastionInstance: instance,
        bastionSecurityGroup,
        bastionRole: role,
    };
}
