// Verificar si existen fechas de filtro o no
const checkDates = (startDateI, endDateI, data) => {
  if (typeof startDateI === "undefined" || typeof endDateI === "undefined") {
    const { startDate, endDate } = getDates(data);
    const filtered = false;
    // Struct date in 'year-month-day' format
    let startDateStruct = structDate(startDate, "year-month-day");
    let endDateStruct = structDate(endDate, "year-month-day");
    const { startDateFormat, endDateFormat } = formatDates(
      startDateStruct,
      endDateStruct
    );
    return { startDate, endDate, startDateFormat, endDateFormat, filtered };
  } else {
    const startDate = startDateI;
    const endDate = endDateI;
    const filtered = true;
    // Struct date in 'day-month-year' format
    let startDateStruct = structDate(startDate, "day-month-year");
    let endDateStruct = structDate(endDate, "day-month-year");
    const { startDateFormat, endDateFormat } = formatDates(
      startDateStruct,
      endDateStruct
    );
    return { startDate, endDate, startDateFormat, endDateFormat, filtered };
  }
};

// Obtener la primer y ultima fecha
const getDates = (inventoryEntries) => {
  let startDate = inventoryEntries[0]._id;
  let endDate = inventoryEntries[inventoryEntries.length - 1]._id;
  return { startDate, endDate };
};

// Formatear fechas
const formatDates = (startDate, endDate) => {
  var options = { year: "numeric", month: "long", day: "numeric" };
  if (typeof startDate === "undefined" || typeof endDate === "undefined") {
    return { startDateFormat: "", endDateFormat: "" };
  } else {
    const startDateFormat = new Date(startDate).toLocaleString(
      "es-ES",
      options
    );
    const endDateFormat = new Date(endDate).toLocaleString("es-ES", options);
    return { startDateFormat, endDateFormat };
  }
};

// Desestructura la fecha intercambiando el mes con el dia y la ordena para que la funcion Date la entienda
const structDate = (date, options) => {
  if (options == "day-month-year") {
    const dateStructure = date.split("-");
    return dateStructure[1] + "/" + dateStructure[0] + "/" + dateStructure[2];
  } else if (options == "month-day-year") {
    const dateStructure = date.split("-");
    return dateStructure[0] + "/" + dateStructure[1] + "/" + dateStructure[2];
  } else if (options == "year-month-day") {
    const dateStructure = date.split("-");
    return dateStructure[1] + "/" + dateStructure[2] + "/" + dateStructure[0];
  }
};

module.exports = {
  checkDates,
  getDates,
};
