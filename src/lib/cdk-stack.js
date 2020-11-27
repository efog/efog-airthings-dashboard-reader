/* eslint-disable no-new */
const cdk = require("@aws-cdk/core");
const airthingsApiPoller = require("./airthingsapi-poller");

class CdkStack extends cdk.Stack {

    /**
   *
   * @param {cdk.Construct} scope construct
   * @param {string} id stack id
   * @param {cdk.StackProps=} props stack props
   * @returns {undefined}
   */
    // eslint-disable-next-line no-useless-constructor
    constructor(scope, id, props) {
        super(scope, id, props);

        // The code that defines your stack goes here
        new airthingsApiPoller.AirthingsPoller(this, "AirthingsApiPoller");
    }
}

module.exports = { CdkStack };
