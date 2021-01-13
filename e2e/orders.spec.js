jest.setTimeout(10000);
const { getDataByKeyword } = require('../bk_data/functiones');

const {
  fetch,
  fetchAsTestUser,
  fetchAsAdmin,
} = process;

describe('POST /orders', () => {
  it('should fail with 401 when no auth', () => (
    fetch('/orders', { method: 'POST' })
      .then((resp) => expect(resp.status).toBe(401))
  ));

  it('should fail with 400 when bad props', () => (
    fetchAsTestUser('/orders', { method: 'POST', body: {} })
      .then((resp) => expect(resp.status).toBe(400))
  ));

  it('should fail with 400 when empty items', () => (
    fetchAsTestUser('/orders', {
      method: 'POST',
      body: { products: [] },
    })
      .then((resp) => {
        expect(resp.status).toBe(400);
      })
  ));

  it('should create order as user (own order)', () => (
    Promise.all([
      fetchAsAdmin('/products', {
        method: 'POST',
        body: { name: 'product01', price: 10 },
      }),
      fetchAsTestUser('/users/test@test.test'),
    ])
      .then((responses) => {
        expect(responses[0].status).toBe(200);
        expect(responses[1].status).toBe(200);
        return Promise.all([responses[0].json(), responses[1].json()]);
      })
      .then(([product, user]) => fetchAsTestUser('/orders', {
        method: 'POST',
        body: { products: [{ productId: product._id, qty: 5 }], userId: user._id },
      }))
      .then((resp) => {
        expect(resp.status).toBe(200);
        return resp.json();
      })
      .then((json) => {
        expect(typeof json._id).toBe('string');
        // expect(json.client).toBe('client');
        expect(typeof json.dateEntry).toBe('string');
        expect(Array.isArray(json.products)).toBe(true);
        expect(json.products.length).toBe(1);
        expect(json.products[0].product.name).toBe('product01');
        expect(json.products[0].product.price).toBe(10);
      })
      .then(() => getDataByKeyword('products', 'name', 'product01'))
      .then((data) => {
        fetchAsAdmin(`/products/${data[0]._id}`, {
          method: 'DELETE',
        });
      })
  ));

  it('should create order as admin', () => (
    Promise.all([
      fetchAsAdmin('/products', {
        method: 'POST',
        body: { name: 'product02', price: 25 },
      }),
      fetchAsTestUser('/users/test@test.test'),
    ])
      .then((responses) => {
        expect(responses[0].status).toBe(200);
        expect(responses[1].status).toBe(200);
        return Promise.all([responses[0].json(), responses[1].json()]);
      })
      .then(([product, user]) => fetchAsAdmin('/orders', {
        method: 'POST',
        body: { products: [{ productId: product._id, qty: 25 }], userId: user._id },
      }))
      .then((resp) => {
        expect(resp.status).toBe(200);
        return resp.json();
      })
      .then((json) => {
        expect(typeof json._id).toBe('string');
        expect(typeof json.dateEntry).toBe('string');
        expect(Array.isArray(json.products)).toBe(true);
        expect(json.products.length).toBe(1);
        expect(json.products[0].product.name).toBe('product02');
        expect(json.products[0].product.price).toBe(25);
      })
      .then(() => getDataByKeyword('products', 'name', 'product02'))
      .then((data) => {
        fetchAsAdmin(`/products/${data[0]._id}`, {
          method: 'DELETE',
        });
      })
  ));
});

