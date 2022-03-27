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

  // Convertir fecha a local
  obj.date_format = new Date(obj.date).toLocaleString("es-ES", {
    timeZone: "America/El_Salvador",
    hour12: true,
  });

  return obj;
};

module.exports = Harvest = mongoose.model("Harvest", harvest);
