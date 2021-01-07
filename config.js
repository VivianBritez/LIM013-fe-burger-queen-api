require('dotenv').config({ path: 'secrets.env' });

const db = {
  host: process.env.DHOST || process.env.HOST,
  user: process.env.DUSER_DB || process.env.USER_DB,
  password: process.env.DPASSWORD_DB || process.env.PASSWORD_DB,
  database: process.env.DDB_NAME || process.env.DB_NAME,
};
// console.log(db);
exports.port = process.argv[2] || process.env.PORT || 8080;
exports.dbUrl = db;
exports.secret = process.env.JWT_SECRET;
exports.adminEmail = process.env.ADMIN_EMAIL;
exports.adminPassword = process.env.ADMIN_PASSWORD;
