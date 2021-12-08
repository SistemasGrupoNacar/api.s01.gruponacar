const mongoose = require("mongoose");

const extraMove = new mongoose.Schema(
  {
    description: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    type_move: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TypeMove",
      required: true,
    },
    total: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

//eliminar los campos que no queremos que se devuelvan en la respuesta
extraMove.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.__v;
  delete obj.createdAt;
  delete obj.updatedAt;
  return obj;
};

module.exports = ExtraMove = mongoose.model("ExtraMove", extraMove);
