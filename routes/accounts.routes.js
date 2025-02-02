const express = require("express");
const accountsControllers = require("../controllers/accounts.controllers");
const upload = require("../middlewares/multerConfig");

const routerAccounts = express.Router();

routerAccounts.get("/", accountsControllers?.getAccounts);

routerAccounts.get("/batch/get", accountsControllers.getBatchAccounts);

routerAccounts.get("/:id", accountsControllers.getAccountById);

routerAccounts.get("/email/:email", accountsControllers.getAccountByEmail);

routerAccounts.put(
  "/:id",
  upload.single("profile_picture"),
  accountsControllers.updateAccount
);

routerAccounts.patch("/:id", accountsControllers.changePasswordAccount);

routerAccounts.delete("/:id", accountsControllers.deleteAccount);

module.exports = routerAccounts;
