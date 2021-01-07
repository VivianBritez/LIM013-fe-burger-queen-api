/* eslint-disable no-console */
/* eslint-disable no-unused-vars */

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const conexion = require('../bk_data/bq_data');

const config = require('../config');
const { conexion } = require('../database');

const { secret } = config;

/** @module auth */
module.exports = (app, nextMain) => {
  /**
   * @name /auth
   * @description Crea token de autenticación.
   * @path {POST} /auth
   * @body {String} email Correo
   * @body {String} password Contraseña
   * @response {Object} resp
   * @response {String} resp.token Token a usar para los requests sucesivos
   * @code {200} si la autenticación es correcta
   * @code {400} si no se proveen `email` o `password` o ninguno de los dos
   * @auth No requiere autenticación
   */
  app.post('/auth', (req, resp, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(400);
    }
    // TODO: autenticar a la usuarix
    try {
      conexion.query('SELECT * FROM users', (error, result) => {
        if (error) throw error;
        // eslint-disable-next-line max-len
        const payload = result.find((user) => user.email === email && bcrypt.compareSync(password, user.password));
        console.log(payload);

        if (payload) {
          const token = jwt.sign({ email: payload.email, password: payload.password }, secret);
          resp.header('authorization', token);
          resp.status(200).send({ message: 'succesful', token });
        } else {
          next(404);
        }
      });
    } catch (error) {
      return error;
    }
    // next();
  });

  return nextMain();
};
