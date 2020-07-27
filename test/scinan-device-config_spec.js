var helper = require("node-red-node-test-helper");
var scinanNode = require("../nodes/scinan-device-config");

describe('scinan-device-config Node', function () {

    afterEach(function () {
      helper.unload();
    });
  
    it('should be loaded', function (done) {
      var flow = [{ id: "n1", type: "scinan-device-config", name: "test name" }];
      helper.load(scinanNode, flow, function () {
        var n1 = helper.getNode("n1");
        n1.should.have.property('name', 'test name');
        n1.should.have.property('credentials');
        done();
      });
    });
  });