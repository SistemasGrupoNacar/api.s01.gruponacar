const getDataLastThreeMonths = (data) => {
  // Declaracion de variables
  let lastThreeMonths = [];

  // Obtener el mes actual
  const currentMonth = new Date().getMonth() + 1;

  // Recorrer todos los datos
  data.forEach((element) => {
    const month = new Date(element._id).getMonth() + 1;

    for (let i = 0; i < 3; i++) {
      // Verificar si el mes actual menos el rango es negativo
      let temporalMonth;
      if (currentMonth - i <= 0) {
        temporalMonth = 12 + (currentMonth - i);
      } else {
        temporalMonth = currentMonth - i;
      }
      if (month === temporalMonth) {
        // Verificar si el mes ya existe en el arreglo
        const index = lastThreeMonths.findIndex((element) => {
          return element.month === month;
        });
        // Si no existe, agregarlo
        if (index === -1) {
          lastThreeMonths.push({
            month,
            monthName: getMonthName(month),
            total: element.total,
            quantityDays: 1,
          });
        } else {
          // Si existe, sumar el total
          lastThreeMonths[index].total += element.total;
          // Sumar un dia de trabajo
          lastThreeMonths[index].quantityDays++;
        }
      }
    }
  });
  return lastThreeMonths;
};

// Obtener el nombre del mes por medio del numero recibido
const getMonthName = (month) => {
  switch (month) {
    case 1:
      return "Enero";
    case 2:
      return "Febrero";
    case 3:
      return "Marzo";
    case 4:
      return "Abril";
    case 5:
      return "Mayo";
    case 6:
      return "Junio";
    case 7:
      return "Julio";
    case 8:
      return "Agosto";
    case 9:
      return "Septiembre";
    case 10:
      return "Octubre";
    case 11:
      return "Noviembre";
    case 12:
      return "Diciembre";
    default:
      break;
  }
};

module.exports = {
  getDataLastThreeMonths,
};
