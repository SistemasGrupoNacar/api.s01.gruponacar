const mongoose = require("mongoose");

const sector = new mongoose.Schema(
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

module.exports = Sector = mongoose.model("sector", sector);