describe('GET /orders', () => {
  it('should fail with 401 when no auth', () => (
    fetch('/orders')
      .then((resp) => expect(resp.status).toBe(401))
  ));

  it('should get orders as user', () => (
    Promise.all([
      fetchAsAdmin('/products', {
        method: 'POST',
        body: { name: 'product03', price: 10 },
      }),
      fetchAsTestUser('/users/test@test.test'),
    ])
      .then((responses) => {
        expect(responses[0].status).toBe(200);
        expect(responses[1].status).toBe(200);
        return Promise.all([responses[0].json(), responses[1].json()]);
      })
      .then(([product, user]) => (
        Promise.all([
          fetchAsTestUser('/orders', {
            method: 'POST',
            body: { products: [{ productId: product._id, qty: 50 }], userId: user._id },
          }),
          fetchAsAdmin('/orders', {
            method: 'POST',
            body: { products: [{ productId: product._id, qty: 25 }], userId: user._id },
          }),
        ])
          .then((responses) => {
            expect(responses[0].status).toBe(200);
            expect(responses[1].status).toBe(200);
            return fetchAsTestUser('/orders');
          })
          .then((resp) => {
            expect(resp.status).toBe(200);
            return resp.json();
          })
      ))
      .then((orders) => {
        expect(Array.isArray(orders)).toBe(true);
        expect(orders.length > 0);
        const userIds = orders.reduce((memo, order) => (
          (memo.indexOf(order.userId) === -1)
            ? [...memo, order.userId]
            : memo
        ), []);
        expect(userIds.length >= 1).toBe(true);
      })
      .then(() => getDataByKeyword('products', 'name', 'product03'))
      .then((data) => {
        fetchAsAdmin(`/products/${data[0]._id}`, {
          method: 'DELETE',
        });
      })
  ));

  it('should get orders as admin', () => (
    Promise.all([
      fetchAsAdmin('/products', {
        method: 'POST',
        body: { name: 'product04', price: 10 },
      }),
      fetchAsTestUser('/users/test@test.test'),
    ])
      .then((responses) => {
        expect(responses[0].status).toBe(200);
        expect(responses[1].status).toBe(200);
        return Promise.all([responses[0].json(), responses[1].json()]);
      })
      .then(([product, user]) => (
        Promise.all([
          fetchAsTestUser('/orders', {
            method: 'POST',
            body: { products: [{ productId: product._id, qty: 50 }], userId: user._id },
          }),
          fetchAsAdmin('/orders', {
            method: 'POST',
            body: { products: [{ productId: product._id, qty: 25 }], userId: user._id },
          }),
        ])
          .then((responses) => {
            expect(responses[0].status).toBe(200);
            expect(responses[1].status).toBe(200);
            return fetchAsAdmin('/orders');
          })
          .then((resp) => {
            expect(resp.status).toBe(200);
            return resp.json();
          })
      ))
      .then((orders) => {
        expect(Array.isArray(orders)).toBe(true);
        expect(orders.length > 0);
        const userIds = orders.reduce((memo, order) => (
          (memo.indexOf(order.userId) === -1)
            ? [...memo, order.userId]
            : memo
        ), []);
        expect(userIds.length >= 1).toBe(true);
      })
      .then(() => getDataByKeyword('products', 'name', 'product04'))
      .then((data) => {
        fetchAsAdmin(`/products/${data[0]._id}`, {
          method: 'DELETE',
        });
      })
  ));
});

describe('GET /orders/:orderId', () => {
  it('should fail with 401 when no auth', () => (
    fetch('/orders/xxx')
      .then((resp) => expect(resp.status).toBe(401))
  ));

  it('should fail with 404 when admin and not found', () => (
    fetchAsAdmin('/orders/xxx')
      .then((resp) => expect(resp.status).toBe(404))
  ));

  it('should get order as user', () => (
    Promise.all([
      fetchAsAdmin('/products', {
        method: 'POST',
        body: { name: 'product05', price: 99 },
      }),
      fetchAsTestUser('/users/test@test.test'),
    ])
      .then((responses) => {
        expect(responses[0].status).toBe(200);
        expect(responses[1].status).toBe(200);
        return Promise.all([responses[0].json(), responses[1].json()]);
      })
      .then(([product, user]) => fetchAsTestUser('/orders', {
        method: 'POST',
        body: { products: [{ productId: product._id, qty: 5 }], userId: user._id },
      }))
      .then((resp) => {
        expect(resp.status).toBe(200);
        return resp.json();
      })
      .then((json) => fetchAsTestUser(`/orders/${json._id}`))
      .then((resp) => {
        expect(resp.status).toBe(200);
        return resp.json();
      })
      .then((json) => {
        expect(json.products.length).toBe(1);
        expect(json.products[0].product.name).toBe('product05');
        expect(json.products[0].product.price).toBe(99);
      })
      .then(() => getDataByKeyword('products', 'name', 'product05'))
      .then((data) => {
        fetchAsAdmin(`/products/${data[0]._id}`, {
          method: 'DELETE',
        });
      })
  ));

  it('should get order as admin', () => (
    Promise.all([
      fetchAsAdmin('/products', {
        method: 'POST',
        body: { name: 'product0601', price: 10 },
      }),
      fetchAsTestUser('/users/test@test.test'),
    ])
      .then((responses) => {
        expect(responses[0].status).toBe(200);
        expect(responses[1].status).toBe(200);
        return Promise.all([responses[0].json(), responses[1].json()]);
      })
      .then(([product, user]) => fetchAsTestUser('/orders', {
        method: 'POST',
        body: { products: [{ productId: product._id, qty: 5 }], userId: user._id },
      }))
      .then((resp) => {
        expect(resp.status).toBe(200);
        return resp.json();
      })
      .then((json) => fetchAsAdmin(`/orders/${json._id}`))
      .then((resp) => {
        expect(resp.status).toBe(200);
        return resp.json();
      })
      .then((json) => {
        expect(json.products.length).toBe(1);
        expect(json.products[0].product.name).toBe('product0601');
        expect(json.products[0].product.price).toBe(10);
      })
      .then(() => getDataByKeyword('products', 'name', 'product0601'))
      .then((data) => {
        fetchAsAdmin(`/products/${data[0]._id}`, {
          method: 'DELETE',
        });
      })
  ));
});

