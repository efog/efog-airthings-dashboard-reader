const aws = require("aws-sdk");
const dbg = require("debug");
const dynamodb = new aws.DynamoDB();
const log = require("debug")("devicesdata-upsert.func.main");
const luxon = require("luxon");

log.log = console.log.bind(console);

exports.main = async function (event, context) {
    const environment = process.env.ENVIRONMENT || "dev";
    const data = event.devices;
    const promises = data.map((device) => {
        const item = {
            "TableName": `devices-data-${environment}`,
            "Item": {
                "deviceid": { "S": device.deviceid },
                "timestamp": { "S": luxon.DateTime.utc().toISO() },
                "longitude": { "S": device.longitude },
                "latitude": { "S": device.latitude },
                "accountid": { "S": device.accountid }
            }
        };
        return dynamodb.putItem(item).promise(); 
    });
    await Promise.all(promises);
    return {
        "result": "ok"
    };
};