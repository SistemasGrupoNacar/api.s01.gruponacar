const mongoose = require("mongoose");

const role = mongoose.Schema(
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

// eliminar el dato __v
role.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.__v;
  delete obj.createdAt;
  delete obj.updatedAt;
  switch (obj.title) {
    case "Admin":
      obj.title_format = "Administrador";
      break;
    case "Employee":
      obj.title_format = "Empleado";
      break;
    case "Client":
      obj.title_format = "Cliente";
      break;
    case "Watcher":
      obj.title_format = "Observador";
      break;
    default:
      break;
  }
  return obj;
};

module.exports = Role = mongoose.model("Role", role);
