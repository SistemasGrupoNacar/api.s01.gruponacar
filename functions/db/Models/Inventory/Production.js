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
    detail_sales: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "DetailSale",
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

// eliminacion de campos no deseados
production.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.__v;
  delete obj.createdAt;
  delete obj.updatedAt;

  // Convertir fecha a local
  obj.start_date_format = new Date(obj.start_date).toLocaleString("es-ES", {
    timeZone: "America/El_Salvador",
    hour12: true,
  });

  // Convertir fecha a local
  if (obj.end_date != null) {
    obj.end_date_format = new Date(obj.end_date).toLocaleString("es-ES", {
      timeZone: "America/El_Salvador",
      hour12: true,
    });
  }

  // Convertir el total a dolar
  obj.total_ingress_format = obj.total_ingress.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
  // Convertir el total a dolar
  obj.total_egress_format = obj.total_egress.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });

  return obj;
};

module.exports = Production = mongoose.model("Production", production);
