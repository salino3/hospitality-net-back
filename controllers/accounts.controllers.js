const { db } = require("../db");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const getAccounts = async (req, res) => {
  const dbName = process.env.DB_NAME;

  try {
    const result = await db
      .promise()
      .query(`SELECT * FROM \`${dbName}\`.accounts`);

    if (result[0]?.length === 0) {
      return res.status(404).send("No users found.");
    }

    const accounts = result[0].map(({ password, ...account }) => account);
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

    // 'offset 10' starts returning index 10, it is eleventh account in the list
    const query = `
        SELECT * FROM \`${dbName}\`.accounts
        LIMIT ? OFFSET ?`;
    const result = await db.promise().query(query, [parsedLimit, parsedOffset]);

    if (result[0]?.length === 0) {
      return res.status(404).send("No account found.");
    }

    const accounts = result[0].map(({ password, ...account }) => account);
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

    return res.status(200).send(account);
  } catch (error) {
    return res.status(500).send(error);
  }
};

const getAccountsByEmail = async (req, res) => {
  const dbName = process.env.DB_NAME;
  const { email } = req.params;
  try {
    const result = await db
      .promise()
      .query(`SELECT * FROM \`${dbName}\`.accounts WHERE email = (?)`, email);

    if (result[0]?.length === 0) {
      return res.status(404).send("Account not found.");
    }

    const { password, ...user } = result[0][0];
    return res.status(200).send(user);
  } catch (error) {
    return res.status(500).send(error);
  }
};

const updateAccount = async (req, res) => {
  const dbName = process.env.DB_NAME;
  const accountId = req.id;
  const { username, full_name, email, age, bio, role_description } = req.body;

  try {
    const [existingAccount] = await db
      .promise()
      .query(`SELECT * FROM \`${dbName}\`.accounts WHERE email = ?`, [email]);

    if (
      existingAccount[0] &&
      existingAccount[0]?.email === email &&
      accountId != existingAccount[0].account_id
    ) {
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

    if (fieldsToUpdate.length === 0) {
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
      return res.status(404).send({ message: "Account not found." });
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
  getAccountsByEmail,
};
