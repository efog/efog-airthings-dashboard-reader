const core = require("@aws-cdk/core");
const dynamodb = require("@aws-cdk/aws-dynamodb");

class DevicesTable extends core.Construct {
    constructor(scope, id, environment = "dev") {
        super(scope, id);
        const devicesTable = new dynamodb.Table(this, "DevicesDataTable", {
            "partitionKey": {
                "name": "deviceid",
                "type": dynamodb.AttributeType.STRING,
            },
            "billingMode": dynamodb.BillingMode.PAY_PER_REQUEST,
            "encryption": dynamodb.TableEncryption.AWS_MANAGED,
            "tableName": `airthingsapipoller-devicesdata-${environment}`
        });
        devicesTable.env = environment;
        this._devicesTable = devicesTable;
    }
}

module.exports = { DevicesTable };