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

// eliminar el dato __v
role.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.__v;
  delete obj.createdAt;
  delete obj.updatedAt;
  return obj;
};

module.exports = Role = mongoose.model("Role", role);
