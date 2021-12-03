const mongoose = require("mongoose");

const sale = new mongoose.Schema(
  {
    production: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Production",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    status: {
      type: Boolean,
      required: true,
    },
    description: {
      type: String,
    },
    detail_sale: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "DetailSale",
      },
    ],
    total: {
      type: Number,
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
  return obj;
};

module.exports = Sale = mongoose.model("Sale", sale);
