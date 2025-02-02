const express = require("express");
const companiesController = require("../controllers/companies.controllers");
const upload = require("../middlewares/multerConfig");

const routerCompanies = express.Router();

routerCompanies.get("/", companiesController?.getCompanies);

// routerCompanies.get("/batch/get", companiesController.getBatchAccounts);

module.exports = routerCompanies;
