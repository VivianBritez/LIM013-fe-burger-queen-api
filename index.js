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
const conexion = mysql.createConnection({
  host: 'localhost',
  database: 'burger__queen',
  user: 'root',
  password: 'sql12345',
});

conexion.connect((error) => {
  if (error) {
    throw error;
  } else {
    console.log('CONEXION EXITOSAaaa');
  }
});
conexion.end();

app.set('config', config);
app.set('pkg', pkg);

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
