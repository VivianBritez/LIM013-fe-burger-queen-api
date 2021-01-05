const { conexion } = require('../database');

// , page, limit, host
const getAllData = (table) => new Promise((resolve, reject) => {
  console.log('hola');
  conexion.query(`SELECT * FROM ${table}`, (error, result) => {
    if (result.length) {
      /*  const totalData = result.length;
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
              } */
      resolve(result);
    } else {
      reject(error);
    }
  });
});

const dataById = (table, value) => new Promise((resolve, reject) => {
  conexion.query(`SELECT * FROM ${table} WHERE id =?`, value, (error, result) => {
    if (result.length > 0) {
      resolve(result);
      console.log(result);
    } else {
      reject(error);
    }
  });
});

const getDataByEmail = (table, value) => new Promise((resolve, reject) => {
  conexion.query(`SELECT * FROM ${table} WHERE email =?`, value, (error, result) => {
    if (result.length > 0) {
      resolve(result);
    } else {
      reject(error);
    }
  });
});

const createData = (table, values) => new Promise((resolve, reject) => {
  conexion.query(`INSERT INTO ${table} SET ? `, values, (error, result) => {
    console.log(result);
    resolve(result);
    reject(error);
    // console.info(error)
  });
});

const updateData = (table, value, idValue) => new Promise((resolve, reject) => {
  conexion.query(`UPDATE ${table} SET ? WHERE id =?`, [idValue, value], (error, result) => {
    console.log(result);
    console.log(error);
    resolve(result);
    reject(error);
  });
});

const deleteData = (table, idValue) => new Promise((resolve, reject) => {
  conexion.query(`DELETE FROM ${table} WHERE id =?`, idValue, (error, result) => {
    resolve(result);
    console.info(result);
    reject(error);
    console.info(error);
  });
});

module.exports = {
  getAllData,
  dataById,
  createData,
  updateData,
  deleteData,
  getDataByEmail,
};
