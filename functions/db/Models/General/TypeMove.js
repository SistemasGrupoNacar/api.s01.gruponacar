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

typeMove.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.createdAt;
  delete obj.updatedAt;
  return obj;
};

module.exports = TypeMove = mongoose.model("TypeMove", typeMove);