describe('PUT /orders/:orderId', () => {
  it('should fail with 401 when no auth', () => (
    fetch('/orders/xxx', { method: 'PUT' })
      .then((resp) => expect(resp.status).toBe(401))
  ));

  it('should fail with 404 when not found', () => (
    fetchAsAdmin('/orders/xxx', {
      method: 'PUT',
      body: { status: 'canceled' },
    })
      .then((resp) => expect(resp.status).toBe(404))
  ));

  it('should fail with 400 when bad props', () => (
    Promise.all([
      fetchAsAdmin('/products', {
        method: 'POST',
        body: { name: 'product011', price: 66 },
      }),
      fetchAsTestUser('/users/test@test.test'),
    ])
      .then((responses) => {
        expect(responses[0].status).toBe(200);
        expect(responses[1].status).toBe(200);
        return Promise.all([responses[0].json(), responses[1].json()]);
      })
      .then(([product, user]) => fetchAsTestUser('/orders', {
        method: 'POST',
        body: { products: [{ productId: product._id, qty: 5 }], userId: user._id },
      }))
      .then((resp) => {
        expect(resp.status).toBe(200);
        return resp.json();
      })
      .then((json) => fetchAsTestUser(`/orders/${json._id}`))
      .then((resp) => resp.json())
      .then((json) => fetchAsAdmin(`/orders/${json._id}`, { method: 'PUT' }))
      .then((resp) => expect(resp.status).toBe(400))
      .then(() => getDataByKeyword('products', 'name', 'product011'))
      .then((data) => {
        fetchAsAdmin(`/products/${data[0]._id}`, {
          method: 'DELETE',
        });
      })
  ));

  it('should fail with 400 when bad status', () => (
    Promise.all([
      fetchAsAdmin('/products', {
        method: 'POST',
        body: { name: 'product012', price: 66 },
      }),
      fetchAsTestUser('/users/test@test.test'),
    ])
      .then((responses) => {
        expect(responses[0].status).toBe(200);
        expect(responses[1].status).toBe(200);
        return Promise.all([responses[0].json(), responses[1].json()]);
      })
      .then(([product, user]) => fetchAsTestUser('/orders', {
        method: 'POST',
        body: { products: [{ productId: product._id, qty: 5 }], userId: user._id },
      }))
      .then((resp) => {
        expect(resp.status).toBe(200);
        return resp.json();
      })
      .then((json) => fetchAsAdmin(`/orders/${json._id}`, {
        method: 'PUT',
        body: { status: 'oh yeah!' },
      }))
      .then((resp) => expect(resp.status).toBe(400))
      .then(() => getDataByKeyword('products', 'name', 'product012'))
      .then((data) => {
        fetchAsAdmin(`/products/${data[0]._id}`, {
          method: 'DELETE',
        });
      })
  ));

  it('should update order (set status to preparing)', () => (
    Promise.all([
      fetchAsAdmin('/products', {
        method: 'POST',
        body: { name: 'product013', price: 66 },
      }),
      fetchAsTestUser('/users/test@test.test'),
    ])
      .then((responses) => {
        expect(responses[0].status).toBe(200);
        expect(responses[1].status).toBe(200);
        return Promise.all([responses[0].json(), responses[1].json()]);
      })
      .then(([product, user]) => fetchAsTestUser('/orders', {
        method: 'POST',
        body: { products: [{ productId: product._id, qty: 5 }], userId: user._id },
      }))
      .then((resp) => {
        expect(resp.status).toBe(200);
        return resp.json();
      })
      .then((json) => {
        expect(json.status).toBe('pending');
        return fetchAsAdmin(`/orders/${json._id}`, {
          method: 'PUT',
          body: { status: 'preparing' },
        });
      })
      .then((resp) => {
        expect(resp.status).toBe(200);
        return resp.json();
      })
      .then((json) => expect(json.status).toBe('preparing'))
      .then(() => getDataByKeyword('products', 'name', 'product013'))
      .then((data) => {
        fetchAsAdmin(`/products/${data[0]._id}`, {
          method: 'DELETE',
        });
      })
  ));

  it('should update order (set status to delivering)', () => (
    Promise.all([
      fetchAsAdmin('/products', {
        method: 'POST',
        body: { name: 'product014', price: 66 },
      }),
      fetchAsTestUser('/users/test@test.test'),
    ])
      .then((responses) => {
        expect(responses[0].status).toBe(200);
        expect(responses[1].status).toBe(200);
        return Promise.all([responses[0].json(), responses[1].json()]);
      })
      .then(([product, user]) => fetchAsTestUser('/orders', {
        method: 'POST',
        body: { products: [{ productId: product._id, qty: 5 }], userId: user._id },
      }))
      .then((resp) => {
        expect(resp.status).toBe(200);
        return resp.json();
      })
      .then((json) => {
        expect(json.status).toBe('pending');
        return fetchAsAdmin(`/orders/${json._id}`, {
          method: 'PUT',
          body: { status: 'delivering' },
        });
      })
      .then((resp) => {
        expect(resp.status).toBe(200);
        return resp.json();
      })
      .then((json) => expect(json.status).toBe('delivering'))
      .then(() => getDataByKeyword('products', 'name', 'product014'))
      .then((data) => {
        fetchAsAdmin(`/products/${data[0]._id}`, {
          method: 'DELETE',
        });
      })
  ));

  it('should update order (set status to delivered)', () => (
    Promise.all([
      fetchAsAdmin('/products', {
        method: 'POST',
        body: { name: 'product025', price: 66 },
      }),
      fetchAsTestUser('/users/test@test.test'),
    ])
      .then((responses) => {
        expect(responses[0].status).toBe(200);
        expect(responses[1].status).toBe(200);
        return Promise.all([responses[0].json(), responses[1].json()]);
      })
      .then(([product, user]) => fetchAsTestUser('/orders', {
        method: 'POST',
        body: { products: [{ productId: product._id, qty: 5 }], userId: user._id },
      }))
      .then((resp) => {
        expect(resp.status).toBe(200);
        return resp.json();
      })
      .then((json) => {
        expect(json.status).toBe('pending');
        return fetchAsAdmin(`/orders/${json._id}`, {
          method: 'PUT',
          body: { status: 'delivered' },
        });
      })
      .then((resp) => {
        expect(resp.status).toBe(200);
        return resp.json();
      })
      .then((json) => {
        expect(json.status).toBe('delivered');
        expect(typeof json.dateProcessed).toBe('string');
      })
      .then(() => getDataByKeyword('products', 'name', 'product025'))
      .then((data) => {
        fetchAsAdmin(`/products/${data[0]._id}`, {
          method: 'DELETE',
        });
      })
  ));
});

