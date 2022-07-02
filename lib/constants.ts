export default class Constants {
    static readonly APP_NAME = 'aphrodite';

    // TODO: Change this to be dynamic based on the AWS account id
    static getCodeStarId() {
        return '5be6584b-5c78-407a-91e9-bcc4c053c5e9';
    }

    // TODO: Change this to be dynamic based on the AWS account id
    static getStageName() {
        return 'beta';
    }
}
