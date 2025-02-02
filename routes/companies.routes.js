const express = require("express");
const companiesController = require("../controllers/companies.controllers");
const upload = require("../middlewares/multerConfig");

const routerCompanies = express.Router();

routerCompanies.get("/", companiesController?.getCompanies);

routerCompanies.get("/batch/get", companiesController.getBatchCompanies);

routerCompanies.get("/:id", companiesController?.getCompanyById);

routerCompanies.get("/email/:email", companiesController.getCompanyByEmail);

module.exports = routerCompanies;
