/* eslint-disable no-unused-vars */
const express = require('express'); // framework of node.js
const config = require('./config');
const authMiddleware = require('./middleware/auth');
const errorHandler = require('./middleware/error');
const routes = require('./routes');
const pkg = require('./package.json');

const { port, dbUrl, secret } = config;
const app = express();
// TODO: Conexión a la Base de Datos (MySQL)
const { conexion } = require('./database.js');

conexion.connect((error) => {
  if (error) {
    throw error;
  } else {
    console.log('conexion exitosa...');
  }
});
// parse application/x-www-form-urlencoded --parse URL-encoded bodies
app.use(express.urlencoded({ extended: false }));
// recognize the incoming request object as a JSON object
app.use(express.json());
// import de code of middleware
app.use(authMiddleware(secret));

app.set('config', config); // --> variables de entorno

app.set('pkg', pkg);
// Registrar rutas
routes(app, (err) => {
  if (err) {
    throw err;
  }
  app.use(errorHandler);
  app.listen(port, () => { // starts at the port
    console.info(`App listening on port ${port}`);
  });
});
