const path = require("path");
const express = require('express');
const http = require("http");

const indexRouter = require('./routes/index');
const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


app.use('/', indexRouter);
app.use(express.static(__dirname + "/public"));

const server = http.createServer(app);
server.listen(4000);