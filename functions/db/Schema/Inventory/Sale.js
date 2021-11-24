const mongoose = require("mongoose");

const sale = new mongoose.Schema(
  {
    production_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "production",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    status: {
      type: mongooes.Schema.Types.ObjectId,
      ref: "status",
      required: true,
    },
    description: {
      type: String,
    },
    detail_sale: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "detail_sale",
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

module.exports = Sale = mongoose.model("sale", sale);
