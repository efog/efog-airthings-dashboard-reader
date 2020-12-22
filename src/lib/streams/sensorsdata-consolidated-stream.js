const core = require("@aws-cdk/core");
const firehose = require("@aws-cdk/aws-kinesisfirehose");
const iam = require("@aws-cdk/aws-iam");

class SensorsDataConsolidatedStream extends core.Construct {
    get firehoseWriteRole() {
        return this._firehoseWriteRole;
    }
    constructor(scope, id, props = {
        "environment": "dev",
        "targetBucket": null
    }) {
        super(scope, id);
        const firehoseWriteRole = new iam.Role(this, `sensorsdata-firehosestream-role-${props.environment}`, {
            "assumedBy": new iam.ServicePrincipal("firehose.amazonaws.com"),
            "roleName": `sensorsdata-firehosestream-bucket-role-${props.environment}`,
        });
        const firehoseBucketWriterPolicy = new iam.Policy(this, `sensorsdata-firehosestream-role-policy-${props.environment}`, {
            "policyName": `sensorsdata-firehosestream-role-policy-${props.environment}`,
            "statements": [new iam.PolicyStatement({
                "actions": [
                    "s3:AbortMultipartUpload",
                    "s3:GetBucketLocation",
                    "s3:GetObject",
                    "s3:ListBucket",
                    "s3:ListBucketMultipartUploads",
                    "s3:PutObject"],
                "resources": [        
                    `${props.targetBucket.bucketArn}`,
                    `${props.targetBucket.bucketArn}/*`		    
                ]
            })]
        });
        firehoseWriteRole.attachInlinePolicy(firehoseBucketWriterPolicy);

        const s3DataStream = new firehose.CfnDeliveryStream(this, `sensorsdata-firehosestream-${props.environment}`, {
            "deliveryStreamName": `sensorsdata-firehosestream-${props.environment}`,
            "s3DestinationConfiguration": {
                "bucketArn": props.targetBucket.bucketArn,
                "roleArn": firehoseWriteRole.roleArn
            }
        });

        this._s3DataStream = s3DataStream;
    }
}

module.exports = { SensorsDataConsolidatedStream };