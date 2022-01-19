// Recoge y devuelve informacion
const total = (data) => {
  return data
    .reduce((acc, cur) => {
      return acc + cur.total;
    }, 0)
    .toFixed(2);
};

module.exports = { total };
