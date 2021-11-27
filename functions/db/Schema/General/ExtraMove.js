const mongoose = require("mongoose");

const extra_moves = new mongoose.Schema(
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
      ref: "type_move",
      required: true,
    },
    status: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "status",
      required: true,
    },
    production: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "production",
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

module.exports = ExtraMoves = mongoose.model("extra_moves", extra_moves);
