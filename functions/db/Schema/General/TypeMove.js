const mongoose = require("mongoose");

const type_move = new mongoose.Schema(
  {
    description: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = TypeMove = mongoose.model("type_move", type_move);
