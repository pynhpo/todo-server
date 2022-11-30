var clientIdUuidResponse = new Map();

function getKeyOfClientIdUuidResponse(clientId, uuid) {
  return clientId + '_' + uuid;
};

module.exports = {
  clientIdUuidResponse,
  getKeyOfClientIdUuidResponse,
}