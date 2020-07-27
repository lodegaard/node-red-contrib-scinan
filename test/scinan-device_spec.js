var helper = require("node-red-node-test-helper");
var scinanNode = require("../nodes/scinan-device");

describe('scinan-device Node', function () {

    afterEach(function () {
      helper.unload();
    });
  
    it('should be loaded', function (done) {
      var flow = [{ id: "n1", type: "scinan-device", name: "test name", device: "123456" }];
      helper.load(scinanNode, flow, function () {
        var n1 = helper.getNode("n1");
        n1.should.have.property('name', 'test name');
        n1.should.have.property('device_id', '123456');
        n1.should.have.property('server');
        done();
      });
    });
  });