const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { db } = require("./db");
const routerAccounts = require("./routes/accounts.routes");

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
        : "http://localhost:7300",
    credentials: true,
  })
);

// Routes
app.use("/accounts", routerAccounts);

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
