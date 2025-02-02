const express = require("express");
const companiesController = require("../controllers/companies.controllers");
const { customUpload } = require("../middlewares/multerConfig");

const routerCompanies = express.Router();

routerCompanies.post("/", companiesController.createCompany);

routerCompanies.get("/", companiesController?.getCompanies);

routerCompanies.get("/batch/get", companiesController.getBatchCompanies);

routerCompanies.get("/:id", companiesController?.getCompanyById);

routerCompanies.get("/email/:email", companiesController.getCompanyByEmail);

routerCompanies.put(
  "/:id",
  customUpload("logo_pictures", "logo"),
  companiesController.updateCompany
);

routerCompanies.delete("/:id", companiesController.deleteCompany);

module.exports = routerCompanies;
