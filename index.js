const express = require("express");
const app = express();
app.listen(3000, () => console.log("http://localhost:3000/"));


const {render} = require("./helper");