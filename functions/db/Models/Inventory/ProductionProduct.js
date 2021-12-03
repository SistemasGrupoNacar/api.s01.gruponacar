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
    },
  },
  {
    timestamps: true,
  }
);

// eliminacion de los campos createdAt y updatedAt y __v
productionProduct.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.createdAt;
  delete obj.updatedAt;
  delete obj.__v;
  return obj;
};

module.exports = ProductionProduct = mongoose.model(
  "ProductionProduct",
  productionProduct
);
