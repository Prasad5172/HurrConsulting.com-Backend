const {getJwtToken} = require("./jwt");
const response = require("./handler");

module.exports = {
  getJwtToken,
  ...response,
};