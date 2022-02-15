function graphic(data) {
  let graphic = {};
  data.forEach((element) => {
    // Primero se recorta la fecha
    const temporalDate = element._id.replace(/-/g, "/").split("/").reverse();
    const date = temporalDate[0] + "/" + temporalDate[1];
    element.date = date;
    // Se asocia con un objeto de tipo clave - valor
    graphic[element.date] = element.total;
  });
  return graphic;
}
module.exports = { graphic };
