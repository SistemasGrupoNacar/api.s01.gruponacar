const mongoose = require("mongoose");
const { type } = require("os");

const production = new mongoose.Schema(
  {
    start_date: {
      type: Date,
      required: true,
    },
    end_date: {
      type: Date,
      default: null,
    },
    description: {
      type: String,
      default: "",
    },
    place: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Place",
      required: true,
    },

    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    sales: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Sale",
      },
    ],
    production_costs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ProductionCost",
      },
    ],
    salaries: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Salary",
      },
    ],
    extra_moves: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ExtraMove",
      },
    ],
    harvest: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Harvest",
      },
    ],

    total_ingress: {
      type: Number,
      default: 0,
    },
    total_egress: {
      type: Number,
      default: 0,
    },
    in_progress: {
      type: Boolean,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = Production = mongoose.model("Production", production);
