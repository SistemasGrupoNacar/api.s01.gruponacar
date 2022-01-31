const mongoose = require("mongoose");

const detailSale = new mongoose.Schema(
  {
    sale: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sale",
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    production: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Production",
    },
    quantity: {
      type: Number,
      required: true,
    },
    sub_total: {
      type: Number,
      required: true,
    },
    total: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// eliminacion de campos innecesarios
detailSale.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.createdAt;
  delete obj.updatedAt;
  delete obj.__v;

  // Convertir el total a dolar
  obj.sub_total_format = obj.sub_total.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
  // Convertir el total a dolar
  obj.total_format = obj.total.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });

  return obj;
};

module.exports = DetailSale = mongoose.model("DetailSale", detailSale);
