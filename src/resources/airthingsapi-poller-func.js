const dbg = require("debug");
const helpers = require("./airthingsapi-helpers");
const moment = require("moment");
const url = require("url");
const log = require("debug")("airthingsapipoller.func.main");

log.log = console.log.bind(console);

exports.main = async function (event, context) {
    log("starting lambda function");
    const username = process.env.USERNAME;
    log(`using username ${username || "not set"}`);
    const password = process.env.PASSWORD;

    const identityToken = await helpers.getIdentityTokens(username, password);
    const authorizationCodeUrl = await helpers.getAutorizationCodeUrl(identityToken.access_token);
    const authCode = url.parse(authorizationCodeUrl.redirect_uri, true).query.code;
    const accessToken = await helpers.getAccessTokenFromAuthorizationCode(authCode);
    const locationData = await helpers.getLocationData(accessToken);
    const thresholdsData = await helpers.getThresholdsData(accessToken);
    const relayData = await helpers.getRelayDevicesData(accessToken);
    const devices = [];
    relayData.hubs.forEach((hub) => {
        const deviceKeys = Object.keys(hub.metaData.devices);
        for (let index = 0; index < deviceKeys.length; index++) {
            const element = deviceKeys[index];
            devices.push(element);
        }
    });

    const from = moment.utc().subtract(1, "hour")
        .format();
    const to = moment.utc().add(1, "minute")
        .format();
    const devicesData = await Promise.all(
        devices.map((deviceId) => {
            return helpers.getDeviceSegmentsData(accessToken, deviceId, from, to);
        }));
    const data = {
        "locations": locationData,
        "devices": devicesData
    };
    return data;
};