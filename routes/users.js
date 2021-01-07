/* eslint-disable no-console */
const bcrypt = require('bcrypt');

const { dataError } = require('../utils/utils');
const {
  requireAuth,
  requireAdmin,
} = require('../middleware/auth');

const {
  getAllData, createData, getDataByKeyword, updateDataByKeyword, deleteData,
} = require('../bk_data/functiones.js');
const {
  getUsers,
} = require('../controller/users');

const { validate, valPassword } = require('../utils/validation');

const initAdminUser = (app, next) => {
  const { adminEmail, adminPassword } = app.get('config');
  if (!adminEmail || !adminPassword) {
    return next();
  }

  const adminUser = {
    _id: Number('101'),
    email: adminEmail,
    password: bcrypt.hashSync(adminPassword, 10),
    rolesAdmin: true,
  };

  // TODO: crear usuaria admin
  getAllData('users')
    .then(() => next())
    .catch(() => {
    //   console.log('no user');
      createData('users', adminUser);
      return next();
    });
};

/*
 * Diagrama de flujo de una aplicación y petición en node - express :
 *
 * request  -> middleware1 -> middleware2 -> route
 *                                             |
 * response <- middleware4 <- middleware3   <---
 *
 * la gracia es que la petición va pasando por cada una de las funciones
 * intermedias o "middlewares" hasta llegar a la función de la ruta, luego esa
 * función genera la respuesta y esta pasa nuevamente por otras funciones
 * intermedias hasta responder finalmente a la usuaria.
 *
 * Un ejemplo de middleware podría ser una función que verifique que una usuaria
 * está realmente registrado en la aplicación y que tiene permisos para usar la
 * ruta. O también un middleware de traducción, que cambie la respuesta
 * dependiendo del idioma de la usuaria.
 *
 * Es por lo anterior que siempre veremos los argumentos request, response y
 * next en nuestros middlewares y rutas. Cada una de estas funciones tendrá
 * la oportunidad de acceder a la consulta (request) y hacerse cargo de enviar
 * una respuesta (rompiendo la cadena), o delegar la consulta a la siguiente
 * función en la cadena (invocando next). De esta forma, la petición (request)
 * va pasando a través de las funciones, así como también la respuesta
 * (response).
 */

