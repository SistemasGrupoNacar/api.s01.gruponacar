const mongoose = require("mongoose");

const journey = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    check_in: {
      type: Date,
      default: null,
    },
    check_out: {
      type: Date,
      default: null,
    },
    was_worked: {
      type: Boolean,
      default: false,
    },
    description: {
      type: String,
      default: null,
    },
    coordinates: {
      lat: {
        type: Number,
        default: null,
      },
      lng: {
        type: Number,
        default: null,
      },
    },
  },
  {
    timestamps: true,
  }
);

journey.methods.toJSON = function () {
  let journey = this.toObject();
  delete journey.__v;
  delete journey.createdAt;
  delete journey.updatedAt;

  if (journey.check_in) {
    journey.check_in_format = new Date(journey.check_in).toLocaleString(
      "es-ES",
      {
        timeZone: "America/El_Salvador",
        hour12: true,
      }
    );
  }
  if (journey.check_out) {
    journey.check_out_format = new Date(journey.check_out).toLocaleString(
      "es-ES",
      {
        timeZone: "America/El_Salvador",
        hour12: true,
      }
    );
  }
  return journey;
};

module.exports = Journey = mongoose.model("Journey", journey);
