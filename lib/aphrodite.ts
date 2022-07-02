import {Construct} from 'constructs';
import makeVpc from './networking/vpc';
import makeHostedZones from './networking/hosted-zones';
import Constants from './constants';
import makeRds from './database/rds';

export default class Aphrodite extends Construct {
    constructor(scope: Construct, id: string) {
        super(scope, id);

        let domainName = '';

        if (Constants.getStageName() === 'beta') {
            domainName = 'betacontrol.ksco92.com';
        } else {
            domainName = 'control.ksco92.com';
        }

        const vpc = makeVpc(this);
        const hostedZones = makeHostedZones(this, domainName);
        makeRds(this, vpc, hostedZones.publicHostedZone);
    }
}
