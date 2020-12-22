const core = require("@aws-cdk/core");
const s3 = require("@aws-cdk/aws-s3");

class SensorsDataConsolidatedStorage extends core.Construct {
    get bucket() {
        return this._bucket;
    }
    constructor(scope, id, environment = "dev") {
        super(scope, id);
        const bucket = new s3.Bucket(this, "SensorsDataConsolidatedBucket", {
            "encryption": s3.BucketEncryption.S3_MANAGED,
            "blockPublicAccess": new s3.BlockPublicAccess({
                "blockPublicAcls": true
            })
        });
        this._bucket = bucket;
    }
}

module.exports = { SensorsDataConsolidatedStorage };