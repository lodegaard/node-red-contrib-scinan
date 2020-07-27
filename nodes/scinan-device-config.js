const scinan = require('../utils/api')
const { getTimestamp, getStatus } = require('../utils/utils');
const { AUTHORIZATION_URL, LIST_URL, USER_AGENT, CLIENT_ID, REDIRECT_URI } = require('../utils/constants');

module.exports = function(RED) {
    function ScinanDeviceConfigNode(config) {
        RED.nodes.createNode(this, config);
    }

    RED.nodes.registerType("scinan-device-config",ScinanDeviceConfigNode,{
        credentials: {
            username: {type:"text"},
            password: {type:"password"},
        }
    });

    RED.httpAdmin.get("/scinan/devices", function(req, res) {
        const server = RED.nodes.getNode(req.serverNodeId);
        const api = new scinan({})
        var deviceList = []
        api.getDevices({}, function name(err, devices) {
            devices.forEach(function(device) {
                deviceList.push({
                    name: device.name,
                    id: device.data.id
                })
            });
            res.json(deviceList);
        })
    });
}