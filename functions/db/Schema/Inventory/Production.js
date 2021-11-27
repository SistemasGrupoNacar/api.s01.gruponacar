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
      ref: "place",
      required: true,
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
    salaries: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "salaries",
      },
    ],extra_moves: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "extra_moves",
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
