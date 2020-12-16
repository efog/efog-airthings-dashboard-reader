const Kinesis = require("aws-sdk").Kinesis;
const aws = require("aws-sdk");
const dbg = require("debug");
const log = require("debug")("openweathermap.func.main");
const luxon = require("luxon");
const moment = require("moment");
const openweathermaphelper = require("./openweathermap-helpers");
const url = require("url");

exports.main = async function (event, context) {
    log("starting lambda function");
    const stream = new Kinesis();
    const environment = process.env.ENVIRONMENT || "dev";
    const { longitude, latitude, apikey } = event;
    const currentWeather = await openweathermaphelper.getOpenweatchermapCurrentWeather(latitude, longitude, apikey);
    log(`data captured ${JSON.stringify(currentWeather)}`);
    
};