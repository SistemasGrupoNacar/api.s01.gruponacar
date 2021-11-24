const mongoose = require("mongoose");

const production = new mongoose.Schema(
  {
    start_date: {
      type: Date,
      required: true,
    },
    end_date: {
      type: Date,
    },
    description: {
      type: String,
    },
    mesh_house: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "mesh_house",
    },

    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "product",
      required: true,
    },
    sales: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "sales",
      },
    ],
    production_costs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "production_cost",
      },
    ],
    total_sales: {
      type: Number,
    },
    total_production_costs: {
      type: Number,
    },
    status: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "status",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = Production = mongoose.model("production", production);
