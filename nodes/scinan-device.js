const scinan = require('../utils/api')

module.exports = function(RED) {
    
    function ScinanDeviceNode(config) {
        RED.nodes.createNode(this,config);
        var node = this;

        this.server = RED.nodes.getNode(config.server);
        this.device_id = config.device;
        
        if (this.server) {
            var api = new scinan({
                username: this.server.credentials.username,
                password: this.server.credentials.password
            });
        } else {
            var api = new scinan();
        }

        api.on('authenticated', function() {
            console.log("API authenticated")
        })

        api.on('get-device-info', function(err, status) {
            console.log("Status event");
            console.log(status);
        })
        
        node.on('input', function(msg) {
            
            if (msg.payload === "status" || msg.status)
            {
                api.getDeviceInfo({device_id: this.device_id}, function (err, status){
                    var newMsg = {
                        payload: status
                    }
                    node.send(newMsg);
                });
            }

            if (msg.payload === 'away')
            {
                api.setAway({device_id: this.device_id, value: true})
                node.send({payload: "sucess"});
            }
        });

        node.on('close', function() {
            node.log('Closing ScinanDeviceNode');
        });
    }

    RED.nodes.registerType("scinan-device", ScinanDeviceNode);
}