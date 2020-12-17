const core = require("@aws-cdk/core");
const iam = require("@aws-cdk/aws-iam");
const lambda = require("@aws-cdk/aws-lambda");
const { Duration } = require("@aws-cdk/core");

class OpenWeatherMapPollerLambda extends core.Construct {
    constructor(scope, id, props = {
        "devicedataTable": null,
        "environment": "dev",
        "layerVersion": null
    }) {
        super(scope, id);
        const handler = new lambda.Function(this, "lambda", {
            "runtime": lambda.Runtime.NODEJS_12_X,
            "code": lambda.Code.fromAsset("nodejs", {
                "exclude": ["node_modules"]
            }),
            "handler": "openweathermap-poller-func.main",
            "layers": [props.layerVersion],
            "environment": {
                "DEBUG": "*,-not_this",
                "ENVIRONMENT": props.environment
            },
            "functionName": `openweathermap-poller-func-${props.environment}`,
            "timeout": Duration.seconds(60)
        });
        handler.addToRolePolicy(new iam.PolicyStatement({
            "actions": [
                "dynamodb:GetItem"],
            "resources": [props.devicedataTable.tableArn]
        }));
    }
}

module.exports = { OpenWeatherMapPollerLambda };