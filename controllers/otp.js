var socketIO = require("../socket");
var redis = require("../redis");
var debug = require("debug")("server:server");
var { v4: uuidv4 } = require("uuid");
var mapping = require("../services/mapping");

function sendMessageToPhone(res, next, phoneNumber, message) {
  var io = socketIO.getIO();
  var clientId = "1";
  redis.client.get(
    redis.KEYS_PREFIX.clientIdSocketId + clientId,
    function (err, socketId) {
      if (err)
        res.status(500).json({
          success: false,
          code: "Redis Error",
          error: err,
        });
      debug("get socket id from redis: " + socketId);

      console.log("phoneNumber: ", phoneNumber);
      console.log("message: ", message);

      var uuid = uuidv4();
      io.to(socketId).emit("send-sms-otp", { phoneNumber, message, uuid });
      var key = mapping.getKeyOfClientIdUuidResponse(clientId, uuid);
      mapping.clientIdUuidResponse.set(key, res)
    }
  );
}

module.exports = {
  sendMessageToPhone,
};
