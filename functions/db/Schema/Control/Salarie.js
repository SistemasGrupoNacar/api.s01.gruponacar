const mongoose = require("mongoose");

const salarie = new mongoose.Schema(
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

module.exports = Salarie = mongoose.model("salarie", status);
