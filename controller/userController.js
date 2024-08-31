const bcryptjs = require("bcryptjs");
const userService = require("../service/userService.js");
const { responseHandler, asyncHandler } = require("../helpers/handler.js");
const { getJwtToken } = require("../helpers/jwt.js");
const userRepository = require("../repository/userRepository.js");
const emailService = require("../service/emailService.js");
const jwt = require("jsonwebtoken");
const axios = require("axios");

const register = asyncHandler(async (req, res) => {
  console.log("register route in controller");
  
  const authHeader = req.headers.authorization;
  // console.log("authHeader"+authHeader);
  let token = null;
  if (authHeader) {
    token = authHeader.split(" ")[1];
  }
//   return res.send(token);
  if (token != null) {
    const googleUserData = await axios.get(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log(googleUserData.data);
    // return res.send(googleUserData.data);
    const { email, name, picture, email_verified } = googleUserData.data;
    if (!email_verified) {
      return res
        .status(400)
        .json(
          responseHandler(false, 400, "email is not verified by google", null)
        );
    }
    let user = await userRepository.retrieveOne({ email: email });
    console.log(user);
    if (user == null) {
      user = await userRepository.create({
        email: email,
        first_name: name,
        image_url: picture,
        is_google_linked: true,
        google_id: googleUserData.sub,
      });
    } else {
      user.google_id = googleUserData.sub;
      user.is_google_linked = true;
      user.image_url = picture;
      await user.save();
    }
    const payload = {
      user: {
        user_id: user.user_id,
        first_name: user.first_name,
        email: user.email,
        image_url: user.image_url,
        is_admin: user.is_admin,
      },
    };
    console.log(payload);
    // for 1 week
    return getJwtToken(payload, "registred succesful", 10080, (err, data) => {
      if (err) {
        return res.status(err.code).json(err);
      }
      return res.status(200).json({
        ...data,
        name: user.first_name,
        email: user.email,
        is_admin: user.is_admin,
      });
    });
  }
    // return res.json("register route");
  try {
    var checkUser = await userRepository.retrieveOne({ email: req.body.email });
    console.log("checkUser" + checkUser);
    if (checkUser && checkUser.is_verified) {
      return res
        .status(400)
        .json(responseHandler(false, 400, "alredy email registred", null));
    } else if (!checkUser) {
      // console.log(checkUser)
      // console.log("check user is null")
      checkUser = await userService.register(req.body);
    } else {
      // console.log("before",checkUser)
      checkUser.password = await bcryptjs.hash(req.body.password, 10);
      checkUser.save();
      // console.log("after",checkUser)
    }
    // return res.json(checkUser);
    console.log("checkUser", checkUser);
    await emailService.sendOtpToEmail(
      req.body,
      checkUser.user_id,
      (err, data) => {
        if (err) {
          return res.status(err.code).json(err);
        }
        return res.status(200).json(data);
      }
    );
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json(responseHandler(false, 500, "Server Error", null));
  }
});

const login = async (req, res, next) => {
  console.log("login");
  const authHeader = req.headers.authorization;
  let token = null;
  if (authHeader) {
    token = authHeader.split(" ")[1];
  }
  // console.log(token);
  if (token != null) {
    var googleUserData = jwt.decode(token);
    console.log(googleUserData);
    // return res.send(googleUserData);
    // console.log(googleUserData);
    const { email, name, picture, email_verified } = googleUserData;
    let user = await userRepository.retrieveOne({ email: email });
    if (!user) {
      return res.status(400).json(responseHandler(false, 400, "signup", null));
    }
    const payload = {
      user: {
        user_id: user.user_id,
        is_admin: user.is_admin,
      },
    };
    if (user.is_google_linked) {
      console.log("user.is_google_linked true");
      return getJwtToken(payload, "registred succesful", 10080, (err, data) => {
        if (err) {
          return res
            .status(err.code)
            .json(responseHandler(false, err.code, err.message, null));
        }
        return res.status(200).json({
          ...data,
          name: user.first_name,
          email: user.email,
          is_admin: user.is_admin,
        });
      });
    }
    console.log("user.is_google_linked false");
    return res
      .status(400)
      .json(responseHandler(false, 400, "not registred with google", null));
  }
  try {
    const { email, password } = req.body;
    const user = await userRepository.retrieveOne({ email: email });
    console.log(user);
    if (user == null) {
      return res.status(400).json(responseHandler(false, 400, "signup", null));
    }
    const payload = {
      user: {
        user_id: user.user_id,
        is_admin: user.is_admin,
      },
    };
    if (user && !user.password && user.is_google_linked) {
      return res
        .status(400)
        .json(responseHandler(false, 400, "sign in with google", null));
    }
    if (user && !user.is_verified) {
      return res.status(400).json(responseHandler(false, 400, "signup", null));
    }
    const isMatch = await bcryptjs.compare(password, user.password);
    console.log("isMatch", isMatch);
    if (isMatch) {
      return getJwtToken(payload, "registred succesful", 10080, (err, data) => {
        if (err) {
          return res.status(err.code).json(err);
        }
        return res.status(200).json({
          ...data,
          name: user.first_name,
          email: user.email,
          is_admin: user.is_admin,
        });
      });
    } else {
      return res
        .status(400)
        .json(responseHandler(false, 400, "password mismatch", null));
    }
  } catch (error) {
    console.log(error + "insignin");
    return res
      .status(400)
      .json(responseHandler(false, 500, error.message, null));
  }
};

const checkEmail = asyncHandler(async (req, res) => {
  const { email } = req.body;
  let user = null;
  await userService.retrieveOneByEmail(email, (err, data) => {
    if (err) {
      return res.status(err.code).json(err);
    }
    user = data;
  });
  if (user) {
    res.status(200).json("successful");
  } else {
    res.status(400).json("notsuccessful");
  }
});

const resetPassword = asyncHandler(async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const passwordHash = await bcryptjs.hash(password, 10);
    let user = await userRepository.retrieveOne({ email: email });
    user.password = passwordHash;
    await user.save();
    return res.status(200).json("reset succesful");
  } catch (error) {
    console.log(error);
    res.status(400).json("failedtoupdate");
  }
});

