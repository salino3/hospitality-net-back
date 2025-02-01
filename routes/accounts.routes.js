const express = require("express");
const accountsControllers = require("../controllers/accounts.controllers");

const routerAccounts = express.Router();

routerAccounts.get("/", accountsControllers?.getAccounts);

routerAccounts.get("/batch/get", accountsControllers.getBatchAccounts);

routerAccounts.get("/:id", accountsControllers.getAccountById);

routerAccounts.get("/email/:email", accountsControllers.getAccountsByEmail);

routerAccounts.put("/:id", {});

routerAccounts.patch("/:id", {});

routerAccounts.delete("/:id", {});

module.exports = routerAccounts;
