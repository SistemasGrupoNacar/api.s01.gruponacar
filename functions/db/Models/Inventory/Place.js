const mongoose = require("mongoose");
const place = new mongoose.Schema(
  {
    description: {
      type: String,
      required: true,
    },
    availability: {
      type: Boolean,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = Place = mongoose.model("Place", place);
