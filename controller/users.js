const { pagination } = require('../utils/utils');
const { getAllData } = require('../bk_data/functiones');

module.exports = {
  getUsers: (req, resp, next, table) => {
    const { page, limit } = req.query;
    const pages = Number(page);
    const limits = Number(limit);
    getAllData(table)
      .then((result) => {
        const response = pagination(pages, limits, result, table);
        resp.header('link', response.link);
        if (response.list) {
          const jsonUserResp = response.list.map((x) => {
            const role = (x.rolesAdmin) || false;
            const id = (!x._id) ? 0 : (x._id).toString();
            return {
              _id: id,
              email: x.email,
              roles: { admin: role },
            };
          });
          // eslint-disable-next-line array-callback-return

          // eslint-disable-next-line no-console
          switch (table) {
            case 'users':
              return resp.status(200).send(jsonUserResp);
            default:
              break;
          }
        }
        return resp.status(404).send('Page not found');
      });
  },
};
