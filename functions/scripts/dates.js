// Verificar si existen fechas de filtro o no
const checkDates = (startDateI, endDateI, data) => {
  if (typeof startDateI === "undefined" || typeof endDateI === "undefined") {
    const { startDate, endDate } = getDates(data);
    const filtered = false;
    const { startDateFormat, endDateFormat } = formatDates(startDate, endDate);
    return { startDate, endDate, startDateFormat, endDateFormat, filtered };
  } else {
    const startDate = startDateI;
    const endDate = endDateI;
    const filtered = true;
    const { startDateFormat, endDateFormat } = formatDates(startDate, endDate);
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
  const startDateFormat = new Date(startDate).toLocaleString("es-ES", options);
  const endDateFormat = new Date(endDate).toLocaleString("es-ES", options);

  return { startDateFormat, endDateFormat };
};

module.exports = {
  checkDates,
  getDates,
};
