const bcript = require("bcrypt");

//encriptar password
function createHash(password) {
  return bcript.hashSync(password, 10);
}
//comparar password
function comparePassword(password, hash) {
  return bcript.compareSync(password, hash);
}

module.exports = { createHash, comparePassword };
