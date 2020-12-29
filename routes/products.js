const {
  requireAuth,
  requireAdmin,
} = require('../middleware/auth');

const {
  getAllData, dataById, createData, updateData, deleteData,
} = require('../conexion_data/functions.js');
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
  app.get('/products', requireAuth, (req, resp, next) => {
    /*  const page = parseInt(req.query.page); // pagina de listado a consultar
    const limit = parseInt(req.query.limit); // Cantitad de elementos por página
    const host = req.get('host'); // parametro de la paginacion
 */
    getAllData('products')
      .then((result) => resp.status(200).send(result))
      .catch(() => resp.status(404).send('no products'));
  });

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
  app.get('/products/:productId', requireAuth, (req, resp, next) => {
    const { productId } = req.params;
    if (!productId) {
      return resp.status(400).send('not exist');
    }
    dataById('products', productId)
      .then((result) => resp.status(200).send(result))
      .catch(() => resp.status(400).send('the products not exist'));
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
   * @code {404} si el producto con `productId` indicado no existe
   */
  app.post('/products', requireAdmin, (req, resp) => { // , next
    console.log('estoy aqui');
    const {
      product, type, price, image,
    } = req.body;
    if (!(product && price)) {
      return resp.status(400).send('Require name and price');
    }
    const dateEmptry = new Date();
    const newProduct = {
      product,
      type,
      price,
      image,
      dateEmptry,
    };
    console.log(newProduct);
    createData('products', newProduct)
      .then((result) => {
        console.log(result);
        resp.status(200).send(
          {
            _id: result.insertId,
            product,
            type,
            price,
            image,
            dateEmptry,
          },
        );
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
  app.put('/products/:productId', requireAdmin, (req, resp, next) => {
    const { productId } = req.params;
    const {
      product, type, price, image,
    } = req.body;
    const newProduct = {
      product,
      type,
      price,
      image,
    };
    dataById('products', productId)
      .then(() => {
        updateData('products', productId, newProduct)
          .then(() => resp.status(200).send(
            {
              id: productId,
              product,
              type,
              price,
              image,

            },
          ));
      })
      .catch(() => resp.status(400).send('you are crazy falto la e'));
  });

  /**
   * @name DELETE /products
   * @description Elimina un producto
   * @path {DELETE} /products
   * @params {String} :productId `id` del producto
   * @auth Requiere `token` de autenticación y que el usuario sea **admin**
   * @response {Object} product
   * @response {String} product._id Id
   * @response {String} product.name Nombre
   * @response {Number} product.price Precio
   * @response {URL} product.image URL a la imagen
   * @response {String} product.type Tipo/Categoría
   * @response {Date} product.dateEntry Fecha de creación
   * @code {200} si la autenticación es correcta
   * @code {401} si no hay cabecera de autenticación
   * @code {403} si no es ni admin
   * @code {404} si el producto con `productId` indicado no existe
   */
  app.delete('/products/:productId', requireAdmin, (req, resp, next) => {
    const { productId } = req.params;
    dataById('products', productId)
      .then((result) => {
        deleteData('products', productId)
        .then(()=> resp.status(200).send(result))
      })
      .catch(() => resp.status(400).send('not exist'));
  });

  nextMain();
};
