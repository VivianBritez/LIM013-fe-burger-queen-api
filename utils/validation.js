const validate = (email) => {
  // eslint-disable-next-line no-useless-escape
  const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
};
const valPassword = (str) => {
  // acepta letras mayusculas y minusculas, minimo 6 caracteres maximo 30
  const re = /[A-Za-z0-9]{6,30}$/;
  return re.test((str));
};
module.exports = {
  validate,
  valPassword,
};
