const { db } = require("../db");
const { customUpload } = require("../middlewares/multerConfig");
const { errorImage } = require("../utils/functions");
require("dotenv").config();

const createCompany = async (req, res) => {
  customUpload("logo_pictures", "logo")(req, res, async (err) => {
    if (err) {
      return res.status(400).send("Error at upolading image: " + err.message);
    }

    const {
      company_name,
      company_description,
      contact_email,
      contact_phone,
      website_url,
      address,
      country,
    } = req.body;

    // Check if the image is uploaded
    const logo = req.file ? req.file.path : null;

    if (req.file) {
      console.log("Image uploaded:", req.file.path);
    }

    if (!company_name) {
      errorImage(logo);
      return res.status(400).send("Company name is required");
    }

    if (!contact_email) {
      errorImage(logo);
      return res.status(400).send("Company email is required");
    }

    await db
      .promise()
      .query("INSERT INTO companies SET ?", {
        company_name,
        company_description,
        logo,
        contact_email,
        contact_phone,
        website_url,
        address,
        country,
      })
      .then(() => {
        return res.send("Account registered successfully");
      })

      .catch((err) => {
        console.error(err);
        errorImage(logo);
        return res.status(500).send("Error registering company");
      });
  });
};

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
        `SELECT * FROM \`${dbName}\`.companies WHERE company_id = (?)`,
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
      .query(
        `SELECT * FROM \`${dbName}\`.company WHERE contact_email = (?)`,
        email
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

const updateCompany = async (req, res) => {
  const dbName = process.env.DB_NAME;
  //   const companyId = req.id;
  const companyId = req.params.id;
  const {
    company_name,
    company_description,
    contact_email,
    contact_phone,
    website_url,
    address,
    country,
  } = req.body;

  try {
    const [existingAccount] = await db
      .promise()
      .query(`SELECT * FROM \`${dbName}\`.companies WHERE company_id = ?`, [
        companyId,
      ]);

    const fieldsToUpdate = [];
    const valuesToUpdate = [];

    if (company_name && company_name !== existingAccount[0]?.company_name) {
      fieldsToUpdate.push("company_name = ?");
      valuesToUpdate.push(company_name);
    }

    if (
      company_description &&
      company_description !== existingAccount[0]?.company_description
    ) {
      fieldsToUpdate.push("company_description = ?");
      valuesToUpdate.push(company_description);
    }

    if (contact_email && contact_email !== existingAccount[0]?.contact_email) {
      fieldsToUpdate.push("contact_email = ?");
      valuesToUpdate.push(contact_email);
    }

    if (contact_phone && contact_phone !== existingAccount[0]?.contact_phone) {
      fieldsToUpdate.push("contact_phone = ?");
      valuesToUpdate.push(contact_phone);
    }

    if (website_url && website_url !== existingAccount[0]?.website_url) {
      fieldsToUpdate.push("website_url = ?");
      valuesToUpdate.push(website_url);
    }

    if (address && address !== existingAccount[0]?.address) {
      fieldsToUpdate.push("address = ?");
      valuesToUpdate.push(address);
    }

    if (country && country !== existingAccount[0]?.country) {
      fieldsToUpdate.push("country = ?");
      valuesToUpdate.push(country);
    }

    if (req.file) {
      // req.file.filename contains the name of the saved file
      fieldsToUpdate.push("logo = ?");
      valuesToUpdate.push(`uploads/logo_pictures/${req.file.filename}`);
    }

    if (fieldsToUpdate.length === 0) {
      errorImage(req.file ? req.file.path : null);
      return res.status(400).send({
        message: "No valid fields provided to update, or no changes detected",
      });
    }

    valuesToUpdate.push(companyId);

    const sqlQuery = `UPDATE \`${dbName}\`.companies SET ${fieldsToUpdate.join(
      ", "
    )} WHERE company_id = ?`;

    const [result] = await db.promise().query(sqlQuery, valuesToUpdate);

    if (result.affectedRows > 0) {
      return res.status(200).send({ message: "Company updated successfully." });
    } else {
      errorImage(req.file ? req.file.path : null);
      return res.status(404).send({ message: "Company not found." });
    }
  } catch (error) {
    console.error(error);
    errorImage(req.file ? req.file.path : null);
    return res.status(500).send(error);
  }
};

module.exports = {
  createCompany,
  getCompanies,
  getBatchCompanies,
  getCompanyById,
  getCompanyByEmail,
  updateCompany,
};
