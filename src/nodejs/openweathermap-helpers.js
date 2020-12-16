const https = require("https");
const fs = require("fs");
const { url } = require("inspector");
const log = require("debug")("openweathermap.helpers");

/**
 * Gets current weather at coordinates 
 * @param {string} latitude latitude coordinate
 * @param {string} longitude longitude coordinate
 * @param {string} apikey api key to use to query the service
 * @returns {JSON} current weather at coordinates
 */
async function getOpenweatchermapCurrentWeather(latitude, longitude, apikey) {
    const promise = new Promise((resolve, reject) => {
        const options = {
            "method": "GET",
            "hostname": "api.openweathermap.org",
            "path": `/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apikey}`,
            "headers": {
                "Accept": "application/json"
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
                console.log(body.toString());
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
        req.end();
    });
    return await promise;
}

module.exports = {
    "getOpenweatchermapCurrentWeather": getOpenweatchermapCurrentWeather
};