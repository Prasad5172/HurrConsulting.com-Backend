const JWT = require('jsonwebtoken');
const { responseHandler } = require('../helpers');

const auth = (req, res, next) => {
  const token = req.headers.authorization.substring(7)
  // console.log(token)
  // Check if no token
  if (!token) {
    return res
      .status(401)
      .json(responseHandler(false, 401, 'token is null', null));
  }
  // Verify token
  try {
    JWT.verify(token, process.env.JWT_SECRET, (error, decoded) => {
      if (error) {
        return res
          .status(400)
          .json(responseHandler(false, 400, 'Try again', error));
      }
      // console.log(decoded)
      req.user = decoded.user;
      console.log("auth is successful")
      next();
    });
  } catch (err) {
    console.error(`error: ${err}`);
    return res
      .status(500)
      .json(responseHandler(false, 500, 'Server Error', null));
  }
};

module.exports = auth;