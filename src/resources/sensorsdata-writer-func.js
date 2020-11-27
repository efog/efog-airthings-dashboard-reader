const aws = require("aws-sdk");
const log = require("debug")("sensorsdata-writer.func.main");
const luxon = require("luxon");
const dynamodb = new aws.DynamoDB();
log.log = console.log.bind(console);

exports.main = async function (event, context) {
    const environment = process.env.ENVIRONMENT || "dev";
    log("starting lambda function");
    const promises = event.Records.map((record) => {
        log(`record ${JSON.stringify(record)}`);
        const data = JSON.parse(Buffer.from(record.kinesis.data, "base64").toString("utf-8"));
        log(`data ${JSON.stringify(data)}`);
        const item = {
            "TableName": `devices-sensorsdata-${environment}`,
            "Item": {
                "deviceid": { "S": data.deviceid },
                "timestamp": { "S": data.timestamp },
                "sensortype": { "S": data.sensortype },
                "sensorvalue": { "N": data.sensorvalue.toString() },
                "sensortimestamp": { "S": data.sensortimestamp },
                "sensortypetimestamp": { "S": `${data.sensortype}-${data.sensortimestamp}`}
            }
        };
        return dynamodb.putItem(item).promise(); 
    });
    await Promise.all(promises);
    return {
        "result": "ok"
    };
};