/* eslint-disable no-unused-vars */
const mysql = require('mysql');
const config = require('../config');

const { dbUrl } = config;
const conexion = mysql.createConnection(dbUrl);
// eslint-disable-next-line no-console
// console.log(conexion.state);
conexion.connect();

const createTable = (table, values) => {
  const sql = `CREATE TABLE IF NOT EXISTS ${table} ${values}`;
  conexion.query(sql, (err, result) => {
    if (err) throw err;
  });
};
const userValues = '(_id int NOT NULL AUTO_INCREMENT,email VARCHAR(30), `password` text, rolesAdmin boolean, PRIMARY KEY (_id))';
const productsValues = '(_id INTEGER NOT NULL AUTO_INCREMENT, name varchar(50), price float(2), image text, type varchar(50), dateEntry date, primary key (_id))';
const ordersProductsValues = '(orderId integer, qty integer, productId integer)';
const ordersValues = '(_id INTEGER NOT NULL AUTO_INCREMENT, userId INTEGER NOT NULL, client varchar(20), status varchar(20), dateEntry date, dateProcessed date, primary key (_id))';

createTable('users', userValues);
createTable('products', productsValues);
createTable('orders_products', ordersProductsValues);
createTable('orders', ordersValues);
module.exports = conexion;
