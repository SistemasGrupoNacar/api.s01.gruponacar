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

module.exports = Sale = mongoose.model("Sale", sale);
