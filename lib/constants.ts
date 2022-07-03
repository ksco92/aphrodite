export default class Constants {
    static readonly APP_NAME = 'aphrodite';

    static readonly LAMBDA_MEMORY = 1024;

    // TODO: Change this to be dynamic based on the AWS account id
    static getCodeStarId() {
        return '3f38aaf9-45ad-4362-9b0e-c4a9ba646857';
    }

    // TODO: Change this to be dynamic based on the AWS account id
    static getStageName() {
        return 'beta';
    }
}
