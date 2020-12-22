const { conexion } = require('../database');

const getAllData = (table, page, limit, host) => new Promise((resolve, reject) => {
  console.log('hola');
  conexion.query(`SELECT * FROM ${table}`, (error, result) => {
    if (result.length) {
      const totalData = result.length;
      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;
      result = result.slice(startIndex, endIndex);
      const findResult = {};

      findResult.result = result;
      if (endIndex < totalData) {
        findResult.next = `<http://${host}/${table}?page=${
          page + 1
        }&limit=${limit}>`;
      }
      if (startIndex > 0) {
        findResult.prev = `<http://${host}/${table}?page=${
          page - 1
        }&limit=${limit}>`;
        findResult.first = `<http://${host}/${table}?page=1&limit=${limit}>`;
        findResult.last = `<http://${host}/${table}?page=1&limit=${limit}>`;
        resolve(findResult);
      }
    } else {
      reject(error);
    }
  });
});

module.exports = { getAllData };
