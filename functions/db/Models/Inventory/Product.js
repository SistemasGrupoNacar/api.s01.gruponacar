const mongoose = require("mongoose");

const product = new mongoose.Schema(
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
    availability: {
      type: Boolean,
      required: true,
    }
  },
  {
    timestamps: true,
  }
);

module.exports = Product = mongoose.model("Product", product);
