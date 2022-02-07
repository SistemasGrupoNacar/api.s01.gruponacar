// Recoge y devuelve informacion
const total = (data) => {
  return data
    .reduce((acc, cur) => {
      return acc + cur.total;
    }, 0)
    .toFixed(2);
};

// Redondea a dos decimales
const round = (num) => {
  return Math.round(num * 100) / 100;
};

// Convierte el numero a moneda dolar
const toDolar = (num) => {
  return num.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
};

module.exports = { total, round, toDolar };
