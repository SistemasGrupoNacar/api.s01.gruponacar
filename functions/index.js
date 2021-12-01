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
app.use("/login", require("./API/General/login"));
app.use("/users", require("./API/General/users"));
app.use("/harvest", require("./API/Inventory/harvest"));
app.use("/detailSales", require("./API/Inventory/detailSales"));
app.use("/sales", require("./API/Inventory/sales"));
app.use("/roles", require("./API/General/roles"));

exports.api = functions.https.onRequest(app);
