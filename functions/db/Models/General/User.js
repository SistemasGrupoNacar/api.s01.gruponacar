const mongoose = require("mongoose");

const user = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
      required: true,
    },
    avatar: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

//eliminar el campo password y el campo __v
user.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.__v;
  delete obj.createdAt;
  delete obj.updatedAt;

  // Traducir el rol al español
  if (obj.role) {
    switch (obj.role.title) {
      case "Admin":
        obj.role.title_format = "Administrador";
        break;
      case "Employee":
        obj.role.title_format = "Empleado";
        break;
      case "Client":
        obj.role.title_format = "Cliente";
        break;
      default:
        break;
    }
  }
  return obj;
};

module.exports = User = mongoose.model("User", user);
