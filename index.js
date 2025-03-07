const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const routerAuth = require("./routes/auth.routes");
const routerAccounts = require("./routes/accounts.routes");
const routerCompanies = require("./routes/companies.routes");
const path = require("path");

dotenv.config();
const app = express();
app.use(cookieParser());
app.use(express.json());

const port = process.env.PORT || 5300;

app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? process.env.FRONT_END_PORT
        : "http://localhost:7700",
    credentials: true,
  })
);

// For static files (images, CSS, etc.)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/auth", routerAuth);
app.use("/accounts", routerAccounts);
app.use("/companies", routerCompanies);

//
if (process.env.NODE_ENV === "production") {
  console.log("Running in production mode");
} else if (process.env.NODE_ENV === "development") {
  console.log("Running in development mode");
} else {
  console.log("Unknown environment");
}

app.listen(port, () => {
  console.log("Server is running on port " + port);
});
