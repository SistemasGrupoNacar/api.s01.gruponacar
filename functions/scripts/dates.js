// Verificar si existen fechas de filtro o no
const checkDates = (startDateI, endDateI, data) => {
  if (typeof startDateI === "undefined" || typeof endDateI === "undefined") {
    const { startDate, endDate } = getDates(data);
    const filtered = false;
    return { startDate, endDate, filtered };
  } else {
    const startDate = startDateI;
    const endDate = endDateI;
    const filtered = true;
    return { startDate, endDate, filtered };
  }
};

// Obtener la primer y ultima fecha
const getDates = (inventoryEntries) => {
  let startDate = inventoryEntries[0]._id;
  let endDate = inventoryEntries[inventoryEntries.length - 1]._id;
  return { startDate, endDate };
};

module.exports = {
  checkDates,
  getDates,
};
