require("dotenv").config();

const { conectionDatabase } = require("./db/db-connect");
conectionDatabase();

const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");

const app = express();

//allow cors policy
app.use(cors({ origin: true }));

app.use("/products", require("./API/Inventory/products"));
app.use("/typeMoves", require("./API/General/typeMoves"));
app.use("/productionCosts", require("./API/Inventory/productionCosts"));
app.use("/productions", require("./API/Inventory/productions"));
app.use("/productionProducts", require("./API/Inventory/productionProducts"));
app.use("/places", require("./API/Inventory/places"));

exports.api = functions.https.onRequest(app);
