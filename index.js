const express = require("express");
const app = express();
app.listen(3000, () => console.log("http://localhost:3000/"));

app.use(express.static("public"));

const {render, div} = require("./functions.js");

app.get("/", home);

function home(req, res){

    res.send(render(div("HOME")))
}
