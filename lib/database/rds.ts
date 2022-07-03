import {Construct} from 'constructs';
import {
    InstanceClass,
    InstanceSize,
    InstanceType,
    SecurityGroup,
    SubnetType,
    Vpc,
} from 'aws-cdk-lib/aws-ec2';
import {HostedZone} from 'aws-cdk-lib/aws-route53';
import {Key} from 'aws-cdk-lib/aws-kms';
import {
    Credentials,
    DatabaseInstance,
    DatabaseInstanceEngine,
    ParameterGroup,
    PostgresEngineVersion,
    SubnetGroup,
} from 'aws-cdk-lib/aws-rds';
import {Secret} from 'aws-cdk-lib/aws-secretsmanager';
import {Duration} from 'aws-cdk-lib';
import Constants from '../constants';

export default function makeRds(
    scope: Construct,
    vpc: Vpc,
    publicHostedZone: HostedZone
) {
    // //////////////////////////////////////////////
    // //////////////////////////////////////////////
    // //////////////////////////////////////////////
    // //////////////////////////////////////////////
    // Security configuration

    const rdsSecretKmsKey = new Key(scope, `${Constants.APP_NAME}${Constants.getStageName()}RDSSecretKMSKey`, {
        enableKeyRotation: true,
    });

    const rdsSecret = new Secret(scope, `${Constants.APP_NAME}${Constants.getStageName()}RDSSecret`, {
        encryptionKey: rdsSecretKmsKey,
        secretName: `${Constants.APP_NAME}${Constants.getStageName()}/rds/${Constants.APP_NAME}${Constants.getStageName()}`,
        generateSecretString: {
            secretStringTemplate: JSON.stringify({
                username: `${Constants.APP_NAME}${Constants.getStageName()}`,
                proxy: `bastion.${publicHostedZone.zoneName}`,
            }),
            generateStringKey: 'password',
            excludeCharacters: '/@," ',
        },
    });

    const rdsKmsKey = new Key(scope, `${Constants.APP_NAME}${Constants.getStageName()}RDSKMSKey`, {
        enableKeyRotation: true,
    });

    const rdsSubnetGroup = new SubnetGroup(scope, `${Constants.APP_NAME}${Constants.getStageName()}RDSSubnetGroup`, {
        description: `${Constants.APP_NAME}${Constants.getStageName()}RDSSubnetGroup`,
        vpc,
        subnetGroupName: `${Constants.APP_NAME}${Constants.getStageName()}RDSSubnetGroup`,
        vpcSubnets: {
            subnetType: SubnetType.PRIVATE_WITH_NAT,
        },
    });

    const rdsSecurityGroup = new SecurityGroup(scope, `${Constants.APP_NAME}${Constants.getStageName()}RDSSecurityGroup`, {
        vpc,
        securityGroupName: `${Constants.APP_NAME}${Constants.getStageName()}RDSSecurityGroup`,
    });

    const rdsParameterGroup = new ParameterGroup(scope, `${Constants.APP_NAME}${Constants.getStageName()}RDSPGParameterGroup`, {
        engine: DatabaseInstanceEngine.postgres({
            version: PostgresEngineVersion.VER_14_1,
        }),
        parameters: {
            max_connections: '10000',
        },
    });

    // //////////////////////////////////////////////
    // //////////////////////////////////////////////
    // //////////////////////////////////////////////
    // //////////////////////////////////////////////
    // DB instance

    const rdsInstancePort = 5432;

    const rdsInstance = new DatabaseInstance(scope, `${Constants.APP_NAME}${Constants.getStageName()}RDSInstance`, {
        engine: DatabaseInstanceEngine.postgres({
            version: PostgresEngineVersion.VER_14_1,
        }),
        vpc,
        allocatedStorage: 10,
        credentials: Credentials.fromSecret(rdsSecret),
        databaseName: `${Constants.APP_NAME}${Constants.getStageName()}`,
        instanceIdentifier: `${Constants.APP_NAME}${Constants.getStageName()}`,
        instanceType: InstanceType.of(InstanceClass.T3, InstanceSize.MICRO),
        port: rdsInstancePort,
        securityGroups: [
            rdsSecurityGroup,
        ],
        storageEncryptionKey: rdsKmsKey,
        subnetGroup: rdsSubnetGroup,
        vpcSubnets: {
            subnetType: SubnetType.PRIVATE_WITH_NAT,
        },
        parameterGroup: rdsParameterGroup,
        monitoringInterval: Duration.seconds(5),
    });

    // Rotate master credentials every week
    // rdsInstance.addRotationSingleUser({
    //     excludeCharacters: '/@," ',
    //     automaticallyAfter: Duration.days(7),
    // });

    // //////////////////////////////////////////////
    // //////////////////////////////////////////////
    // //////////////////////////////////////////////
    // //////////////////////////////////////////////

    return {
        rdsInstance,
        rdsSecurityGroup,
        rdsInstancePort,
        rdsSecret,
    };
}
