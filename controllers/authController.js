const Users = require("../models/Users");
const bcrypt = require("bcrypt");
const JWT = require("jsonwebtoken");
const { promisify } = require("util");
const AppError = require("../utils/appError");

const signToken = (id) => {
  return JWT.sign({ id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = async (user, res, statusCode) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === "production") cookieOptions.secure = true;
  res.cookie("jwt", token, cookieOptions);

  user.password = undefined;
  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

exports.signup = async (req, res, next) => {
  try {
    //1) Extracting data from body
    const data = {
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      confirmPassword: req.body.confirmPassword,
    };

    //2)Check data values exist or not
    if (!data.name || !data.email || !data.password || !data.confirmPassword) {
      return res.status(400).json({
        status: "fail",
        message: "Please enter all the fields.",
      });
    }

    if (data.password !== data.confirmPassword) {
      return res.status(400).json({
        status: "fail",
        message: "passowords are not same",
      });
    }

    //3)Submit the data
    data.password = await bcrypt.hash(data.password, 12);
    const user = await Users.create(data);

    //createToken and send
    if (user) {
      createSendToken(user, res, 201);
    }
  } catch (err) {
    res.status(500).json({
      message: err,
    });
  }
};

exports.login = async (req, res, next) => {
  try {
    //1) Extracting data from body and checked it exist or not
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new AppError("Please provide email or password", 400));
    }

    //2)Find the user with provided email
    const user = await Users.findOne({ email }).select("+password");

    if (!user) {
      return next(new AppError("Incorrect email or password", 400));
    }

    //3) Check the password correct or not.
    const correctPassword = await bcrypt.compare(password, user.password);

    if (!correctPassword) {
      return next(new AppError("Incorrect email or password", 400));
    }

    //4) Send the token
    createSendToken(user, res, 200);
  } catch (error) {
    next(error);
  }
};

exports.logout = (req, res, next) => {
  try {
    res.cookie("jwt", "Loggedout", {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true,
    });
    res.status(200).json({ status: "success" });
  } catch (err) {
    res.status(500).json({ status: "fail" });
  }
};

exports.protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization) {
      token = req.headers.authorization.split(" ")[1];
    } else {
      token = req.cookies.jwt;
    }

    if (!token) {
      return res.status(401).json({
        status: "fail",
        message: "currently you are not logged in",
      });
    }

    const decoded = await promisify(JWT.verify)(
      token,
      process.env.JWT_SECRET_KEY
    );

    // 3) Check user if still exists
    const currentUser = await Users.findById(decoded.id);
    if (!currentUser) {
      return next(
        new AppError(
          "The user belonging to this token does no longer exist.",
          401
        )
      );
    }
    req.user = currentUser;
    res.locals.user = currentUser;
  } catch (err) {
    next(err);
  }
  next();
};

exports.isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    // 1) Verify token
    try {
      const decoded = await promisify(JWT.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET_KEY
      );
      // console.log(decoded);

      // 3) Check user if still exists
      const currentUser = await Users.findById(decoded.id);

      //There is a logged in user
      res.locals.user = currentUser;
      req.user = currentUser;
    } catch (err) {
      return next();
    }
  }
  next();
};

exports.space = (req, res, next) => {
  res.status(200).json({
    data: "welcome to page",
  });
};
