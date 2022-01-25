function graphic(data) {
  let graphic = {};
  data.forEach((element) => {
    // Primero se recorta la fecha
    const temporalDate = element._id
      .toISOString()
      .substring(0, 10)
      .replace(/-/g, "/")
      .split("/")
      .reverse();
    const date = temporalDate[0] + "/" + temporalDate[1];
    element._id = date;
    // Se asocia con un objeto de tipo clave - valor
    graphic[element._id] = element.total;
  });
  return graphic;
}
module.exports = { graphic };
