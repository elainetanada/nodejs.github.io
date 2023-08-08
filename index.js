const express = require('express');
const path = require('path');
const app = express();
const port = 8084;
// const mysql = require('mysql2');
const env = require('dotenv');
const cookie_parser = require('cookie-parser');

app.set('view engine', 'hbs');

env.config({ path: './.env' });
app.use(express.static(path.join(__dirname, "./public")));

app.use(cookie_parser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//define routes imported from other files using the app.use
app.use('/', require("./routes/registerRoutes"));
app.use("/auth", require("./routes/auth"));

app.get('/', (req, res) => {
    res.send("<html><body><h1>Welcome to NodeJS Registration</h1></boy></html>")
})

app.listen(port, function (err) {
    if (err) console.log(err);
    console.log("Server listening on PORT", port);
});

