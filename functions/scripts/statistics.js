const { setDefaultResultOrder } = require("dns");

// Obtiene los datos de los ultimos 3 meses
const getDataLastThreeMonths = (data) => {
  // Declaracion de variables
  let lastThreeMonths = [];

  // Obtener el mes actual
  const currentMonth = new Date().getUTCMonth() + 1;

  // Recorrer todos los datos
  data.forEach((element) => {
    const month = new Date(element._id).getUTCMonth() + 1;

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
          });
        } else {
          // Si existe, sumar el total
          lastThreeMonths[index].total += element.total;
        }
      }
    }
  });
  return lastThreeMonths;
};

// Obtiene el porcentaje de incremento o decremento
const getPercentage = (current, previous) => {
  const percentage = ((current - previous) / previous) * 100;
  return Math.round(percentage);
};

// Ordena y verifica el porcentaje de incremento
const verifyDataForPercentage = (data) => {
  // Verifica si el arreglo de datos es mayor o igual a 2
  if (data.length == 2) {
    return getPercentage(data[1].total, data[0].total);
  } else if (data.length == 3) {
    return getPercentage(data[2].total, data[1].total);
  } else {
    return null;
  }
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

// Obtiene los datos del mes actual
const getDataCurrentMonthIngress = (sales, extra) => {
  // Obtener el mes actual
  const currentMonth = new Date().getUTCMonth() + 1;
  // Recorrer todos los datos
  let thisMonthSales = sales.filter((element) => {
    const month = new Date(element._id).getUTCMonth() + 1;
    return month === currentMonth;
  });

  let thisMonthExtra = extra.filter((element) => {
    const month = new Date(element._id).getUTCMonth() + 1;
    return month === currentMonth;
  });
  // Unir datos
  const data = thisMonthSales.concat(thisMonthExtra);
  // Sacar el total de los extras
  const totalExtra = totalFunction(thisMonthExtra);

  // Calcular total del mes
  const { total, total_format } = totalFunction(data);

  // Calcular el porcentaje del total que corresponde a movimientos extra redondeado a dos decimales
  const percentage = (totalExtra.total / total) * 100;
  const percentage_format = percentage.toFixed(2);

  return {
    data,
    total,
    total_format,
    extra_percentage: percentage,
    extra_percentage_format: percentage_format,
  };
};
// Obtiene los datos del rango de fecha dado
const getDataRangeIngress = (sales, extra) => {
  const joined = sales.concat(extra);
  // Sacar el total de los extras
  const totalExtra = totalFunction(extra);

  // Calcular total del mes
  const { total, total_format } = totalFunction(joined);
  // Calcular el porcentaje del total que corresponde a movimientos extra redondeado a dos decimales
  const percentage = (totalExtra.total / total) * 100;
  const percentage_format = percentage.toFixed(2);

  return {
    joined,
    total,
    total_format,
    extra_percentage: percentage,
    extra_percentage_format: percentage_format,
  };
};
// Obtiene los datos del rango de fecha dado
const getDataRangeEgress = (inventoryEntries, extra) => {
  const joined = inventoryEntries.concat(extra);
  // Sacar el total de los extras
  const totalExtra = totalFunction(extra);

  // Calcular total del mes
  const { total, total_format } = totalFunction(joined);
  // Calcular el porcentaje del total que corresponde a movimientos extra redondeado a dos decimales
  const percentage = (totalExtra.total / total) * 100;
  const percentage_format = percentage.toFixed(2);

  return {
    joined,
    total,
    total_format,
    extra_percentage: percentage,
    extra_percentage_format: percentage_format,
  };
};
// Obtiene los datos del mes actual en egresos
const getDataCurrentMonthEgress = (egress, extra) => {
  // Obtener el mes actual
  const currentMonth = new Date().getUTCMonth() + 1;
  // Recorrer todos los datos
  let thisMonthEgress = egress.filter((element) => {
    const month = new Date(element._id).getUTCMonth() + 1;
    return month === currentMonth;
  });

  let thisMonthExtra = extra.filter((element) => {
    const month = new Date(element._id).getUTCMonth() + 1;
    return month === currentMonth;
  });
  // Unir datos
  const data = thisMonthEgress.concat(thisMonthExtra);
  // Sacar el total de los extras
  const totalExtra = totalFunction(thisMonthExtra);

  // Calcular total del mes
  const { total, total_format } = totalFunction(data);
  // Calcular el porcentaje del total que corresponde a movimientos extra redondeado a dos decimales
  const percentage = (totalExtra.total / total) * 100;
  const percentage_format = percentage.toFixed(2);

  return {
    data,
    total,
    total_format,
    extra_percentage: percentage,
    extra_percentage_format: percentage_format,
  };
};

const totalFunction = (data) => {
  let total = 0;
  data.forEach((element) => {
    total += element.total;
  });
  // Total formateada como moneda
  const total_format = total.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
  return { total, total_format };
};

module.exports = {
  getDataLastThreeMonths,
  getPercentage,
  verifyDataForPercentage,
  getDataCurrentMonthEgress,
  getDataRangeEgress,
  getDataCurrentMonthIngress,
  getDataRangeIngress,
};
