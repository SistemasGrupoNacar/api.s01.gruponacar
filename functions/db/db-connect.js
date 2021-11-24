/*
    REQUERIMIENTOS
require("mongoose");
require("./config")
*/

const mongoose = require("mongoose");
const {URI} = require("./config")

async function conectionDatabase() {
  await mongoose.connect(URI,{
    useUnifiedTopology:true,
    useNewUrlParser:true
});
}

module.exports = {conectionDatabase}