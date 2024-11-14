const express = require("express");
const app = express();
app.listen(3000, () => console.log("http://localhost:3000/"));
const fs = require("fs");

app.use(express.static("public"));

const {render, div} = require("./utils.js");

app.get("/", home);

function home(req, res){
    res.send(render(div("t", "c")));
}

app.get("/login", login);
app.get("/registrera", register);
app.get("/tjanster", tjanster);
app.get("/skapatjanst", createTjanst);


function login(){};
function tjanster(){};
function register(){

    if (x){

    }
    else {
        
    }



};
function createTjanst(){

    let x = "1";
    let y = "2"

    if (x == y){
        res.send(render(fs.readFileSync("createTjanst.html").toString()));
    }
    else{
        res.redirect("/login");
    }
};

