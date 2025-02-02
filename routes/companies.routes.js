const express = require("express");
const companiesController = require("../controllers/companies.controllers");
const upload = require("../middlewares/multerConfig");

const routerCompanies = express.Router();

routerCompanies.get("/", companiesController.getCompanies);
