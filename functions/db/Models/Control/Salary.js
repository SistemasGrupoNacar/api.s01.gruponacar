const mongoose = require("mongoose");

const salary = new mongoose.Schema(
  {
    description: {
      type: String,
      default: null,
    },
    amount: {
      type: Number,
      required: true,
    },
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    production: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Production",
      default: null,
    },
    date: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = Salary = mongoose.model("Salary", salary);
