const { db } = require("../db");
const bcrypt = require("bcryptjs");
const { errorImage } = require("../utils/functions");
require("dotenv").config();

const account_typeAllowed = ["individual", "business"];

const getAccounts = async (req, res) => {
  const dbName = process.env.DB_NAME;

  try {
    const result = await db
      .promise()
      .query(`SELECT * FROM \`${dbName}\`.accounts`);

    if (result[0]?.length === 0) {
      return res.status(404).send("No users found.");
    }

    const accounts = result[0].map(({ password, ...account }) => {
      if (account.profile_picture) {
        account.profile_picture = `${req.protocol}://${req.get(
          "host"
        )}/${account.profile_picture.replace(/\\/g, "/")}`;
      }
      return account;
    });

    return res.status(200).send(accounts);
  } catch (error) {
    console.error(error);
    return res.status(500).send(error);
  }
};

const getBatchAccounts = async (req, res) => {
  const dbName = process.env.DB_NAME;
  const { limit = 5, offset = 0 } = req.query;

  try {
    const parsedLimit = parseInt(limit, 10);
    const parsedOffset = parseInt(offset, 10);

    if (
      isNaN(parsedLimit) ||
      isNaN(parsedOffset) ||
      parsedLimit <= 0 ||
      parsedOffset < 0
    ) {
      return res.status(400).send("Invalid limit or offset values.");
    }

    if (Math.abs(parsedLimit - parsedOffset) > 10) {
      return res
        .status(400)
        .send(
          "The difference between limit and offset cannot be greater than 10."
        );
    }

    // 'offset 10' starts returning index 10, it is eleventh account in the list
    const query = `
        SELECT * FROM \`${dbName}\`.accounts
        LIMIT ? OFFSET ?`;
    const result = await db.promise().query(query, [parsedLimit, parsedOffset]);

    if (result[0]?.length === 0) {
      return res.status(404).send("No accounts found.");
    }

    const accounts = result[0].map(({ password, ...account }) => {
      if (account.profile_picture) {
        account.profile_picture = `${req.protocol}://${req.get(
          "host"
        )}/${account.profile_picture.replace(/\\/g, "/")}`;
      }
      return account;
    });
    return res.status(200).send(accounts);
  } catch (error) {
    console.error(error);
    return res.status(500).send(error);
  }
};

const getAccountById = async (req, res) => {
  const dbName = process.env.DB_NAME;
  const { id } = req.params;
  try {
    const result = await db
      .promise()
      .query(`SELECT * FROM \`${dbName}\`.accounts WHERE account_id = (?)`, id);

    if (result[0]?.length === 0) {
      return res.status(404).send("User not found.");
    }
    const { password, ...account } = result[0][0];
    // If profile_picture exists, generate the full URL
    if (account.profile_picture) {
      account.profile_picture = `${req.protocol}://${req.get(
        "host"
      )}/${account.profile_picture.replace(/\\/g, "/")}`;
    }

    return res.status(200).send(account);
  } catch (error) {
    return res.status(500).send(error);
  }
};

const getAccountByEmail = async (req, res) => {
  const dbName = process.env.DB_NAME;
  const { email } = req.params;
  try {
    const result = await db
      .promise()
      .query(`SELECT * FROM \`${dbName}\`.accounts WHERE email = (?)`, email);

    if (result[0]?.length === 0) {
      return res.status(404).send("Account not found.");
    }

    const { password, ...account } = result[0][0];
    // If profile_picture exists, generate the full URL
    if (account.profile_picture) {
      account.profile_picture = `${req.protocol}://${req.get(
        "host"
      )}/${account.profile_picture.replace(/\\/g, "/")}`;
    }
    return res.status(200).send(account);
  } catch (error) {
    return res.status(500).send(error);
  }
};

