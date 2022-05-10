const express = require("express");
const route = express.Router();
const mongoose = require("mongoose");
const { body, query, param, validationResult } = require("express-validator");
const ProductionCost = require("../../db/Models/Inventory/ProductionCost");

let { authenticateToken } = require("../../middleware/auth");
const InventoryProduct = require("../../db/Models/Inventory/InventoryProduct");

route.get("/", authenticateToken, async (req, res) => {
  try {
    let productionCost = await ProductionCost.find()
      .sort({ _id: 1 })
      .populate("inventory_product", { name: 1, unit_of_measurement: 1 });
    return res.status(200).json(productionCost);
  } catch (err) {
    return res.status(500).json({
      name: err.name,
      message: err.message,
    });
  }
});

// Obtiene las graficas de los 5 productos mas consumidos
route.get("/graphic", authenticateToken, async (req, res) => {
  try {
    let productionCostRegisters = [];
    // Obtiene el listado de los productos mas usados en estos ultimos 5 dias
    const lastProductsFromProductionCost =
      await getLastProductsFromProductionCost();

    // Obtener el listado de registros por cada producto
    for (let i = 0; i < lastProductsFromProductionCost.length; i++) {
      // Obtiene los ultimos movimientos de cada producto
      const lastMovementsOfProduct = await getLastMovementsOfProduct(
        lastProductsFromProductionCost[i]._id
      );
      // Agrega el registro al listado
      productionCostRegisters.push(lastMovementsOfProduct);
    }
    // Retorna el listado para la grafica
    return res.status(200).json(productionCostRegisters);
  } catch (err) {
    return res.status(500).json({
      name: err.name,
      message: err.message,
    });
  }
});

// Obtiene ultimos 5 registros de costos de produccion
route.get("/last", authenticateToken, async (req, res) => {
  try {
    let productionCost = await ProductionCost.find()
      .sort({ date: -1 })
      .limit(5)
      .populate("inventory_product", { name: 1, unit_of_measurement: 1 });
    return res.status(200).json(productionCost);
  } catch (err) {
    return res.status(500).json({
      name: err.name,
      message: err.message,
    });
  }
});

// endpoint get productionCost between two dates
route.get(
  "/:startDate/:endDate",
  authenticateToken,
  param("startDate").isDate().withMessage("Fecha de inicio no es valida"),
  param("endDate").isDate().withMessage("Fecha de finalizacion no es valida"),
  async (req, res) => {
    try {
      let productionCost = await ProductionCost.find({
        date: {
          $gte: req.params.startDate,
          $lte: req.params.endDate,
        },
      })
        .sort({ _id: 1 })
        .populate("inventory_product", { name: 1, unit_of_measurement: 1 });
      //count total productionCost
      let totalProductionCost = await ProductionCost.aggregate([
        {
          $match: {
            date: {
              $gte: req.params.startDate,
              $lte: req.params.endDate,
            },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$total" },
          },
        },
      ]);

      return res.status(200).json({
        data: productionCost,
        total: totalProductionCost[0].total,
        startDate: req.params.startDate,
        endDate: req.params.endDate,
      });
    } catch (err) {
      return res.status(500).json({
        name: err.name,
        error: err.message,
      });
    }
  }
);

route.post(
  "/",
  authenticateToken,
  body("inventory_product")
    .notEmpty()
    .withMessage("El producto no debe estar vacio"),
  body("description").exists(),
  body("quantity").notEmpty().withMessage("La cantidad no debe estar vacia"),
  body("quantity").isNumeric().withMessage("La cantidad debe ser un numero"),
  body("date").notEmpty().withMessage("La fecha no debe estar vacia"),
  body("date").isISO8601().withMessage("La fecha no es valida"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    // Obtiene los datos del post
    const { inventory_product, quantity, description, date } = req.body;

    try {
      // Obtiene el producto de inventario de la base de datos
      const inventoryProduct = await InventoryProduct.findById(
        inventory_product
      );
      if (!inventoryProduct) {
        return res.status(404).json({
          name: "Producto de inventario",
          message: "El producto no existe",
        });
      }
      // Verifica si hay suficiente insumo
      if (inventoryProduct.quantity < quantity) {
        return res.status(400).json({
          name: "Insuficiente insumo",
          message: "No hay suficiente insumo",
        });
      }

      // Crea el modelo de costo de produccion
      let productionCost = new ProductionCost({
        inventory_product,
        description,
        quantity,
        date,
      });
      let response = await productionCost.save();

      //actualizar stock de inventoryProduct
      await InventoryProduct.findByIdAndUpdate(inventory_product, {
        $inc: {
          stock: -quantity,
        },
      });
      return res.status(201).json(response);
    } catch (err) {
      return res.status(500).json({
        name: err.name,
        error: err.message,
      });
    }
  }
);

route.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const response = await ProductionCost.findByIdAndDelete(req.params.id);

    //actualizar stock de inventoryProduct
    await InventoryProduct.findByIdAndUpdate(response.inventory_product, {
      $inc: {
        stock: response.quantity,
      },
    });
    return res.status(200).json(response);
  } catch (err) {
    return res.status(500).json({
      name: err.name,
      error: err.message,
    });
  }
});

const getLastProductsFromProductionCost = async () => {
  // Obtiene el listado de los productos mas usados en estos ultimos 5 dias
  return await ProductionCost.aggregate([
    {
      $match: {
        date: {
          $gte: new Date(new Date().setDate(new Date().getDate() - 5)),
          $lte: new Date(),
        },
      },
    },
    {
      $group: {
        _id: "$inventory_product",
        quantity: { $sum: "$quantity" },
      },
    },
    {
      $sort: {
        quantity: -1,
      },
    },
    {
      $limit: 5,
    },
  ]);
};

const getLastMovementsOfProduct = async (productId) => {
  const registers = await ProductionCost.aggregate([
    {
      $match: {
        inventory_product: productId,
      },
    },
    {
      $group: {
        _id: {
          $dateToString: {
            format: "%Y-%m-%d",
            date: "$date",
            timezone: "America/El_Salvador",
          },
        },
        total: { $sum: "$quantity" },
      },
    },
  ]);
  const inventoryProduct = await getInventoryProduct(productId);

  return {
    name: truncateAndFormat(
      inventoryProduct.name,
      inventoryProduct.unit_of_measurement
    ),
    data: graphicProductionCosts(registers),
  };
};

const truncateAndFormat = (input, unit) =>
  input.length > 15
    ? `${input.substring(0, 15)}...(${unit})`
    : input + `(${unit})`;

const getInventoryProduct = async (productId) => {
  const inventoryProduct = await InventoryProduct.findById(productId);
  return {
    name: inventoryProduct.name,
    unit_of_measurement: inventoryProduct.unit_of_measurement,
  };
};
//Crea la grafica para los 5 dias
const graphicProductionCosts = (data) => {
  let graphic = {};
  const today = new Date();

  // Ordena los datos dia por dia
  for (let i = 5; i > 0; i--) {
    const pastDays = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
    let day = pastDays.toISOString().split("T")[0];
    let total = 0;
    // Obtiene el total de costos de produccion por dia
    data.forEach((element) => {
      if (element._id == day) {
        total += element.total;
      }
    });

    // Formatear la fecha
    day = pastDays.toLocaleString("es-SV", {
      weekday: "long",
    });

    graphic[day] = total;
  }

  return graphic;
};

module.exports = route;
