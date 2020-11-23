const https = require("https");
const fs = require("fs");
const { url } = require("inspector");
const log = require("debug")("airthingsapipoller.helpers");

log.log = console.log.bind(console);

/**
 * Gets identity tokens from token endpoint
 * @param {string} username username to login with
 * @param {string} password password associated to username
 * @returns {object} authentication tokens
 */
async function getIdentityTokens(username, password) {
    log("getting identity token");
    const tokenV1PostOptions = {
        "method": "POST",
        "hostname": "accounts-api.airthings.com",
        "path": "/v1/token",
        "headers": {
            "Accept": "application/json",
            "Content-Type": "application/json"
        },
        "maxRedirects": 20
    };
    const promise = new Promise((resolve, reject) => {
        const req = https.request(tokenV1PostOptions, function (res) {
            const chunks = [];
            res.on("data", function (chunk) {
                chunks.push(chunk);
            });
            res.on("end", function (chunk) {
                const body = Buffer.concat(chunks);
                log(`received body ${body}`);
                const data = JSON.parse(body);
                if (res.statusCode !== 200) {
                    return reject(data);
                }
                return resolve(data);
            });
            res.on("error", function (error) {
                log(`received error ${error}`);
                reject(error);
            });
        });
        const postData = JSON.stringify({
            "username": username,
            "client_id": "accounts",
            "grant_type": "password",
            "password": password
        });
        req.write(postData);
        req.end();
    });
    return promise;
}

/**
 * Fetches authorization url including authorization code
 * @param {string} identityBearerToken identity access token required to fetch authorization code url
 * @return {object} authorization redirect response as JSON
 */
async function getAutorizationCodeUrl(identityBearerToken) {
    log("getting authorization code url");
    const options = {
        "method": "POST",
        "hostname": "accounts-api.airthings.com",
        "path": "/v1/authorize?client_id=dashboard&redirect_uri=https://dashboard.airthings.com",
        "headers": {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Authorization": `Bearer ${identityBearerToken}`
        },
        "maxRedirects": 20
    };
    const promise = new Promise((resolve, reject) => {
        const req = https.request(options, function (res) {
            const chunks = [];
            res.on("data", function (chunk) {
                chunks.push(chunk);
            });
            res.on("end", function (chunk) {
                const body = Buffer.concat(chunks);
                log(`received body ${body}`);
                const data = JSON.parse(body);
                if (res.statusCode !== 200) {
                    return reject(data);
                }
                return resolve(data);
            });
            res.on("error", function (error) {
                log(`received error ${error}`);
                reject(error);
            });
        });
        const postData = JSON.stringify({"scope": ["dashboard"]});
        req.write(postData);
        req.end();
    });
    return promise;
}

/**
 * Gets access token from authorization code
 * @param {object} authorizationCode authorization code 
 * @returns {object} access
 */
async function getAccessTokenFromAuthorizationCode(authorizationCode) {
    log("getting access token from authorization code");
    const options = {
        "method": "POST",
        "hostname": "accounts-api.airthings.com",
        "path": "/v1/token",
        "headers": {
            "Content-Type": "application/json"
        },
        "maxRedirects": 20
    };
    const promise = new Promise((resolve, reject) => {
        const req = https.request(options, function (res) {
            const chunks = [];
            res.on("data", function (chunk) {
                chunks.push(chunk);
            });
            res.on("end", function (chunk) {
                const body = Buffer.concat(chunks);
                log(`received body ${body}`);
                const data = JSON.parse(body);
                if (res.statusCode !== 200) {
                    return reject(data);
                }
                return resolve(data);
            });
            res.on("error", function (error) {
                log(`received error ${error}`);
                return reject(error);
            });
        });
        const postData = JSON.stringify({"grant_type": "authorization_code",
            "client_id": "dashboard",
            "client_secret": "e333140d-4a85-4e3e-8cf2-bd0a6c710aaa",
            "code": authorizationCode,
            "redirect_uri": "https://dashboard.airthings.com"});
        req.write(postData);
        req.end();
    });
    return promise;
}

/**
 * Gets location data
 * @param {object} tokens tokens object
 * @returns {object} location data
 */
async function getLocationData(tokens) {
    log("getting location details");
    const promise = new Promise((resolve, reject) => {
        const options = {
            "method": "GET",
            "hostname": "web-api.airthin.gs",
            "path": "/v1/location",
            "headers": {
                "Accept": "application/json",
                "Authorization": `Bearer ${tokens.access_token}`
            },
            "maxRedirects": 20
        };
        const req = https.request(options, function (res) {
            const chunks = [];
            res.on("data", function (chunk) {
                chunks.push(chunk);
            });
            res.on("end", function (chunk) {
                const body = Buffer.concat(chunks);
                log(`received body ${body}`);
                const data = JSON.parse(body);
                if (res.statusCode !== 200) {
                    return reject(data);
                }
                return resolve(data);
            });
            res.on("error", function (error) {
                log(`received error ${error}`);
                return reject(error);
            });
        });
        req.end();
    });
    return promise;
}

