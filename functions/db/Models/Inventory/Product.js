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
    unit_of_measurement: {
      type: String,
      required: true,
    },
    description: {
      type: String,
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

// eliminacion de los campos innecesarios
product.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.__v;
  delete obj.createdAt;
  delete obj.updatedAt;
  // cambiar estado true o false en availability
  obj.availability_text = obj.availability ? "Disponible" : "No disponible";
  return obj;
};

module.exports = Product = mongoose.model("Product", product);
