const mongoose = require("mongoose");

const sale = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
    },
    pending: {
      type: Boolean,
      default: true,
    },
    status: {
      type: Boolean,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    detail_sale: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "DetailSale",
      },
    ],
    total: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// eliminacion de los campos innecesarios
sale.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.__v;
  delete obj.createdAt;
  delete obj.updatedAt;

  // Convertir fecha a local
  if (obj.date) {
    obj.date_format = new Date(obj.date).toLocaleString("es-ES", {
      timeZone: "America/El_Salvador",
      hour12: true,
    });
  }

  // Convertir el total a dolar
  if (obj.total) {
    obj.total_format = obj.total.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
    });
  }
  return obj;
};

module.exports = Sale = mongoose.model("Sale", sale);
