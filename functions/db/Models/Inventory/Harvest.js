const mongoose = require("mongoose");
const harvest = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    production: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Production",
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    quantity: {
      type: Number,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// eliminacion de campos innecesarios
harvest.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.createdAt;
  delete obj.updatedAt;
  delete obj.__v;
  return obj;
};

module.exports = Harvest = mongoose.model("Harvest", harvest);
