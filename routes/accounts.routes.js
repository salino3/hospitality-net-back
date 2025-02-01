const express = require("express");

const routerAccounts = express.Router();

routerAccounts.get("/", function (req, res) {});

routerAccounts.get("/batch/get", () => {});

routerAccounts.get("/:id", () => {});

routerAccounts.get("/email/:email", () => {});

routerAccounts.put("/:id", {});

routerAccounts.patch("/:id", {});

routerAccounts.delete("/:id", {});

module.exports = routerAccounts;
