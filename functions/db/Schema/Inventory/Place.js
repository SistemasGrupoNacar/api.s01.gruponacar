const mongoose = require("mongoose");

const place = new mongoose.Schema(
  {
    description: {
      type: String,
      required: true,
    },
    status: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "status",
        required: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = Place = mongoose.model("place", place);
