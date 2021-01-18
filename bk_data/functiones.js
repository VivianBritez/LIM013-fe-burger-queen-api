const conexion = require('./data');

const getAllData = (table) => new Promise((resolve, reject) => {
  conexion.query(`SELECT * FROM ${table}`, (error, result) => {
    if (result.length) {
      resolve(result);
      // eslint-disable-next-line no-console
      // console.log(result);
    } else {
      reject(error);
      // console.info(error);
    }
  });
});

const getDataByKeyword = (table, keyword, value) => new Promise((resolve, reject) => {
  conexion.query(`SELECT * FROM ${table} WHERE ${keyword}=?`, value, (error, result) => {
    if (result.length > 0) {
      resolve(result);
      /// / console.log('soy get data by keyword', result);
    } else {
      reject(error);
      // eslint-disable-next-line no-console
      // console.log(error);
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

const createData = (table, toInsert) => new Promise((resolve, reject) => {
  conexion.query(`INSERT INTO ${table} SET ?`, toInsert, (error, result) => {
    resolve(result);
    // eslint-disable-next-line no-console
    // console.log('SOY RESULT CREATE DATA', result);
    reject(error);
    // eslint-disable-next-line no-console
    console.log('SOY error CREATE DATA', error);
  });
});

const updateDataByKeyword = (table, toUpdate, keyword, value) => new Promise((resolve, reject) => {
  conexion.query(`UPDATE ${table} SET ? WHERE ${keyword} = ?`, [toUpdate, value], (error, result) => {
    // eslint-disable-next-line no-param-reassign
    resolve(result);
    reject(error);
  });
});

/* const deleteDataSwith = (table, id, idValue) => new Promise((resolve, reject) => {
  conexion.query(`UPDATE ${table} SET switch = 1 WHERE ${id} = ?`, idValue, (error, result) => {
    resolve(result);
    reject(error);
  });
});
*/
const deleteData = (table, id, idValue) => new Promise((resolve, reject) => {
  conexion.query(`DELETE FROM ${table} WHERE ${id} = ?`, idValue, (error, result) => {
    resolve(result);
    reject(error);
  });
});
module.exports = {
  getAllData,
  getDataByKeyword,
  createData,
  updateDataByKeyword,
  getDataByEmail,
  deleteData,
};