describe('DELETE /orders/:orderId', () => {
  it('should fail with 401 when no auth', () => (
    fetch('/orders/xxx', { method: 'DELETE' })
      .then((resp) => expect(resp.status).toBe(401))
  ));

  it('should fail with 404 when not found', () => (
    fetchAsAdmin('/orders/xxx', { method: 'DELETE' })
      .then((resp) => expect(resp.status).toBe(404))
  ));

  it('should delete other order as admin', () => (
    Promise.all([
      fetchAsAdmin('/products', {
        method: 'POST',
        body: { name: 'product0202', price: 25 },
      }),
      fetchAsTestUser('/users/test@test.test'),
    ])
      .then((responses) => {
        expect(responses[0].status).toBe(200);
        expect(responses[1].status).toBe(200);
        return Promise.all([responses[0].json(), responses[1].json()]);
      })
      .then(([product, user]) => fetchAsTestUser('/orders', {
        method: 'POST',
        body: { products: [{ productId: product._id, qty: 5 }], userId: user._id },
      }))
      .then((resp) => {
        expect(resp.status).toBe(200);
        return resp.json();
      })
      .then(
        ({ _id }) => fetchAsAdmin(`/orders/${_id}`, { method: 'DELETE' })
          .then((resp) => ({ resp, _id })),
      )
      .then(({ resp, _id }) => {
        expect(resp.status).toBe(200);
        return fetchAsAdmin(`/orders/${_id}`);
      })
      .then((resp) => expect(resp.status).toBe(404))
      .then(() => getDataByKeyword('products', 'name', 'product0202'))
      .then((data) => {
        fetchAsAdmin(`/products/${data[0]._id}`, {
          method: 'DELETE',
        });
      })
  ));
});