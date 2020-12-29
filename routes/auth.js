const jwt = require('jsonwebtoken');
// const bcrypt = require('bcrypt');
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
    const sql = `SELECT * FROM users WHERE email = "${email}" `;
    conexion.query(sql, (error, result) => {
      if (error) throw error;
      if (!result) {
        return resp.status(400).json({
          success: 0,
          data: 'Invalid email',
        });
      }
      const pass = password === result[0].password;
      if (pass) {
        const jsontoken = jwt.sign({ result }, secret, {
          expiresIn: '1h',
        });
        resp.header('authorization', jsontoken);
        resp.status(200).json({
          success: 1,
          message: 'login successfully',
          token: jsontoken,
        });
      } else {
        resp.status(400).json({
          success: 0,
          data: 'Invalid password',
        });
      }
    });
  });

  // next();
  return nextMain();
};