/** @module users */
module.exports = (app, next) => {
  /**
   * @name GET /users
   * @description Lista usuarias
   * @path {GET} /users
   * @query {String} [page=1] Página del listado a consultar
   * @query {String} [limit=10] Cantitad de elementos por página
   * @header {Object} link Parámetros de paginación
   * @header {String} link.first Link a la primera página
   * @header {String} link.prev Link a la página anterior
   * @header {String} link.next Link a la página siguiente
   * @header {String} link.last Link a la última página
   * @auth Requiere `token` de autenticación y que la usuaria sea **admin**
   * @response {Array} users
   * @response {String} users[]._id
   * @response {Object} users[].email
   * @response {Object} users[].roles
   * @response {Boolean} users[].roles.admin
   * @code {200} si la autenticación es correcta
   * @code {401} si no hay cabecera de autenticación
   * @code {403} si no es ni admin
   */
  app.get('/users', requireAdmin, (req, resp, next) => getUsers(req, resp, next, 'users'));

  /**
   * @name GET /users/:uid
   * @description Obtiene información de una usuaria
   * @path {GET} /users/:uid
   * @params {String} :uid `id` o `email` de la usuaria a consultar
   * @auth Requiere `token` de autenticación y que la usuaria sea **admin** o la usuaria a consultar
   * @response {Object} user
   * @response {String} user._id
   * @response {Object} user.email
   * @response {Object} user.roles
   * @response {Boolean} user.roles.admin
   * @code {200} si la autenticación es correcta
   * @code {401} si no hay cabecera de autenticación
   * @code {403} si no es ni admin o la misma usuaria
   * @code {404} si la usuaria solicitada no existe
   */
  app.get('/users/:uid', requireAuth, (req, resp) => {
    const { uid } = req.params;
    if (!uid || !req.headers.authorization) {
      return dataError(!uid, !req.authorization, resp);
    }

    const keyword = (uid.includes('@')) ? 'email' : '_id';
    console.log(keyword);

    if (!((req.user[keyword]).toString() === uid || req.user.rolesAdmin)) {
      return resp.status(403).send({ message: 'You do not have enough permissions' });
    }

    getDataByKeyword('users', keyword, uid)
      .then((result) => {
        const admin = !!(result[0].rolesAdmin);
        return resp.status(200).send(
          {
            _id: (result[0]._id).toString(),
            email: result[0].email,
            roles: { admin },
          },
        );
      })
      .catch(() => resp.status(404).send({ message: 'User does not exist' }));
  });

  /**
   * @name POST /users
   * @description Crea una usuaria
   * @path {POST} /users
   * @body {String} email Correo
   * @body {String} password Contraseña
   * @body {Object} [roles]
   * @body {Boolean} [roles.admin]
   * @auth Requiere `token` de autenticación y que la usuaria sea **admin**
   * @response {Object} user
   * @response {String} user._id
   * @response {Object} user.email
   * @response {Object} user.roles
   * @response {Boolean} user.roles.admin
   * @code {200} si la autenticación es correcta
   * @code {400} si no se proveen `email` o `password` o ninguno de los dos
   * @code {401} si no hay cabecera de autenticación
   * @code {403} si ya existe usuaria con ese `email`
   */
  // eslint-disable-next-line no-unused-vars
  app.post('/users', requireAdmin, (req, resp, next) => {
    // to verify values
    const { email, password, roles } = req.body;

    const validateInput = validate(email) && valPassword(password);
    if (!(email && password) || !req.headers.authorization) {
      return dataError(!(email && password), !req.headers.authorization, resp);
    } if (!validateInput) {
      return resp.status(400).send({ menssage: 'Invalid email or password' });
    }

    const role = roles ? roles.admin : false;
    console.info('soy role', role);
    const newUser = {
      email,
      password: bcrypt.hashSync(password, 10),
      rolesAdmin: role,
    };
    // To know if user exists in the database
    getDataByKeyword('users', 'email', email)
      .then(() => resp.status(403).send({ message: `User with email already exists : ${email}` }))
      .catch(() => {
        createData('users', newUser)
          .then((result) => resp.status(200).send(
            {
              _id: (result.insertId).toString(),
              email: newUser.email,
              roles: { admin: newUser.rolesAdmin },
            },
          ));
      });
  });

  /**
   * @name PUT /users
   * @description Modifica una usuaria
   * @params {String} :uid `id` o `email` de la usuaria a modificar
   * @path {PUT} /users
   * @body {String} email Correo
   * @body {String} password Contraseña
   * @body {Object} [roles]
   * @body {Boolean} [roles.admin]
   * @auth Requiere `token` de autenticación y que la usuaria sea **admin** o la usuaria a modificar
   * @response {Object} user
   * @response {String} user._id
   * @response {Object} user.email
   * @response {Object} user.roles
   * @response {Boolean} user.roles.admin
   * @code {200} si la autenticación es correcta
   * @code {400} si no se proveen `email` o `password` o ninguno de los dos
   * @code {401} si no hay cabecera de autenticación
   * @code {403} si no es ni admin o la misma usuaria
   * @code {403} una usuaria no admin intenta de modificar sus `roles`
   * @code {404} si la usuaria solicitada no existe
   */
  // eslint-disable-next-line no-unused-vars
  app.put('/users/:uid', requireAdmin && requireAuth, (req, resp, next) => {
    const { uid } = req.params;
    const { email, password, roles } = req.body;

    const keyword = (uid.includes('@')) ? 'email' : '_id';
    const accessToEdit = (uid.includes('@')) ? (req.user.email === uid) : (req.user._id === Number(uid));
    const isAdmin = req.user.rolesAdmin === 1;
    const accessEditRole = (!!roles && !isAdmin); // false // !!estado original
    console.log(accessEditRole);

    if (!(accessToEdit || isAdmin) || accessEditRole) {
      return resp.status(403).send({ message: 'You do not have enough permissions' });
    }
    const validateEmail = validate(email);
    const validatePassword = valPassword(password);
    const role = roles ? roles.admin : false;

    const updatedDetails = {
      ...((email && validateEmail) && { email, rolesAdmin: role }),
      // eslint-disable-next-line max-len
      ...((password && validatePassword) && { password: bcrypt.hashSync(password, 10), rolesAdmin: role }),
    };

    getDataByKeyword('users', keyword, uid)
      // eslint-disable-next-line no-unused-vars
      .then((user) => {
        if (!uid || !(email || password || roles)) {
          // eslint-disable-next-line max-len
          return dataError(!uid || !(email || password || roles), !req.headers.authorization, resp);
        }

        updateDataByKeyword('users', updatedDetails, keyword, uid)
          .then(() => getDataByKeyword('users', keyword, uid)
            .then((user) => resp.status(200).send(
              {
                _id: user[0]._id.toString(),
                email: user[0].email,
                roles: { admin: !!user[0].rolesAdmin },
              },
            )));
      })
      .catch(() => resp.status(404).send({ message: `The user whith this uid  ${uid} not exist.` }));
  });

  /**
   * @name DELETE /users
   * @description Elimina una usuaria
   * @params {String} :uid `id` o `email` de la usuaria a modificar
   * @path {DELETE} /users
   * @auth Requiere `token` de autenticación y que la usuaria sea **admin** o la usuaria a eliminar
   * @response {Object} user
   * @response {String} user._id
   * @response {Object} user.email
   * @response {Object} user.roles
   * @response {Boolean} user.roles.admin
   * @code {200} si la autenticación es correcta
   * @code {401} si no hay cabecera de autenticación
   * @code {403} si no es ni admin o la misma usuaria
   * @code {404} si la usuaria solicitada no existe
   */
  // eslint-disable-next-line no-unused-vars
  app.delete('/users/:uid', requireAdmin && requireAuth, (req, resp, next) => {
    const { uid } = req.params;
    if (!uid || !req.headers.authorization) {
      return dataError(!uid, !req.headers.authorization, resp);
    }

    const keyword = (uid.includes('@')) ? 'email' : '_id'; // si el uid incluye @ es email si no es un id

    if (!((req.user[keyword]).toString() === uid || req.user.rolesAdmin)) {
      return resp.status(403).send({ message: 'You do not have enough permissions' });
    }
    const userDeleted = {
      _id: uid,
    };

    getDataByKeyword('users', keyword, uid) // where email or id , (uid)
      .then((user) => {
        const admin = !!(user[0].rolesAdmin);
        userDeleted.email = user[0].email;
        userDeleted.roles = { admin };
        deleteData('users', keyword, uid);
        resp.status(200).send(userDeleted);
      })
      .catch(() => resp.status(404).send({ message: `User with id does not exist ${uid}` }));
  });

  initAdminUser(app, next);
};
