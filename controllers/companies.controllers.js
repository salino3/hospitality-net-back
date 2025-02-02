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

    const companies = result[0].map((companies) => {
      if (companies.logo) {
        companies.logo = `${req.protocol}://${req.get(
          "host"
        )}/${companies.logo.replace(/\\/g, "/")}`;
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

    const companies = result[0].map((company) => {
      if (company.logo) {
        company.logo = `${req.protocol}://${req.get(
          "host"
        )}/${company.logo.replace(/\\/g, "/")}`;
      }
      return company;
    });
    return res.status(200).send(companies);
  } catch (error) {
    console.error(error);
    return res.status(500).send(error);
  }
};

const getCompanyById = async (req, res) => {
  const dbName = process.env.DB_NAME;
  const { id } = req.params;
  try {
    const result = await db
      .promise()
      .query(
        `SELECT * FROM \`${dbName}\`.companies WHERE account_id = (?)`,
        id
      );

    if (result[0]?.length === 0) {
      return res.status(404).send("Company not found.");
    }
    const company = result[0][0];
    // If logo exists, generate the full URL
    if (company.logo) {
      company.logo = `${req.protocol}://${req.get(
        "host"
      )}/${company.logo.replace(/\\/g, "/")}`;
    }

    return res.status(200).send(company);
  } catch (error) {
    return res.status(500).send(error);
  }
};

const getCompanyByEmail = async (req, res) => {
  const dbName = process.env.DB_NAME;
  const { email } = req.params;
  try {
    const result = await db
      .promise()
      .query(`SELECT * FROM \`${dbName}\`.company WHERE email = (?)`, email);

    if (result[0]?.length === 0) {
      return res.status(404).send("Company not found.");
    }

    const company = result[0][0];
    // If logo exists, generate the full URL
    if (company.logo) {
      company.logo = `${req.protocol}://${req.get(
        "host"
      )}/${company.logo.replace(/\\/g, "/")}`;
    }
    return res.status(200).send(company);
  } catch (error) {
    return res.status(500).send(error);
  }
};

module.exports = {
  getCompanies,
  getBatchCompanies,
  getCompanyById,
  getCompanyByEmail,
};
