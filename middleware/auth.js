
const jwt = require('jsonwebtoken'); // middleware
const conexion = require('../bk_data/bq_data');

module.exports = (secret) => (req, resp, next) => {
  const { authorization } = req.headers;

  if (!authorization) { // si no hay token
/* eslint-disable prefer-destructuring */
/* eslint-disable no-nested-ternary */
const jwt = require('jsonwebtoken');
const conexion = require('../database');

module.exports = (secret) => (req, resp, next) => {
  const { authorization } = req.headers;
  if (!authorization) {
    return next();
  }
  const [type, token] = authorization.split(' ');
  // no deberia ser bearer porque seria abierto y accesible
  if (type.toLowerCase() !== 'bearer') {
    return next();
  }

  jwt.verify(token, secret, (err, decodedToken) => {
    if (err) {
      return next(403);
    }

    // TODO: Verificar identidad del usuario usando `decodedToken.uid`
    try {
      conexion.query('SELECT * FROM users', (error, result) => {
        if (error) { throw error; }
        // console.log(decodedToken);
        const userVerified = result.find((user) => user.email === decodedToken.email);
        if (userVerified) {
          req.user = userVerified;
          next();
        } else { next(404); }
      });
    } catch (error) {
      next(404);
    }
  });
};

module.exports.isAuthenticated = (req) => {


  // TODO: decidir por la informacion del request si la usuaria esta autenticada

  if (req.user) {
    return true;
  }
  return false;
};

module.exports.isAdmin = (req) => {
  // TODO: decidir por la informacion del request si la usuaria es admin
  if (req.user.rolesAdmin) {

    return true;
  }
  return false;
};

// eslint-disable-next-line max-len
module.exports.requireAuth = (req, resp, next) => (!module.exports.isAuthenticated(req) ? next(401) : next());

// eslint-disable-next-line max-len
module.exports.requireAdmin = (req, resp, next) => (!module.exports.isAuthenticated(req) ? next(401) : !module.exports.isAdmin(req) ? next(403) : next());
