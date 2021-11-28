/*
REQUERIMIENTOS
require("crypto");
require("./config")

VARIABLES 
algoritmo hash seguro = "SHA256"
SECRET sera la palabra secreta de encriptacion
digest = "hex"
*/

const crypto = require("crypto");
const { SHA_ENCRYPT, SECRET_ENCRYPT, DIGEST_ENCRYPT } = require("./config.encrypt");

function createHmac(password) {
  const encryptedPassword = crypto
    .createHmac(SHA_ENCRYPT, SECRET_ENCRYPT)
    .update(password)
    .digest(DIGEST_ENCRYPT);
  return encryptedPassword;
}

function compareHmac(password, hmac) {
  const passEncrypted = createHmac(password);
  if (hmac === passEncrypted) {
    return true;
  } else {
    return false;
  }
}

module.exports = { createHmac, compareHmac };
