const express = require("express");
const accountsControllers = require("../controllers/accounts.controllers");
const { verifyJWT, verifyRole } = require("../middlewares/verify-token");
const { customUpload } = require("../middlewares/multerConfig");

const routerAccounts = express.Router();

routerAccounts.get("/", accountsControllers?.getAccounts);

routerAccounts.get("/batch/get", accountsControllers.getBatchAccounts);

routerAccounts.get("/:id", accountsControllers.getAccountById);

routerAccounts.get("/email/:email", accountsControllers.getAccountByEmail);

routerAccounts.put(
  "/:id",
  verifyJWT("id"),
  customUpload("profile_pictures", "profile_picture"),
  accountsControllers.updateAccount
);

routerAccounts.patch(
  "/:id",
  verifyJWT("id"),
  accountsControllers.changePasswordAccount
);

routerAccounts.patch(
  "/remove/:id",
  verifyJWT("id"),
  accountsControllers.removeAccountFromWeb
);

routerAccounts.delete(
  "/:id",
  verifyJWT("id", true),
  verifyRole("admin"),
  accountsControllers.deleteAccount
);

module.exports = routerAccounts;
