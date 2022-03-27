/*
    REQUERIMIENTOS
require("mongoose");
*/

const mongoose = require("mongoose");

function getState() {
  let state = mongoose.connection.readyState;
  if (state == 1) {
    return true;
  }
  return false;
}

function sendResponseError(res) {
  return res
    .status(503)
    .json({ });
}

module.exports = { getState, sendResponseError };