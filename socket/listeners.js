var redis = require("../redis");
var debug = require("debug")("server:server");
var mapping = require("../services/mapping");

function onSetSocketIdToRedis(clientId, socketId) {
  var redisKey = redis.KEYS_PREFIX.clientIdSocketId + clientId,
    socketId;
  redis.client.set(redisKey, socketId, function (err) {
    debug("error socket id: " + socketId);
    if (err) throw err;
  });
  debug("new socket id in redis: " + socketId);
}

function onSendSms(clientId, uuid, status, clientError) {
  var key = mapping.getKeyOfClientIdUuidResponse(clientId, uuid);
  var response = mapping.clientIdUuidResponse.get(key);
  if(!response){
    throw new Error('No Response In ClientIdUuidResponse Mapping');
  }
  if (status === "success") {
    response.json({ success: true, code: "successfully send sms" });
  } else if (status === "failure") {
    response.status(500).json({
      success: false,
      code: "Send SMS Error",
      error: clientError,
    });
  }
  mapping.clientIdUuidResponse.delete(key);
}

module.exports = {
  onSetSocketIdToRedis,
  onSendSms,
};
