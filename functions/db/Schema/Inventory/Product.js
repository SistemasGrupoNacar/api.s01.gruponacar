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
    status: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "status",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = Product = mongoose.model("product", product);
