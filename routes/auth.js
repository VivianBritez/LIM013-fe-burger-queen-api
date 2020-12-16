const jwt = require('jsonwebtoken');
const config = require('../config');
const database = require('../database.js');
const pool = require('../database.js');

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
      pool.query(`SELECT *FROM users WHERE email = "${email}"`, (error, result) => {
        if (error) throw error;
        if (result) {
          console.log(result);
        }
      });
    } catch (error) {
      return error;
    }
  });
  // next();

  return nextMain();
};
