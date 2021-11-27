const mongoose = require("mongoose");

const status = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    sector: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "sector",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = Status = mongoose.model("status", status);
