const {
  requireAuth,
  requireAdmin,
} = require('../middleware/auth');

const { getData } = require('../controller/users');

const {
  getDataByKeyword, createData, updateDataByKeyword, deleteData,
} = require('../bk_data/functiones');

const { dataError } = require('../utils/utils');

/** @module products */
module.exports = (app, nextMain) => {
  /**
   * @name GET /products
   * @description Lista productos
   * @path {GET} /products
   * @query {String} [page=1] Página del listado a consultar
   * @query {String} [limit=10] Cantitad de elementos por página
   * @header {Object} link Parámetros de paginación
   * @header {String} link.first Link a la primera página
   * @header {String} link.prev Link a la página anterior
   * @header {String} link.next Link a la página siguiente
   * @header {String} link.last Link a la última página
   * @auth Requiere `token` de autenticación
   * @response {Array} products
   * @response {String} products[]._id Id
   * @response {String} products[].name Nombre
   * @response {Number} products[].price Precio
   * @response {URL} products[].image URL a la imagen
   * @response {String} products[].type Tipo/Categoría
   * @response {Date} products[].dateEntry Fecha de creación
   * @code {200} si la autenticación es correcta
   * @code {401} si no hay cabecera de autenticación
   */

  app.get('/products', requireAuth, (req, resp, next) => getData(req, resp, next, 'products'));

  /**
   * @name GET /products/:productId
   * @description Obtiene los datos de un producto especifico
   * @path {GET} /products/:productId
   * @params {String} :productId `id` del producto
   * @auth Requiere `token` de autenticación
   * @response {Object} product
   * @response {String} product._id Id
   * @response {String} product.name Nombre
   * @response {Number} product.price Precio
   * @response {URL} product.image URL a la imagen
   * @response {String} product.type Tipo/Categoría
   * @response {Date} product.dateEntry Fecha de creación
   * @code {200} si la autenticación es correcta
   * @code {401} si no hay cabecera de autenticación
   * @code {404} si el producto con `productId` indicado no existe
   */
  app.get('/products/:id', requireAuth, (req, resp, next) => {
    const { id } = req.params;
    if (!(id) || !req.headers.authorization) {
      // dataError(!id, !req.headers.authorization, resp);
      return dataError(!id, !req.headers.authorization, resp);
    }
    getDataByKeyword('products', '_id', id)
      .then((result) => {
        // eslint-disable-next-line no-param-reassign
        result[0]._id = id.toString();
        return resp.status(200).send(result[0]);
      })
      .catch(() => resp.status(404).send({ message: 'El producto solicitado no existe' }));
  });

  /**
   * @name POST /products
   * @description Crea un nuevo producto
   * @path {POST} /products
   * @auth Requiere `token` de autenticación y que la usuaria sea **admin**
   * @body {String} name Nombre
   * @body {Number} price Precio
   * @body {String} [imagen]  URL a la imagen
   * @body {String} [type] Tipo/Categoría
   * @response {Object} product
   * @response {String} products._id Id
   * @response {String} product.name Nombre
   * @response {Number} product.price Precio
   * @response {URL} product.image URL a la imagen
   * @response {String} product.type Tipo/Categoría
   * @response {Date} product.dateEntry Fecha de creación
   * @code {200} si la autenticación es correcta
   * @code {400} si no se indican `name` o `price`
   * @code {401} si no hay cabecera de autenticación
   * @code {403} si no es admin
   * @code {404} si el producto ya existe
   */
  app.post('/products', requireAdmin, (req, resp, next) => {
    const {
      name, price, image, type,
    } = req.body;
    if (!(name && price) || !req.headers.authorization) {
      return dataError(!(name && price), !req.headers.authorization, resp);
    }
    const date = new Date();

    const newProduct = {
      name,
      price,
      image,
      type,
      dateEntry: `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`,
    };
    getDataByKeyword('products', 'name', name)
      .then(() => resp.status(404).send({ message: `Ya existe un producto con el nombre: ${name}` }))
      .catch(() => {
        createData('products', newProduct)
          .then((result) => {
            // eslint-disable-next-line no-param-reassign
            newProduct._id = (result.insertId).toString();
            return resp.status(200).send(newProduct);
          });
      });
  });

  /**
   * @name PUT /products
   * @description Modifica un producto
   * @path {PUT} /products
   * @params {String} :productId `id` del producto
   * @auth Requiere `token` de autenticación y que el usuario sea **admin**
   * @body {String} [name] Nombre
   * @body {Number} [price] Precio
   * @body {String} [imagen]  URL a la imagen
   * @body {String} [type] Tipo/Categoría
   * @response {Object} product
   * @response {String} product._id Id
   * @response {String} product.name Nombre
   * @response {Number} product.price Precio
   * @response {URL} product.image URL a la imagen
   * @response {String} product.type Tipo/Categoría
   * @response {Date} product.dateEntry Fecha de creación
   * @code {200} si la autenticación es correcta
   * @code {400} si no se indican ninguna propiedad a modificar
   * @code {401} si no hay cabecera de autenticación
   * @code {403} si no es admin
   * @code {404} si el producto con `productId` indicado no existe
   */

  app.put('/products/:id', requireAdmin, (req, resp, next) => {
    const { id } = req.params;
    const {
      name, price, image, type,
    } = req.body;
    const date = new Date();
    if (!(name || price || image || type) || !req.headers.authorization) {
      return dataError(!(name || price || image || type), !req.headers.authorization, resp);
    // eslint-disable-next-line no-restricted-globals
    } if (isNaN(price) && price !== undefined) {
      return resp.status(400).send('Price have to do a number');
    }

    const newProduct = {
      ...((name) && { name }),
      ...((type) && { type }),
      ...((price) && { price }),
      ...((image) && { image }),
      dateEntry: `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`,
    };
    getDataByKeyword('products', '_id', id)
      .then(() => {
        updateDataByKeyword('products', newProduct, '_id', id)
          .then(() => {
            getDataByKeyword('products', '_id', id)
              .then((product) => {
                // eslint-disable-next-line no-param-reassign
                product[0]._id = id.toString();
                return resp.status(200).send(product[0]);
              });
          });
      })
      .catch(() => resp.status(404).send({ message: `No existe producto con ese id : ${id}` }));
  });

  /**
   * @name DELETE /products
   * @description Elimina un producto ✓
   * @path {DELETE} /products ✓
   * @params {String} :productId `id` del producto ✓
   * @auth Requiere `token` de autenticación y que el usuario sea **admin**
   * @response {Object} product✓
   * @response {String} product._id Id
   * @response {String} product.name Nombre
   * @response {Number} product.price Precio
   * @response {URL} product.image URL a la imagen
   * @response {String} product.type Tipo/Categoría
   * @response {Date} product.dateEntry Fecha de creación  ✓
   * @code {200} si la autenticación es correcta ✓
   * @code {401} si no hay cabecera de autenticación ✓
   * @code {403} si no es ni admin ✓
   * @code {404} si el producto con `productId` indicado no existe ✓
   */
  app.delete('/products/:id', requireAdmin, (req, resp, next) => {
    const { id } = req.params;
    if (!id || !req.headers.authorization) {
      return dataError(!id, !req.headers.authorization, resp);
    }
    getDataByKeyword('products', '_id', id)
      .then((product) => {
        deleteData('products', '_id', id);
        // eslint-disable-next-line no-param-reassign
        product[0]._id = id.toString();
        return resp.status(200).send(product[0]);
        // resp.status(403).send({ message: `El producto con id ${id} no existe.` });
      })
      .catch(() => resp.status(404).send({ message: `No existe el producto con id ${id}.` }));
  });
  nextMain();
};