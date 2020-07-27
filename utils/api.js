var util = require('util')
var EventEmitter = require('events').EventEmitter;
var request = require('request');

const { getTimestamp, getStatus, valueToMode, modeToValue } = require('./utils');
const { AUTHORIZATION_URL, LIST_URL, USER_AGENT, CLIENT_ID, REDIRECT_URI, CONTROL_URL, SENSORS, MODES } = require('./constants');

var username;
var password;
var access_token;

/**
 * @constructor
 * @param args 
 */
var scinan = function(args) {
    this.authenticate(args);
}

util.inherits(scinan, EventEmitter);

/**
 * 
 */
scinan.prototype.handleRequestError = function(err, response, body, message, critical) {
    var errorMessage = "";
    if (body && response.headers["content-type"].trim().toLowerCase().indexOf("application/json") !== -1) {
        errorMessage = JSON.parse(body);
        errorMessage = errorMessage && (errorMessage.error.message || errorMessage.error);
    } else if (typeof response !== 'undefined') {
        errorMessage = "Status code" + response.statusCode;
    }
    else {
        errorMessage = "No response";
    }
    var error = new Error(message + ": " + errorMessage);
    if (critical) {
        this.emit("error", error);
    } else {
        this.emit("warning", error);
    }
    return error;
}

/**
 * 
 */
scinan.prototype.authenticate = function(args, callback) {
    if (!args) {
        console.error("No arguments");
        return this;
    }

    if (args.access_token)
    {
        access_token = args.access_token;
        return this;
    }

    if (!args.username) {
        console.error("Invalid username");
        return this;
    }

    if (!args.password) {
        console.error("Invalid password")
        return this;
    }

    username = args.username;
    password = args.password;

    var url = `${AUTHORIZATION_URL}?client_id=${CLIENT_ID}&passwd=${password}&redirect_uri=${REDIRECT_URI}&response_type=token&userId=${username}`;
    request({
        url: url,
        method: "POST",
        headers: {
            "User-Agent": USER_AGENT
        }}, 
        function (err, response, body) {
            if (err || response.statusCode != 200) {
                return this.handleRequestError(err, response, body, "Authenticate error", true);
            }
            
            const start = body.indexOf('token:');
            const end = body.indexOf('\n', start);
            const token = body.substring(start + 6, end);
            access_token = token;

            this.emit('authenticated');

            if (callback) {
                return callback();
            }

            return this;
        }.bind(this));

}

/**
 * 
 */
scinan.prototype.getDevices = function(options, callback) {
    if (!access_token) {
        return this.on('authenticated', function() {
            this.getDevices(options, callback);
        })
    }

    var timestamp = getTimestamp(new Date());
    var url = `${LIST_URL}?format=json&timestamp=${timestamp}&token=${access_token}`;
    request({
        url: url,
        method: "GET",
        headers: {
            "User-Agent": USER_AGENT
        }},
        function(err, response, body) {
            if (err || response.statusCode != 200) {
                return this.handleRequestError(err, response, body, "getDevices error");
            }

            body = JSON.parse(body);
            var devices = [];
            body.forEach(device => {
                console.log(device);
                const status = getStatus(device.status);
                devices.push({
                    name: device.title,
                    data: {
                        name: device.title,
                        id: device.id,
                        onoff: status.onoff,
                        online: device.online,
                        away: status.away,
                        measure_temperature: status.measure_temperature,
                        target_temperature: status.target_temperature,
                        mode: status.mode,
                        last_updated: status.time,
                    }
                });
            });
            this.emit('get-devices', err, devices);

            if (callback) {
                return callback(err, devices);
            }

            return this;
        }.bind(this));
    
    return this;
}

/**
 * 
 */
