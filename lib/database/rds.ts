import {Construct} from 'constructs';
import {SecurityGroup, SubnetType, Vpc} from 'aws-cdk-lib/aws-ec2';
import {HostedZone} from 'aws-cdk-lib/aws-route53';
import {Key} from 'aws-cdk-lib/aws-kms';
import {
    AuroraCapacityUnit, AuroraEngineVersion, AuroraPostgresEngineVersion,
    Credentials,
    DatabaseClusterEngine,
    ParameterGroup,
    ServerlessCluster,
    SubnetGroup,
} from 'aws-cdk-lib/aws-rds';
import {Secret} from 'aws-cdk-lib/aws-secretsmanager';
import {RemovalPolicy} from 'aws-cdk-lib';
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

    // //////////////////////////////////////////////
    // //////////////////////////////////////////////
    // //////////////////////////////////////////////
    // //////////////////////////////////////////////
    // Configuration

    const rdsParameterGroup = new ParameterGroup(scope, `${Constants.APP_NAME}${Constants.getStageName()}RDSParameterGroup`, {
        engine: DatabaseClusterEngine.auroraPostgres({
            version: AuroraPostgresEngineVersion.VER_13_6,
        }),
        parameters: {
            max_connections: '10000',
            password_encryption: 'md5',
        },
    });

    // //////////////////////////////////////////////
    // //////////////////////////////////////////////
    // //////////////////////////////////////////////
    // //////////////////////////////////////////////
    // DB instance

    const rdsClusterPort = 5432;

    const rdsCluster = new ServerlessCluster(scope, `${Constants.APP_NAME}${Constants.getStageName()}RDSServerlessCluster`, {
        engine: DatabaseClusterEngine.auroraPostgres({
            version: AuroraPostgresEngineVersion.VER_13_6,
        }),
        clusterIdentifier: `${Constants.APP_NAME}${Constants.getStageName()}RDSServerlessCluster`,
        credentials: Credentials.fromSecret(rdsSecret),
        defaultDatabaseName: `${Constants.APP_NAME}${Constants.getStageName()}`,
        enableDataApi: true,
        parameterGroup: rdsParameterGroup,
        removalPolicy: RemovalPolicy.DESTROY,
        scaling: {
            minCapacity: AuroraCapacityUnit.ACU_1,
            maxCapacity: AuroraCapacityUnit.ACU_4,
        },
        securityGroups: [
            rdsSecurityGroup,
        ],
        storageEncryptionKey: rdsKmsKey,
        subnetGroup: rdsSubnetGroup,
        vpc,
        vpcSubnets: {
            subnetType: SubnetType.PRIVATE_WITH_NAT,
        },
    });

    // //////////////////////////////////////////////
    // //////////////////////////////////////////////
    // //////////////////////////////////////////////
    // //////////////////////////////////////////////

    return {
        rdsCluster,
        rdsSecurityGroup,
        rdsClusterPort,
        rdsSecret,
    };
}
