const express = require("express");
const app = express();

const {getEndpoints} = require("./controllers/api.controller");
const {getAllTopics} = require("./controllers/topics.controller");
const {invalidPathHandler, serverErrorHandler} = require("./controllers/errors.controller");

app.get("/api", getEndpoints);

app.get("/api/topics", getAllTopics);

app.all('*', invalidPathHandler);

app.use(serverErrorHandler);

module.exports = app;