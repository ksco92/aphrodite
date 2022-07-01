import {Construct} from 'constructs';
import makeVpc from './networking/vpc';


export interface AphroditeProps {
    appName: string,
    stageName: string,
}

export class Aphrodite extends Construct {
    appName: string;

    stageName: string;

    constructor(scope: Construct, id: string, props: AphroditeProps) {
        super(scope, id);
        this.appName = props.appName;
        this.stageName = props.stageName;

        makeVpc(this, this.appName, this.stageName);
    }
}
