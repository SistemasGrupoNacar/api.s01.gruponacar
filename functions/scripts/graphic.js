function graphic(data) {
  let graphic = {};
  data.forEach((element) => {
    // Primero se recorta la fecha
    element._id = element._id.toLocaleDateString("es-ES");
    // Se asocia con un objeto de tipo clave - valor
    graphic[element._id] = element.total;
  });
  return graphic;
}
module.exports = { graphic };
