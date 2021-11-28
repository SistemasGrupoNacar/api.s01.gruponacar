const mongoose = require("mongoose");

const extraMove = new mongoose.Schema(
  {
    description: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    type_move: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TypeMove",
      required: true,
    },
    production: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Production",
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

module.exports = ExtraMove = mongoose.model("ExtraMove", extraMove);
