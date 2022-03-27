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
  // Convertir el total a dolar
  obj.total_format = obj.total.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
  // Convertir fecha a local
  obj.date_format = new Date(obj.date).toLocaleString("es-ES", {
    timeZone: "America/El_Salvador",
    hour12: true,
  });

  // Traducir el titulo del tipo de movimiento
  obj.type_move.title_translate =
    obj.type_move.title === "ingress" ? "Ingreso" : "Egreso";

  return obj;
};

module.exports = ExtraMove = mongoose.model("ExtraMove", extraMove);
