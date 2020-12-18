const { conexion } = require('../database');

module.exports = {
  getUsers: (req, resp, next) => {
    const sql = 'SELECT *FROM users';
    conexion.query(sql, (error, result) => {
      if (error) throw error;
      if (result.length > 0) {
        return resp.status(200).send(result);
      }
      return resp.status(400).send(error);
    });
  },
};
