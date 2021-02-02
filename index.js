const express = require('express');
const cors = require('cors');
const config = require('./config');
const authMiddleware = require('./middleware/auth');
const errorHandler = require('./middleware/error');
const routes = require('./routes');
const pkg = require('./package.json');


// eslint-disable-next-line no-unused-vars
const { port, dbUrl, secret } = config;
const app = express(); // inicializarla
app.use(cors());


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
