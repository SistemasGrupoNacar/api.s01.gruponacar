require("dotenv").config();

const { conectionDatabase } = require("./db/db-connect");
conectionDatabase();

const express = require("express");
const cors = require("cors");
const port = 3000;
const app = express();
const morgan = require("morgan");

//allow cors policy
app.use(cors({ origin: true }));
//settings
app.set("port", process.env.PORT || port);
app.set("json spaces", 2);
//middlewares
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: false }));
app.use(express.json({ extended: false }));

app.use("/products", require("./API/Inventory/products"));
app.use("/typeMoves", require("./API/General/typeMoves"));
app.use("/productionCosts", require("./API/Inventory/productionCosts"));
app.use("/productions", require("./API/Inventory/productions"));
app.use("/inventoryProducts", require("./API/Inventory/inventoryProducts"));
app.use("/places", require("./API/Inventory/places"));
app.use("/login", require("./API/General/login"));
app.use("/users", require("./API/General/users"));
app.use("/harvest", require("./API/Inventory/harvest"));
app.use("/detailSales", require("./API/Inventory/detailSales"));
app.use("/sales", require("./API/Inventory/sales"));
app.use("/roles", require("./API/General/roles"));
app.use("/extraMoves", require("./API/General/extraMoves"));
app.use("/inventoryEntries", require("./API/Inventory/inventoryEntries"));
app.use("/economy/egress", require("./API/General/economyEgress"));
app.use("/economy/ingress", require("./API/General/economyIngress"));
app.use("/panel", require("./API/General/panel"));
app.use("/test", require("./API/General/test"));

// Control API
app.use("/positions", require("./API/Control/positions"));
app.use("/employees", require("./API/Control/employees"));
app.use("/journeys", require("./API/Control/journeys"));
app.use("/salaries", require("./API/Control/salaries"));
app.use("/register-actions", require("./API/Control/register.action"));

app.listen(app.get("port"), () =>
  console.log(`Example app listening on port ${app.get("port")}!`)
);
