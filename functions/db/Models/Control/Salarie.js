const mongoose = require("mongoose");

const salary = new mongoose.Schema(
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

module.exports = Salary = mongoose.model("Salary", salary);
