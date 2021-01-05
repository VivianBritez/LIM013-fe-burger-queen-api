const dataError = (headers, resp) => {
    if (headers) {
      return resp.status(401).send('401');
    }
  };
module.exports = { dataError };
