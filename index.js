const express = require("express");
const serveStatic = require("serve-static");
const path = require("path");
const { env } = require("process");
const dotenv = require('dotenv');
dotenv.config();

const nodeEnv = process.env.NODE_ENV || "development";
console.log(`nodeEnv: ${nodeEnv}`);

var forceSSL = function (req, res, next) {
    if (req.headers["x-forwarded-proto"] !== "https") {
        return res.redirect(["https://", req.get("Host"), req.url].join(""));
    }
    return next();
};

const app = express();

if (nodeEnv !== "development") {
    app.use(forceSSL);
}

// bind the request to an absolute path or relative to the CWD
app.use(express.static('app/dist'))

const port = process.env.PORT || 8080;
app.listen(port);
console.log(`app is listening on port: ${port}`);
