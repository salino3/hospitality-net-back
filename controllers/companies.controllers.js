const { db } = require("../db");
require("dotenv").config();

export const getCompanies = async () => {
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

module.exports = { getCompanies };
