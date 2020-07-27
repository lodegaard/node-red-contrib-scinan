const scinan = require('../utils/api')

module.exports = function(RED) {
    
    function ScinanDeviceNode(config) {
        RED.nodes.createNode(this,config);
        var node = this;

        this.server = RED.nodes.getNode(config.server);
        this.device_id = config.device;

        node.status({fill:"grey", shape:"ring", text:"-°C"});
        
        if (this.server) {
            var api = new scinan({
                username: this.server.credentials.username,
                password: this.server.credentials.password
            });
        } else {
            node.status({fill:"red", shape:"ring", text:"-°C"});
            var api = new scinan();
        }

        api.on('authenticated', function() {
            console.log("API authenticated");
            node.status({fill:"green", shape:"fill", text:"-°C"});
        })

        api.on('get-device-info', function(err, status) {
            console.log("Status event");
            console.log(status);
            node.status({fill:"green", shape:"dot", text:status.measure_temperature+"°C"});
        })
        
        node.on('input', function(msg) {
            var requestSent = false;

            if (typeof msg.payload != 'undefined' && typeof msg.payload.set != 'undefined')
            {
                if (typeof msg.payload.set.target != 'undefined') {
                    requestSent = true;
                    api.setTemperature({device_id: this.device_id, value: msg.payload.set.target}, function (err, response) {
                        if (response.result) {
                            api.getDeviceInfo({device_id: node.device_id}, function (err, status){
                                node.send({payload: status});
                            });
                        } else {
                            node.send({payload: response});
                        }
                    });
                } else if (typeof msg.payload.set.away != 'undefined') {
                    requestSent = true;
                    api.setAway({device_id: this.device_id, value: msg.payload.set.away}, function (err, response) {
                        if (response.result) {
                            api.getDeviceInfo({device_id: node.device_id}, function (err, status){
                                node.send({payload: status});
                            });
                        } else {
                            node.send({payload: response});
                        }
                    });
                } else if (typeof msg.payload.set.mode != 'undefined') {
                    requestSent = true;
                    api.setMode({device_id: this.device_id, value: msg.payload.set.mode}, function (err, response) {
                        if (response.result) {
                            api.getDeviceInfo({device_id: node.device_id}, function (err, status){
                                node.send({payload: status});
                            });
                        } else {
                            node.send({payload: response});
                        }
                    });
                }
            }

            // Default to get status
            if (msg.payload === "status" || msg.status || !requestSent)
            {
                api.getDeviceInfo({device_id: this.device_id}, function (err, status){
                    node.send({payload: status});
                });
            }

        });

        node.on('close', function() {
            node.log('Closing ScinanDeviceNode');
        });
    }

    RED.nodes.registerType("scinan-device", ScinanDeviceNode);
}