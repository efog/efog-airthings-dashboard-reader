const core = require("@aws-cdk/core");
const dynamodb = require("@aws-cdk/aws-dynamodb");
const iam = require("@aws-cdk/aws-iam");
const lambda = require("@aws-cdk/aws-lambda");
const { Duration } = require("@aws-cdk/core");

class DevicesDataUpsertLambda extends core.Construct {
    constructor(scope, id, props = {
        "environment": "dev",
        "layerVersion": null
    }) {
        super(scope, id);
        const handler = new lambda.Function(this, "devices-data-upsert-func", {
            "runtime": lambda.Runtime.NODEJS_12_X,
            "code": lambda.Code.fromAsset("resources", {
                "exclude": ["node_modules"]
            }),
            "handler": "devices-data-upsert-func.main",
            "layers": [props.layerVersion],
            "environment": {
                "DEBUG": "*,-not_this",
                "ENVIRONMENT": props.environment
            },
            "functionName": `devices-data-upsert-func-${props.environment}`,
            "timeout": Duration.seconds(60)
        });
    }
}

module.exports = { DevicesDataUpsertLambda };