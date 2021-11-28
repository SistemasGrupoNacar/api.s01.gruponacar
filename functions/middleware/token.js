/*
    REQUERIMIENTOS 

    require("jsonwebtoken")
    require("./config")

*/

const jwt = require("jsonwebtoken");
const { SECRET_TOKEN, TIME_TOKEN } = require("./config");

function setToken(data) {
  let token = jwt.sign(data, SECRET_TOKEN, {
    expiresIn: TIME_TOKEN,
  });
  return token;
}

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, SECRET_TOKEN, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

module.exports = { setToken, authenticateToken };