const updateAccount = async (req, res) => {
  const dbName = process.env.DB_NAME;
  //   const accountId = req.id;
  const accountId = req.params.id;
  const {
    username,
    full_name,
    email,
    age,
    bio,
    role_description,
    account_type,
  } = req.body;

  try {
    const [existingAccount] = await db
      .promise()
      .query(`SELECT * FROM \`${dbName}\`.accounts WHERE email = ?`, [email]);

    if (
      existingAccount[0] &&
      existingAccount[0]?.email === email &&
      accountId != existingAccount[0].account_id
    ) {
      errorImage(req.file ? req.file.path : null);
      return res.status(400).send({ message: "Email is already in use." });
    }

    const fieldsToUpdate = [];
    const valuesToUpdate = [];

    if (username && username !== existingAccount[0]?.username) {
      fieldsToUpdate.push("username = ?");
      valuesToUpdate.push(username);
    }

    if (full_name && full_name !== existingAccount[0]?.full_name) {
      fieldsToUpdate.push("full_name = ?");
      valuesToUpdate.push(full_name);
    }

    if (email && email !== existingAccount[0]?.email) {
      fieldsToUpdate.push("email = ?");
      valuesToUpdate.push(email);
    }

    if (
      age &&
      age !== undefined &&
      age !== null &&
      age !== existingAccount[0]?.age
    ) {
      fieldsToUpdate.push("age = ?");
      valuesToUpdate.push(age);
    }

    if (bio && bio !== existingAccount[0]?.bio) {
      fieldsToUpdate.push("bio = ?");
      valuesToUpdate.push(bio);
    }

    if (
      role_description &&
      role_description !== existingAccount[0]?.role_description
    ) {
      fieldsToUpdate.push("role_description = ?");
      valuesToUpdate.push(role_description);
    }

    if (account_type && account_type !== existingAccount[0]?.account_type) {
      if (!account_typeAllowed.includes(account_type)) {
        errorImage(req.file ? req.file.path : null);
        return res.status(400).send({ message: "Invalid account type." });
      }
      fieldsToUpdate.push("account_type = ?");
      valuesToUpdate.push(account_type);
    }

    if (req.file) {
      // req.file.filename contains the name of the saved file
      fieldsToUpdate.push("profile_picture = ?");
      valuesToUpdate.push(`uploads/profile_pictures/${req.file.filename}`);
    }

    if (fieldsToUpdate.length === 0) {
      errorImage(req.file ? req.file.path : null);
      return res.status(400).send({
        message: "No valid fields provided to update, or no changes detected",
      });
    }

    valuesToUpdate.push(accountId);

    const sqlQuery = `UPDATE \`${dbName}\`.accounts SET ${fieldsToUpdate.join(
      ", "
    )} WHERE account_id = ?`;

    const [result] = await db.promise().query(sqlQuery, valuesToUpdate);

    if (result.affectedRows > 0) {
      return res.status(200).send({ message: "Account updated successfully." });
    } else {
      errorImage(req.file ? req.file.path : null);
      return res.status(404).send({ message: "Account not found." });
    }
  } catch (error) {
    console.error(error);
    errorImage(req.file ? req.file.path : null);
    return res.status(500).send(error);
  }
};

const changePasswordAccount = async (req, res) => {
  const dbName = process.env.DB_NAME;
  const accountId = req.params.id;
  const { password, newPassword } = req.body;

  try {
    if (!newPassword) {
      return res.status(400).send({ message: "New password is required." });
    }
    if (!password) {
      return res.status(400).send({ message: "Old password is required." });
    }

    if (password === newPassword) {
      return res.status(400).send({
        message: "New password should be different from old password.",
      });
    }

    //
    const [account] = await db
      .promise()
      .query(`SELECT * FROM \`${dbName}\`.accounts WHERE account_id  = ?`, [
        accountId,
      ]);
    if (account.length === 0) {
      return res.status(404).send({ message: "Account not found." });
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      account[0]?.password
    );
    if (!isPasswordValid) {
      return res.status(400).send({ message: "Old password is incorrect." });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const [result] = await db
      .promise()
      .query(
        `UPDATE \`${dbName}\`.accounts SET password = ? WHERE account_id  = ?`,
        [hashedPassword, accountId]
      );

    if (result.affectedRows > 0) {
      return res
        .status(200)
        .send({ message: "Password updated successfully." });
    } else {
      return res.status(404).send({ message: "Account not found." });
    }
  } catch (error) {
    return res.status(500).send(error);
  }
};

const deleteAccount = async (req, res) => {
  const dbName = process.env.DB_NAME;
  const userId = req.params.id;
  try {
    const [result] = await db
      .promise()
      .query(`DELETE FROM \`${dbName}\`.accounts WHERE account_id  = (?)`, [
        userId,
      ]);
    if (result.affectedRows > 0) {
      return res.status(200).send("Account deleted successfully.");
    } else {
      return res.status(404).send("Account not found.");
    }
  } catch (error) {
    console.error(error);
    return res.status(500).send(error);
  }
};

module.exports = {
  getAccounts,
  getBatchAccounts,
  getAccountById,
  getAccountByEmail,
  updateAccount,
  changePasswordAccount,
  deleteAccount,
};
