var redis = require("redis");
var host = process.env.HOST || "127.0.0.1";
var client = redis.createClient(6379, host, {password: "z3liPOUHXNLisc75EXv+ITX/QExoLOIgdM+cxh7mqdclApC/2FW2IAPnS9ziTlNi1U8koW9yZN7AvCQf", db: 1});

var KEYS_PREFIX = {
  clientIdSocketId: 'client_id_socket_id_',
}

function onConnect(callback) {
  client.on('connect', callback);
}

module.exports = {
  client,
  onConnect,
  KEYS_PREFIX,
};
