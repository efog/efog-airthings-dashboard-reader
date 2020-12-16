const core = require("@aws-cdk/core");
const dynamodb = require("@aws-cdk/aws-dynamodb");
const events = require("@aws-cdk/aws-events");
const iam = require("@aws-cdk/aws-iam");
const kinesis = require("@aws-cdk/aws-kinesis");
const lambda = require("@aws-cdk/aws-lambda");
const eventsTarget = require("@aws-cdk/aws-events-targets");
const { DevicesTable } = require("./storage/devices-table");
const { Duration } = require("@aws-cdk/core");

class AirthingsPoller extends core.Construct {
    constructor(scope, id, environment = "dev") {
        super(scope, id);
        const devicesTable = new DevicesTable(this, `${id}.Storage`, environment);
        const lambdaLayer = new lambda.LayerVersion(this, "base-functions-layer", {
            "compatibleRuntimes": [lambda.Runtime.NODEJS_12_X],
            "code": new lambda.AssetCode(`${__dirname}/../nodejs.zip`),
            "description": "base lamda layer",
            "layerVersionName": `base-functions-layer-${environment}`
        });
        const airthingApiPollerHandler = new lambda.Function(this, "airthingApiPollerLambda", {
            "runtime": lambda.Runtime.NODEJS_12_X, 
            "code": lambda.Code.fromAsset("nodejs", {
                "exclude": ["node_modules"]
            }),
            "handler": "airthingsapi-poller-func.main",
            "layers": [lambdaLayer],
            "environment": {
                "DEBUG": "*,-not_this",
                "ENVIRONMENT": environment
            },
            "functionName": `airthingsapipoller-func-${environment}`,
            "timeout": Duration.seconds(60)
        });
        this._airthingApiPollerHandler = airthingApiPollerHandler;
        const schedule = events.Schedule.expression("cron(0 * * * ? *)");
        const target = new eventsTarget.LambdaFunction(this._airthingApiPollerHandler, {});
        const rule = new events.Rule(this, "scheduled-trigger-rule", {
            "schedule": schedule,
            "targets": [target],
            "ruleName": `airthingsapipoller-func-scheduled-trigger-rule-${environment}`
        });
        target.bind(rule, `airthingsapipoller-func-scheduled-trigger-rule-binding-${environment}`);
        const sensorsDataTable = new dynamodb.Table(this, "SensorsDataTable", {
            "partitionKey": { 
                "name": "deviceid",
                "type": dynamodb.AttributeType.STRING 
            },
            "sortKey": { 
                "name": "sensortypetimestamp",
                "type": dynamodb.AttributeType.STRING 
            },
            "billingMode": dynamodb.BillingMode.PAY_PER_REQUEST,
            "encryption": dynamodb.TableEncryption.AWS_MANAGED,
            "tableName": `devices-sensorsdata-${environment}`
        });
        sensorsDataTable.env = environment;
        this._sensorsDataTable = sensorsDataTable;
        const loginDataTable = new dynamodb.Table(this, "LoginDataTable", {
            "partitionKey": { 
                "name": "login_type",
                "type": dynamodb.AttributeType.STRING,
            },
            "billingMode": dynamodb.BillingMode.PAY_PER_REQUEST,
            "encryption": dynamodb.TableEncryption.AWS_MANAGED,
            "tableName": `airthingsapipoller-loginsdata-${environment}`
        });
        loginDataTable.env = environment;
        this._loginDataTable = loginDataTable;

        const dataStream = new kinesis.Stream(this, `sensorsdata-stream-${environment}`, {
            "streamName": `sensorsdata-stream-${environment}`
        });
        dataStream.env = environment;
        this._dataStream = dataStream;

        const sensorDataWriteHandler = new lambda.Function(this, "sensorDataWriterLambda", {
            "runtime": lambda.Runtime.NODEJS_12_X, 
            "code": lambda.Code.fromAsset("nodejs", { 
                "exclude": ["node_modules"]
            }),
            "handler": "sensorsdata-writer-func.main",
            "layers": [lambdaLayer],
            "environment": {
                "DEBUG": "*,-not_this",
                "ENVIRONMENT": environment
            },
            "functionName": `sensorsdata-writer-func-${environment}`,
        });
        this._sensorDataWriteHandler = sensorDataWriteHandler;
        this._sensorDataWriteHandlerRole = new iam.Role(this, `sensorsdata-writer-role-${environment}`, {
            "assumedBy": new iam.ServicePrincipal("lambda.amazonaws.com"),
            "roleName": `sensorsdata-writer-role-${environment}`,
        });
        this._sensorDataWriteHandler.role.attachInlinePolicy(new iam.Policy(this, `sensorsdata-writer-role-kinesis-policy-${environment}`, {
            "policyName": `sensorsdata-writer-role-kinesis-policy-${environment}`,
            "statements": [new iam.PolicyStatement({
                "actions": ["kinesis:*"],
                "resources": ["*"]
            })]
        }));
        this._sensorDataWriteHandler.role = this._sensorDataWriteHandlerRole;

        this._dataStream.grantWrite(this._airthingApiPollerHandler);
        this._dataStream.grantReadWrite(this._sensorDataWriteHandlerRole);
        this._dataStream.grantRead(this._sensorDataWriteHandler);
        this._sensorsDataTable.grantReadWriteData(this._sensorDataWriteHandler);
        this._loginDataTable.grantReadData(this._airthingApiPollerHandler);

        const kinesisEventSource = new lambda.EventSourceMapping(this, `sensorsdata-writer-streameventsource-${environment}`, {
            "batchSize": 15,
            "eventSourceArn": this._dataStream.streamArn,
            "target": this._sensorDataWriteHandler,
            "startingPosition": lambda.StartingPosition.LATEST
        });
        this._kinesisEventSource = kinesisEventSource;
    }
}
  
module.exports = { AirthingsPoller };