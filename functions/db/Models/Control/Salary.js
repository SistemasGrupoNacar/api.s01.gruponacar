const mongoose = require("mongoose");

const salary = new mongoose.Schema(
  {
    description: {
      type: String,
      default: null,
    },
    total: {
      type: Number,
      required: true,
    },
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
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

salary.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.__v;
  delete obj.createdAt;
  delete obj.updatedAt;
  if (obj.date) {
    obj.date_format = new Date(obj.date).toLocaleString("es-ES", {
      timeZone: "America/El_Salvador",
      hour12: true,
    });
  }
  if (obj.total) {
    obj.total_format = obj.total.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
    });
  }
  return obj;
};

module.exports = Salary = mongoose.model("Salary", salary);