const retriveUsers = async (req, res, next) => {
    // return res.status(200).send(process.env.SERVICE_ACCOUNT_PRIVATE_KEY);
  const users = await userRepository.retrieveAll((err, data) => {
    if (err) {
      return res.status(400).send(err.message);
    }
    console.log(data);
    return res.status(200).json(data);
  });
};

const verifyToken = async (req, res, next) => {
  console.log("userController/verifyToken");
  try {
    const authHeader = req.headers.authorization;
    console.log(authHeader);
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json(responseHandler(false, 401, "No token provided", null));
    }

    const token = authHeader.substring(7); // Remove "Bearer " from the token4
    console.log(token);
    // Convert jwt.verify to return a promise
    const decodeToken = (token) => {
      return new Promise((resolve, reject) => {
        jwt.verify(token, process.env.JWT_SECRET, (error, decoded) => {
          if (error) {
            return reject(error);
          }
          resolve(decoded);
        });
      });
    };

    const decoded = await decodeToken(token);
    const id = decoded.user.user_id;

    // Fetch user profile
    const user = await userRepository.getProfile(id);

    if (user) {
      return res
        .status(200)
        .json(responseHandler(true, 200, "Verified successfully", user));
    }

    return res
      .status(400)
      .json(responseHandler(false, 400, "Token is not valid", null));
  } catch (error) {
    console.log("Error:", error);
    if (error.name === "JsonWebTokenError") {
      return res
        .status(400)
        .json(responseHandler(false, 400, "Malformed token", null));
    }
    return res
      .status(500)
      .json(responseHandler(false, 500, error.message, null));
  }
};

const retriveUser = async (req, res, next) => {
  const userId = req.user.user_id;
  const user = await userRepository.getProfile(userId);
  return res.status(200).json(responseHandler(false, 200, "success", user));
};

module.exports = {
  register,
  login,
  retriveUser,
  verifyToken,
  resetPassword,
  checkEmail,
  retriveUsers,
};
