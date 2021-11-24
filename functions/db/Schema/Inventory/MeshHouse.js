const mongoose = require("mongoose");

const mesh_house = new mongoose.Schema(
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

module.exports = MeshHouse = mongoose.model("mesh_house", mesh_house);
