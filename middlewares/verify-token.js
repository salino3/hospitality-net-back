const jwt = require("jsonwebtoken");

const verifyJWT = (key = "", checkRole = false) => {
  return (req, res, next) => {
    const endToken = req.headers["end_token"];

    if (!endToken) {
      return res
        .status(400)
        .send({ message: "Numbers (cookie identifier) is missing." });
    }

    const cookieName = `auth_token_${endToken}`;

    const cookieValue = req.cookies[cookieName];
    if (!cookieValue) {
      return res.status(400).send({ message: `Cookie end code is missing.` });
    }

    try {
      const decoded = jwt.verify(cookieValue, process.env.SECRET_KEY);
      if (key) {
        // Verification IDs users

        const paramsId = req.params[key];

        if (decoded.id != paramsId && decoded?.role_user !== "admin") {
          return res.status(401).send({ message: "Unauthorized." });
        }
        req[key] = decoded[key];
        if (checkRole) {
          req["role_user"] = decoded.role_user;
        }
        next();
      } else {
        if (decoded) {
          const userId = req.params.userId;
          if (userId == decoded?.id) {
            next();
          } else {
            return res
              .status(403)
              .send({ message: "Forbidden: Invalid token." });
          }
          //
        } else {
          return res.status(403).send({ message: "Forbidden: Invalid token." });
        }
      }
    } catch (error) {
      return res.status(403).send({ message: "Forbidden: Invalid token." });
    }
  };
};

const verifyRole = (role = "") => {
  return (req, res, next) => {
    if (req["role_user"] === role) {
      return next();
    } else {
      return res.status(403).send({ message: "Forbidden: Invalid role." });
    }
  };
};

module.exports = { verifyJWT, verifyRole };
