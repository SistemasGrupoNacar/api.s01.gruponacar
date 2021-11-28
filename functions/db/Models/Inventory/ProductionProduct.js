const mongoose = require("mongoose");

const productionProduct = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    stock: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
    },
    min_stock: {
      type: Number,
      required: true,
    },
    cost: {
      type: Number,
      required: true,
    },
    availability: {
      type: Boolean,
      required: true,
    }
  },
  {
    timestamps: true,
  }
);

module.exports = ProductionProduct = mongoose.model(
  "ProductionProduct",
  productionProduct
);