/**
 * Gets dashboard data
 * @param {object} tokens tokens object
 * @returns {object} location data
 */
async function getDashboardData(tokens) {
    log("getting dashboard data");
    const promise = new Promise((resolve, reject) => {
        const options = {
            "method": "GET",
            "hostname": "web-api.airthin.gs",
            "path": "/v1/dashboard",
            "headers": {
                "Accept": "application/json",
                "Authorization": `Bearer ${tokens.access_token}`
            },
            "maxRedirects": 20
        };
        const req = https.request(options, function (res) {
            const chunks = [];
            res.on("data", function (chunk) {
                chunks.push(chunk);
            });
            res.on("end", function (chunk) {
                const body = Buffer.concat(chunks);
                log(`received body ${body}`);
                const data = JSON.parse(body);
                if (res.statusCode !== 200) {
                    return reject(data);
                }
                return resolve(data);
            });
            res.on("error", function (error) {
                log(`received error ${error}`);
                return reject(error);
            });
        });
        req.end();
    });
    return promise;
}

/**
 * Gets thresholds data
 * @param {object} tokens tokens object
 * @returns {object} location data
 */
async function getThresholdsData(tokens) {
    log("getting threshold data");
    const promise = new Promise((resolve, reject) => {
        const options = {
            "method": "GET",
            "hostname": "web-api.airthin.gs",
            "path": "/v1/thresholds",
            "headers": {
                "Accept": "application/json",
                "Authorization": `Bearer ${tokens.access_token}`
            },
            "maxRedirects": 20
        };
        const req = https.request(options, function (res) {
            const chunks = [];
            res.on("data", function (chunk) {
                chunks.push(chunk);
            });
            res.on("end", function (chunk) {
                const body = Buffer.concat(chunks);
                log(`received body ${body}`);
                const data = JSON.parse(body);
                if (res.statusCode !== 200) {
                    return reject(data);
                }
                return resolve(data);
            });
            res.on("error", function (error) {
                log(`received error ${error}`);
                return reject(error);
            });
        });
        req.end();
    });
    return promise;
}

/**
 * Gets relay devices data
 * @param {object} tokens tokens object
 * @returns {object} location data
 */
async function getRelayDevicesData(tokens) {
    log("getting relay devices data");
    const promise = new Promise((resolve, reject) => {
        const options = {
            "method": "GET",
            "hostname": "web-api.airthin.gs",
            "path": "/v1/relay-devices",
            "headers": {
                "Accept": "application/json",
                "Authorization": `Bearer ${tokens.access_token}`
            },
            "maxRedirects": 20
        };
        const req = https.request(options, function (res) {
            const chunks = [];
            res.on("data", function (chunk) {
                chunks.push(chunk);
            });
            res.on("end", function (chunk) {
                const body = Buffer.concat(chunks);
                log(`received body ${body}`);
                const data = JSON.parse(body);
                if (res.statusCode !== 200) {
                    return reject(data);
                }
                return resolve(data);
            });
            res.on("error", function (error) {
                log(`received error ${error}`);
                return reject(error);
            });
        });
        req.end();
    });
    return promise;
}

/**
 * Gets device segment data
 * @param {object} tokens tokens object
 * @param {string} deviceId device serial number
 * @param {string} from as date time
 * @param {string} to as date time
 * @returns {object} location data
 */
async function getDeviceSegmentsData(tokens, deviceId, from, to) {
    log(`getting device segments data ${deviceId} ${from} ${to}`);
    const promise = new Promise((resolve, reject) => {
        const options = {
            "method": "GET",
            "hostname": "web-api.airthin.gs",
            "path": `/v1/devices/${deviceId}/segments/latest/samples?from=${from}&to=${to}&resolution=second`,
            "headers": {
                "Accept": "application/json",
                "Authorization": `Bearer ${tokens.access_token}`
            },
            "maxRedirects": 20
        };
        log(`calling path ${options.path}`);
        const req = https.request(options, function (res) {
            const chunks = [];
            res.on("data", function (chunk) {
                chunks.push(chunk);
            });
            res.on("end", function (chunk) {
                const body = Buffer.concat(chunks);
                log(`received body ${body}`);
                const data = JSON.parse(body);
                if (res.statusCode !== 200) {
                    return reject(data);
                }
                return resolve(data);
            });
            res.on("error", function (error) {
                log(`received error ${error}`);
                return reject(error);
            });
        });
        req.end();
    });
    return promise;
}

module.exports = {
    "getAccessTokenFromAuthorizationCode": getAccessTokenFromAuthorizationCode,
    "getAutorizationCodeUrl": getAutorizationCodeUrl,
    "getDashboardData": getDashboardData,
    "getDeviceSegmentsData": getDeviceSegmentsData,
    "getIdentityTokens": getIdentityTokens,
    "getLocationData": getLocationData,
    "getRelayDevicesData": getRelayDevicesData,
    "getThresholdsData": getThresholdsData
};