const {
  requireAuth,
} = require('../middleware/auth');
const { getData } = require('../controller/users');
const {
  getDataByKeyword, createData, updateDataByKeyword, deleteData,
} = require('../bk_data/functiones');

const { dataError, getOrderProduct } = require('../utils/utils');

/** @module orders */
module.exports = (app, nextMain) => {
  /**
   * @name GET /orders
   * @description Lista órdenes
   * @path {GET} /orders
   * @query {String} [page=1] Página del listado a consultar
   * @query {String} [limit=10] Cantitad de elementos por página
   * @header {Object} link Parámetros de paginación
   * @header {String} link.first Link a la primera página
   * @header {String} link.prev Link a la página anterior
   * @header {String} link.next Link a la página siguiente
   * @header {String} link.last Link a la última página
   * @auth Requiere `token` de autenticación
   * @response {Array} orders
   * @response {String} orders[]._id Id
   * @response {String} orders[].userId Id usuaria que creó la orden
   * @response {String} orders[].client Clienta para quien se creó la orden
   * @response {Array} orders[].products Productos
   * @response {Object} orders[].products[] Producto
   * @response {Number} orders[].products[].qty Cantidad
   * @response {Object} orders[].products[].product Producto
   * @response {String} orders[].status Estado: `pending`, `canceled`, `delivering` o `delivered`
   * @response {Date} orders[].dateEntry Fecha de creación
   * @response {Date} [orders[].dateProcessed] Fecha de cambio de `status` a `delivered`
   * @code {200} si la autenticación es correcta
   * @code {401} si no hay cabecera de autenticación
   */
  app.get('/orders', requireAuth, (req, resp, next) => getData(req, resp, next, 'orders'));

  /**
   * @name GET /orders/:orderId
   * @description Obtiene los datos de una orden especifico
   * @path {GET} /orders/:orderId
   * @params {String} :orderId `id` de la orden a consultar
   * @auth Requiere `token` de autenticación
   * @response {Object} order
   * @response {String} order._id Id
   * @response {String} order.userId Id usuaria que creó la orden
   * @response {String} order.client Clienta para quien se creó la orden
   * @response {Array} order.products Productos
   * @response {Object} order.products[] Producto
   * @response {Number} order.products[].qty Cantidad
   * @response {Object} order.products[].product Producto
   * @response {String} order.status Estado: `pending`, `canceled`, `delivering` o `delivered`
   * @response {Date} order.dateEntry Fecha de creación
   * @response {Date} [order.dateProcessed] Fecha de cambio de `status` a `delivered`
   * @code {200} si la autenticación es correcta
   * @code {401} si no hay cabecera de autenticación
   * @code {404} si la orden con `orderId` indicado no existe
   */
  app.get('/orders/:orderId', requireAuth, (req, resp, next) => {
    const { orderId } = req.params;
    if (!orderId || !req.headers.authorization) {
      return dataError(!orderId, !req.headers.authorization, resp);
    }
    getDataByKeyword('orders', '_id', orderId)
      .then((result) => {
        const ordersSwitch = (result[0].switch === 0);
        console.info(ordersSwitch);
        if (ordersSwitch) { getOrderProduct(orderId, result, resp); } else { next(500); }
      })
      .catch(() => resp.status(404).send({ message: 'The requested order does not exist' }));
  });

  /**
   * @name POST /orders
   * @description Crea una nueva orden
   * @path {POST} /orders
   * @auth Requiere `token` de autenticación
   * @body {String} userId Id usuaria que creó la orden
   * @body {String} client Clienta para quien se creó la orden
   * @body {Array} products Productos
   * @body {Object} products[] Producto
   * @body {String} products[].productId Id de un producto
   * @body {Number} products[].qty Cantidad de ese producto en la orden
   * @response {Object} order
   * @response {String} order._id Id
   * @response {String} order.userId Id usuaria que creó la orden
   * @response {String} order.client Clienta para quien se creó la orden
   * @response {Array} order.products Productos
   * @response {Object} order.products[] Producto
   * @response {Number} order.products[].qty Cantidad
   * @response {Object} order.products[].product Producto
   * @response {String} order.status Estado: `pending`, `canceled`, `delivering` o `delivered`
   * @response {Date} order.dateEntry Fecha de creación
   * @response {Date} [order.dateProcessed] Fecha de cambio de `status` a `delivered`
   * @code {200} si la autenticación es correcta
   * @code {400} no se indica `userId` o se intenta crear una orden sin productos
   * @code {401} si no hay cabecera de autenticación
   */
  // eslint-disable-next-line no-unused-vars
  app.post('/orders', requireAuth, (req, resp, next) => {
    const {
      userId, client, products,
    } = req.body;
    if ((!userId || !products) || !req.headers.authorization) {
      return dataError((!userId || !products), !req.headers.authorization, resp);
    }
    const date = new Date();

    const newOrder = {
      userId: Number(userId),
      client,
      status: 'pending',
      dateEntry: date,
    };
    // saving orders in DB
    createData('orders', newOrder)
      .then((result) => {
        // because we need to save all products in the list in orders_products table
        products.forEach((productObj) => {
          const newOrderProduct = {
            orderId: result.insertId,
            qty: productObj.qty,
            productId: productObj.productId,
          };
          // eslint-disable-next-line no-console
          console.log('NEW ORDER PRODUCT', newOrderProduct);
          createData('orders_products', newOrderProduct);
        });
        const dataProduct = products.map((p) => {
          const productID = p.productId;
          return getDataByKeyword('products', '_id', productID);
        });
        // newOrder.products = [];
        Promise.all(dataProduct).then((values) => {
          newOrder._id = (result.insertId).toString();

          newOrder.products = values.flat().map((e) => ({
            product: e,
          }));
          newOrder.products.forEach((x, i) => {
            // eslint-disable-next-line no-param-reassign
            x.qty = products[i].qty;
          });
          return resp.status(200).send(newOrder);
        });
      })
      .catch((error) => console.error(error));
  });

  /**
   * @name PUT /orders
   * @description Modifica una orden
   * @path {PUT} /products
   * @params {String} :orderId `id` de la orden
   * @auth Requiere `token` de autenticación
   * @body {String} [userId] Id usuaria que creó la orden
   * @body {String} [client] Clienta para quien se creó la orden
   * @body {Array} [products] Productos
   * @body {Object} products[] Producto
   * @body {String} products[].productId Id de un producto
   * @body {Number} products[].qty Cantidad de ese producto en la orden
   * @body {String} [status] Estado: `pending`, `canceled`, `delivering` o `delivered`
   * @response {Object} order
   * @response {String} order._id Id
   * @response {String} order.userId Id usuaria que creó la orden
   * @response {Array} order.products Productos
   * @response {Object} order.products[] Producto
   * @response {Number} order.products[].qty Cantidad
   * @response {Object} order.products[].product Producto
   * @response {String} order.status Estado: `pending`, `canceled`, `delivering` o `delivered`
   * @response {Date} order.dateEntry Fecha de creación
   * @response {Date} [order.dateProcessed] Fecha de cambio de `status` a `delivered`
   * @code {200} si la autenticación es correcta
   * @code {400} si no se indican ninguna propiedad a modificar o la propiedad `status` no es valida
   * @code {401} si no hay cabecera de autenticación
   * @code {404} si la orderId con `orderId` indicado no existe
   */
  // eslint-disable-next-line no-unused-vars
  app.put('/orders/:orderId', requireAuth, (req, resp, next) => {
    const { orderId } = req.params;
    const {
      userId, client, products, status,
    } = req.body;
    const notAnyProperty = !(userId || client || products || status);
    const validateStatus = (status) ? ['pending', 'canceled', 'preparing', 'delivering', 'delivered'].includes(status) : true;

    if ((notAnyProperty || !validateStatus) || !req.headers.authorization) {
      return dataError((notAnyProperty || !validateStatus), !req.headers.authorization, resp);
    }
    const date = new Date();
    const newOrder = {
      ...((userId) && { userId }),
      ...((client) && { client }),
      ...((status) && { status }),
      ...((status === 'delivered') && { dateProcessed: date }),
    };
    getDataByKeyword('orders', '_id', orderId)
      .then(() => {
        updateDataByKeyword('orders', newOrder, '_id', orderId)
          .then(() => {
            if (products) {
              const x = products.reduce((acumulator, element) => {
                const newOrderProduct = {
                  ...((products) && { qty: element.qty, productId: element.productId }),
                };
                acumulator.push(updateDataByKeyword('orders_products', newOrderProduct, 'productId', element.productId));
                return acumulator;
              }, []);
              Promise.all(x)
                .then(() => {
                  getDataByKeyword('orders', '_id', orderId)
                    .then((result) => {
                      getOrderProduct(orderId, result, resp);
                    });
                });
            } else {
              getDataByKeyword('orders', '_id', orderId)
                .then((result) => {
                  getOrderProduct(orderId, result, resp);
                });
            }
          });
      })
      .catch(() => resp.status(404).send({ message: `There is no order with that id : ${orderId}` }));
  });

  /**
   * @name DELETE /orders
   * @description Elimina una orden
   * @path {DELETE} /orders
   * @params {String} :orderId `id` del producto
   * @auth Requiere `token` de autenticación
   * @response {Object} order
   * @response {String} order._id Id
   * @response {String} order.userId Id usuaria que creó la orden
   * @response {String} order.client Clienta para quien se creó la orden
   * @response {Array} order.products Productos
   * @response {Object} order.products[] Producto
   * @response {Number} order.products[].qty Cantidad
   * @response {Object} order.products[].product Producto
   * @response {String} order.status Estado: `pending`, `canceled`, `delivering` o `delivered`
   * @response {Date} order.dateEntry Fecha de creación
   * @response {Date} [order.dateProcessed] Fecha de cambio de `status` a `delivered`
   * @code {200} si la autenticación es correcta
   * @code {401} si no hay cabecera de autenticación
   * @code {404} si el producto con `orderId` indicado no existe
   */
  // eslint-disable-next-line no-unused-vars
  app.delete('/orders/:orderId', requireAuth, (req, resp, next) => {
    const { orderId } = req.params;
    if (!orderId || !req.headers.authorization) {
      return dataError(!orderId, !req.headers.authorization, resp);
    }
    return getDataByKeyword('orders', '_id', orderId)
      .then((result) => {
        getOrderProduct(orderId, result, resp);
        deleteData('orders', '_id', orderId);
      })
      .catch(() => resp.status(404).send({ message: `The requested order does not exist ${orderId}.` }));
  });

  nextMain();
};
