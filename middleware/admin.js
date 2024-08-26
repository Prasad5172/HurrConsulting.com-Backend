const JWT = require('jsonwebtoken');
const { responseHandler } = require('../helpers/handler.js');

const admin = (req, res, next) => {
    console.log("admin middleware")
  const token = req.headers.authorization.substring(7)
  console.log(token)
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
      console.log(decoded)
      if(decoded.user.is_admin){
         next()
         return;
      }
      return res
      .status(500)
      .json(responseHandler(false, 400, 'Not a admin', null));
    });
  } catch (err) {
    console.error(`error: ${err}`);
    return res
      .status(500)
      .json(responseHandler(false, 500, 'Server Error', null));
  }
};

module.exports = admin;