const { db } = require("../db");
require("dotenv").config();

const getCompanies = async (req, res) => {
  const dbName = process.env.DB_NAME;

  try {
    const result = await db
      .promise()
      .query(`SELECT * FROM \`${dbName}\`.companies`);

    if (result[0]?.length === 0) {
      return res.status(404).send("No companies found.");
    }

    const companies = result[0].map(({ password, ...companies }) => {
      if (companies.profile_picture) {
        companies.profile_picture = `${req.protocol}://${req.get(
          "host"
        )}/${companies.profile_picture.replace(/\\/g, "/")}`;
      }
      return companies;
    });

    return res.status(200).send(companies);
  } catch (error) {
    console.error(error);
    return res.status(500).send(error);
  }
};

const getBatchCompanies = async (req, res) => {
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
        SELECT * FROM \`${dbName}\`.companies
        LIMIT ? OFFSET ?`;
    const result = await db.promise().query(query, [parsedLimit, parsedOffset]);

    if (result[0]?.length === 0) {
      return res.status(404).send("No companies found.");
    }

    const companies = result[0].map(({ password, ...company }) => {
      if (company.profile_picture) {
        company.profile_picture = `${req.protocol}://${req.get(
          "host"
        )}/${company.profile_picture.replace(/\\/g, "/")}`;
      }
      return company;
    });
    return res.status(200).send(companies);
  } catch (error) {
    console.error(error);
    return res.status(500).send(error);
  }
};

module.exports = { getCompanies, getBatchCompanies };
