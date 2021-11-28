const mongoose = require("mongoose");

const typeMove = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = TypeMove = mongoose.model("TypeMove", typeMove);
