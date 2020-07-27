var scinan = require('../utils/api');

auth = {
    username: "",
    password: "",
    access_token: ""
}

options = {
    device_id: ""
}

var api = new scinan(auth);

api.getDevices({}, function name(err, devices) {
    console.log(devices);
})

api.getDeviceInfo(options, function(err, status) {
    console.log(status);
})