const express = require("express");
const companiesController = require("../controllers/companies.controllers");

const routerCompanies = express.Router();

routerCompanies.post("/", companiesController.createCompany);

routerCompanies.get("/", companiesController?.getCompanies);

routerCompanies.get("/batch/get", companiesController.getBatchCompanies);

routerCompanies.get("/:id", companiesController?.getCompanyById);

routerCompanies.get("/email/:email", companiesController.getCompanyByEmail);

module.exports = routerCompanies;
