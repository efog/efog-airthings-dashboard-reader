const core = require("@aws-cdk/core");
const lambda = require("@aws-cdk/aws-lambda");

class AirthingsPoller extends core.Construct {
    constructor(scope, id) {
        super(scope, id);
  
        const handler = new lambda.Function(this, "AirthingsPoller", {
            "runtime": lambda.Runtime.NODEJS_12_X, 
            "code": lambda.Code.asset("resources"),
            "handler": "airthingsapi-poller-func.main",
            "environment": {
                "USERNAME": process.env.USERNAME,
                "PASSWORD": process.env.PASSWORD,
                "DEBUG": "*,-not_this"
            }
        });
    }
}
  
module.exports = { AirthingsPoller };