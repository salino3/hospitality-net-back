const { db } = require("../db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const upload = require("../middlewares/multerConfig");
const fs = require("fs");
require("dotenv").config();

const registerAccount = async (req, res) => {
  const errorImage = (profile_picture) => {
    if (profile_picture) {
      fs.unlink(profile_picture, (unlinkErr) => {
        if (unlinkErr) {
          console.error("Error deleting the image:", unlinkErr);
        } else {
          console.log("The image was deleted successfully");
        }
      });
    }
  };

  upload.single("profile_picture")(req, res, async (err) => {
    if (err) {
      return res.status(400).send("Error at upoading image: " + err.message);
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

module.exports = { registerAccount };

// const registerAccount = async (req, res) => {
//   const {
//     account_type,
//     profile_picture,
//     username,
//     full_name,
//     email,
//     password,
//     age,
//     bio,
//     role_description,
//   } = req.body;

//   await db
//     .promise()
//     .query("SELECT email FROM accounts WHERE email = (?)", [email])
//     .then((result) => {
//       if (result[0].length > 0) {
//         return res.send("This email is already in use");
//       } else if (age < 18) {
//         return res.send("You must be at least 18 years old");
//       } else if (password !== passwordConfirm) {
//         if (password?.length < 6 || passwordConfirm?.length < 6) {
//           return res.send("Password should be at least 6 characters long");
//         }
//         return res.send("Password and confirm password do not match");
//       }

//       const hashedPassword = bcrypt.hashSync(password, 10);

//       return db
//         .promise()
//         .query("INSERT INTO accounts SET ?", {
//           account_type: account_type ? account_type : "individual",
//           profile_picture,
//           username,
//           full_name,
//           email,
//           password,
//           age,
//           bio,
//           role_description,
//           password: hashedPassword,
//         })
//         .then(() => {
//           return res.send("User registered successfully");
//         })
//         .catch((err) => {
//           console.error(err);
//           return res.send("Error registering user");
//         });
//     })
//     .catch((err) => {
//       console.error(err);
//       return res.status(500).send("Error checking email");
//     });
// };
