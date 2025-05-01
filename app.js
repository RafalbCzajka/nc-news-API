const express = require("express");
const app = express();
const cors = require('cors');

const apiRouter = require("./routes/api-router");
const {invalidPathHandler, serverErrorHandler, customErrorHandler, psqlErrorHandler} = require("./controllers/errors.controller");

app.use(cors());

app.use(express.json());

app.use("/api", apiRouter);

app.all('*', invalidPathHandler);

app.use(psqlErrorHandler);

app.use(customErrorHandler);

app.use(serverErrorHandler);

module.exports = app;