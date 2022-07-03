import {Construct} from 'constructs';
import {
    InstanceClass, InstanceSize, InstanceType, SecurityGroup, SubnetType, Vpc,
} from 'aws-cdk-lib/aws-ec2';
import {HostedZone} from 'aws-cdk-lib/aws-route53';
import {Key} from 'aws-cdk-lib/aws-kms';
import {
    AuroraPostgresEngineVersion,
    DatabaseCluster,
    DatabaseClusterEngine,
    ParameterGroup,
    SubnetGroup,
} from 'aws-cdk-lib/aws-rds';
import {Secret, SecretRotation, SecretRotationApplication} from 'aws-cdk-lib/aws-secretsmanager';
import {Duration, RemovalPolicy} from 'aws-cdk-lib';
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

    const rdsParameterGroup = new ParameterGroup(scope, `${Constants.APP_NAME}${Constants.getStageName()}RDSParameterGroup`, {
        engine: DatabaseClusterEngine.auroraPostgres({
            version: AuroraPostgresEngineVersion.VER_13_6,
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

    const rdsClusterPort = 5432;

    const rdsCluster = new DatabaseCluster(scope, `${Constants.APP_NAME}${Constants.getStageName()}RDSCluster`, {
        engine: DatabaseClusterEngine.auroraPostgres({
            version: AuroraPostgresEngineVersion.VER_13_6,
        }),
        instanceProps: {
            vpc,
            enablePerformanceInsights: true,
            instanceType: InstanceType.of(InstanceClass.T3, InstanceSize.MEDIUM),
            parameterGroup: rdsParameterGroup,
            performanceInsightEncryptionKey: rdsKmsKey,
            publiclyAccessible: false,
            securityGroups: [
                rdsSecurityGroup,
            ],
            vpcSubnets: {
                subnetType: SubnetType.PRIVATE_WITH_NAT,
            },
        },
        clusterIdentifier: `${Constants.APP_NAME}${Constants.getStageName()}RDSCluster`,
        defaultDatabaseName: `${Constants.APP_NAME}${Constants.getStageName()}`,
        instances: 1,
        port: rdsClusterPort,
        removalPolicy: RemovalPolicy.DESTROY,
        storageEncryptionKey: rdsKmsKey,
        subnetGroup: rdsSubnetGroup,
    });

    // Rotate master credentials every week
    new SecretRotation(scope, `${Constants.APP_NAME}${Constants.getStageName()}RDSClusterSecretRotation`, {
        application: SecretRotationApplication.POSTGRES_ROTATION_SINGLE_USER,
        secret: rdsSecret,
        target: rdsCluster,
        vpc,
        excludeCharacters: '/@," ',
        automaticallyAfter: Duration.days(7),
    });

    // const rdsCluster = new ServerlessCluster(scope, `${Constants.APP_NAME}
    // ${Constants.getStageName()}RDSServerlessCluster`, {
    //     engine: DatabaseClusterEngine.AURORA_POSTGRESQL,
    //     parameterGroup: ParameterGroup.fromParameterGroupName(scope,
    //     'ParameterGroup', 'default.aurora-postgresql10'),
    //     clusterIdentifier: `${Constants.APP_NAME}${Constants
    //     .getStageName()}rdsserverlesscluster`,
    //     credentials: Credentials.fromSecret(rdsSecret),
    //     defaultDatabaseName: `${Constants.APP_NAME}${Constants.getStageName()}`,
    //     enableDataApi: true,
    //     removalPolicy: RemovalPolicy.DESTROY,
    //     scaling: {
    //         minCapacity: AuroraCapacityUnit.ACU_2,
    //         maxCapacity: AuroraCapacityUnit.ACU_4,
    //     },
    //     securityGroups: [
    //         rdsSecurityGroup,
    //     ],
    //     storageEncryptionKey: rdsKmsKey,
    //     subnetGroup: rdsSubnetGroup,
    //     vpc,
    //     vpcSubnets: {
    //         subnetType: SubnetType.PRIVATE_WITH_NAT,
    //     },
    // });

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
