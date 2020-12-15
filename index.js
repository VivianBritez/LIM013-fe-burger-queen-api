const express = require('express');
const mysql = require('mysql');
const config = require('./config');
const authMiddleware = require('./middleware/auth');
const errorHandler = require('./middleware/error');
const routes = require('./routes');
const pkg = require('./package.json');

const { port, dbUrl, secret } = config;
const app = express();
// TODO: Conexión a la Base de Datos (MongoDB o MySQL)
const connection = mysql.createConnection({
  host: 'localhost',
  database: 'burguer_queen',
  user: 'root',
  password: 'illari',
});
app.set('config', config);
app.set('pkg', pkg);
connection.connect((err) => {
  if (err) {
    throw err;
  } else {
    console.log('succesful connection');
  }
});
connection.end();
// parse application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(authMiddleware(secret));

// Registrar rutas
routes(app, (err) => {
  if (err) {
    throw err;
  }

  app.use(errorHandler);

  app.listen(port, () => {
    console.info(`App listening on port ${port}`);
  });
});
