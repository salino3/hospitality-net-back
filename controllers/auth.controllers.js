const { db } = require("../db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { customUpload } = require("../middlewares/multerConfig");
const { errorImage } = require("../utils/functions");
require("dotenv").config();

const registerAccount = async (req, res) => {
  customUpload("profile_pictures", "profile_picture")(req, res, async (err) => {
    if (err) {
      return res.status(400).send("Error at upolading image: " + err.message);
    }

    const {
      account_type,
      username,
      full_name,
      email,
      password,
      age,
      bio,
      role_description,
      passwordConfirm,
    } = req.body;

    // Check if the image is uploaded
    const profile_picture = req.file ? req.file.path : null;

    if (req.file) {
      console.log("Image uploaded:", req.file.path);
    }

    await db
      .promise()
      .query("SELECT email FROM accounts WHERE email = (?)", [email])
      .then((result) => {
        if (result[0].length > 0) {
          errorImage(profile_picture);
          return res.send("This email is already in use");
        } else if (age < 18) {
          errorImage(profile_picture);
          return res.send("You must be at least 18 years old");
        } else if (password !== passwordConfirm) {
          if (password?.length < 6 || passwordConfirm?.length < 6) {
            errorImage(profile_picture);
            return res.send("Password should be at least 6 characters long");
          }
          errorImage(profile_picture);
          return res.send("Password and confirm password do not match");
        }

        const hashedPassword = bcrypt.hashSync(password, 10);

        return db
          .promise()
          .query("INSERT INTO accounts SET ?", {
            account_type: account_type || "individual",
            profile_picture,
            username,
            full_name,
            email,
            password: hashedPassword,
            age,
            bio,
            role_description,
          })
          .then(() => {
            return res.send("Account registered successfully");
          })
          .catch((err) => {
            errorImage(profile_picture);
            console.error(err);
            return res.send("Error registering user");
          });
      })
      .catch((err) => {
        console.error(err);
        errorImage(profile_picture);
        return res.status(500).send("Error checking email");
      });
  });
};

const loginAccount = async (req, res) => {
  const { email, password: psw } = req.body;

  db.promise()
    .query("SELECT * FROM accounts WHERE email = (?)", [email])
    .then((result) => {
      if (result[0].length === 0) {
        return res.status(404).send("Email not found");
      }

      //
      // const user = result[0][0];
      const isPasswordValid = bcrypt.compareSync(psw, result[0][0].password);
      if (!isPasswordValid) {
        return res.status(401).send("Invalid password");
      }
      //
      const { password, ...account } = result[0][0];

      // Generate token
      const token = jwt.sign(
        // {
        //   id: user.account_id,
        //   email: user.email,
        //   role_user: user.role_user,
        // },
        account,
        process.env.SECRET_KEY,
        {
          expiresIn: "1h",
        }
      );

      const generateRandomNumber = () => {
        return Math.floor(1000 + Math.random() * 9000);
      };

      res.cookie("auth_token_" + generateRandomNumber(), token, {
        httpOnly: process.env.NODE_ENV === "production",
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "None" : "Strict",
        expires: new Date(Date.now() + 3600 * 1000),
      });

      return res.json({
        message: "Login successful",
      });
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).send("Error during login");
    });
};

module.exports = { registerAccount, loginAccount };
