const express = require('express');
const cors = require('cors');
const config = require('./config');
const authMiddleware = require('./middleware/auth');
const errorHandler = require('./middleware/error');
const routes = require('./routes');
const pkg = require('./package.json');
const conexion = require('./bk_data/bq_data');

// eslint-disable-next-line no-unused-vars
const { port, dbUrl, secret } = config;
const app = express(); // inicializarla
app.use(cors());

conexion.connect((error) => {
  if (error) {
    throw error;
  } else {
    console.log('conexion exitosa...');
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
  }
});
app.set('config', config); // settings nombre de variables
app.set('pkg', pkg);

// parse application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(authMiddleware(secret)); // import the code of  middleware
// Registrar rutas
routes(app, (err) => {
  if (err) {
    throw err;
  }
  app.use(errorHandler);

  app.listen(port, () => { // iniciar en el puerto ${port}
    console.info(`App listening on port ${port}`);
  });
});
