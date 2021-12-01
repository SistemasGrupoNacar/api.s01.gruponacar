const mongoose = require("mongoose");

const role = mongoose.Schema(
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

module.exports = Role = mongoose.model("Role", role);