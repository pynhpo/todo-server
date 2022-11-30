var sio = require("socket.io");
var debug = require("debug")("server:server");
var socketListeners = require("./listeners");
var io = null;

function initialize(server) {
  io = sio(server);
  io.on("connection", (socket) => {
    debug("Socket connection id: " + socket.id);

    socket.on("register", function (clientId) {
      socketListeners.onSetSocketIdToRedis(clientId, socket.id);
    });

    socket.on("send-sms-successfully", function (clientId, uuid) {
      socketListeners.onSendSms(clientId, uuid, 'success');
    });

    socket.on("send-sms-failure", function (clientId, uuid, err) {
      socketListeners.onSendSms(clientId, uuid, 'failure', err);
    });

    socket.on("keep-online", function () {
      //do nothing - because of background socket handler on mobile app
    });
  });
};

function getIO() {
  return io;
};

module.exports = {
  initialize,
  getIO
}
