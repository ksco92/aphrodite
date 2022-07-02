import {Construct} from 'constructs';
import makeVpc from './networking/vpc';

export default class Aphrodite extends Construct {
    constructor(scope: Construct, id: string) {
        super(scope, id);

        makeVpc(this);
    }
}