scinan.prototype.getDeviceInfo = function(options, callback) {
    if (!access_token) {
        return this.on('authenticated', function() {
            this.getDevices(options, callback);
        })
    }

    if (!options.device_id)
    {
        return this;
    }

    var timestamp = getTimestamp(new Date());
    var url = `${LIST_URL}?format=json&timestamp=${timestamp}&token=${access_token}`;

    request({
        url: url,
        method: "GET",
        headers: {
            "User-Agent": USER_AGENT
        }},
        function(err, response, body) {
            if (err || response.statusCode != 200) {
                return this.handleRequestError(err, response, body, "getDeviceInfo error");
            }

            body = JSON.parse(body);
            var currentDevice;
            for (var i in body) {
                if (body[i].id === options.device_id) {
                    currentDevice = body[i];
                    break;
                }
            }

            var status = {};
            if (currentDevice) {
                status = getStatus(currentDevice.status);
                status.mode = valueToMode(status.mode);
            }
            this.emit('get-device-info', err, status);

            if (callback) {
                return callback(err, status);
            }

            return this;
        }.bind(this));
    
    return this;

}

/**
 * 
 */
scinan.prototype.setCapabilityValues = function(options, callback) {
    if (!access_token) {
        return this.on('authenticated', function() {
            this.getDevices(options, callback);
        })
    }

    if (!options.device_id) {
        return this;
    }

    switch (options.capability)
    {
        case 'onoff':
            sensor_id = SENSORS.ON_OFF;
            control_data = `{%22value%22:%22${options.cap_value === true ? '1' : '0'}%22}`;
            break;
        case 'target_temperature':
            sensor_id = SENSORS.TARGET_TEMPERATURE;
            control_data = `{%22value%22:%22${options.cap_value.toFixed(1)}%22}`;
            break;
        case 'mode':
            sensor_id = SENSORS.MODE;
            control_data = `{%22value%22:%22${modeToValue(options.cap_value)}%22}`;
            break;
        case 'away':
            sensor_id = SENSORS.AWAY;
            control_data = `{%22value%22:%22${options.cap_value === true ? '1' : '0'}%22}`;
            break;
    }

    const timestamp = getTimestamp(new Date());
    const url = `${CONTROL_URL}?control_data=${control_data}&device_id=${options.device_id}&format=json&sensor_id=${sensor_id}&sensor_type=1&timestamp=${timestamp}&token=${access_token}`

    request({
        url: url,
        method: "POST",
        headers: {
            "User-Agent": USER_AGENT
        }},
        function(err, response, body) {
            if (err || response.statusCode != 200) {
                return this.handleRequestError(err, response, body, `setCapabilityValues ${options.capability} error`);
            }
            
            body = JSON.parse(body);
            console.log(body);
            
            this.emit('set-capability', err, body);

            if (callback) {
                return callback(err, body);
            }

            return this;
        }.bind(this));
    
    return this;
}

/**
 * 
 */
scinan.prototype.setAway = function(options, callback) {
    if (!access_token) {
        return this.on('authenticated', function() {
            this.setAway(options, callback);
        })
    }

    if (!options.device_id)
    {
        return this;
    }

    return this.setCapabilityValues({
        device_id: options.device_id,
        capability: 'away',
        cap_value: options.value
    }, callback);
}

/**
 * 
 */
scinan.prototype.setOnOff = function(options, callback) {
    if (!access_token) {
        return this.on('authenticated', function() {
            this.setAway(options, callback);
        })
    }

    if (!options.device_id)
    {
        return this;
    }

    return this.setCapabilityValues({
        device_id: options.device_id,
        capability: 'onoff',
        cap_value: options.value
    }, callback);
}

/**
 * 
 */
scinan.prototype.setMode = function(options, callback) {
    if (!access_token) {
        return this.on('authenticated', function() {
            this.setAway(options, callback);
        })
    }

    if (!options.device_id)
    {
        return this;
    }

    return this.setCapabilityValues({
        device_id: options.device_id,
        capability: 'mode',
        cap_value: options.value
    }, callback);
}

/**
 * 
 */
scinan.prototype.setTemperature = function(options, callback) {
    if (!access_token) {
        return this.on('authenticated', function() {
            this.setAway(options, callback);
        })
    }

    if (!options.device_id)
    {
        return this;
    }

    return this.setCapabilityValues({
        device_id: options.device_id,
        capability: 'target_temperature',
        cap_value: options.value
    }, callback);
}

module.exports = scinan;