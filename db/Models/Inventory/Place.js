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

// eliminacion de los campos innecesarios
place.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.__v;
  return obj;
};

module.exports = Place = mongoose.model("Place", place);
