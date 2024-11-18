const express = require('express');
const { execArgv } = require('process');
const bcrypt = require("bcryptjs");
const session = require('express-session');
const app = express();
app.use(express.urlencoded({extended:true}));
const fs = require("fs");
const {render, div} = require("./utils.js");

app.use(express.static("public"));
app.listen(3000, () => console.log("http://localhost:3000/"));

app.get("/", home);
app.get("/login", login);
app.post("/registrera", register);
app.get("/registrera", showRegister)
app.get("/tjanster", tjanster);
app.get("/skapatjanst", showCreateTjanst);
app.get("/skapatjanst", createTjanst);





function home(req, res){
    res.send(render(fs.readFileSync("templates/createTjanst.html").toString()));
}




function login(){};
function tjanster(){};

async function register(req, res){

    let data = req.body;

    data.password = await bcrypt.hash(data.password, 12);

    let users = JSON.parse(fs.readFileSync("users.json").toString());

    let userExist = users.find(u=>u.email==data.email);

    if(userExist) return res.send(render("User exists"));

    users.push(data);

    fs.writeFileSync("users.json", JSON.stringify(users, null, 3));
    
    res.send(render("Registered"));
}
function showRegister(req, res){

    let regForm = fs.readFileSync("templates/regForm.html").toString();
    res.send(render(regForm));

}
function showCreateTjanst(){

    let x = "1";
    let y = "2"

    if (x == y){
        res.send(render(fs.readFileSync("createTjanst.html").toString()));
    }
    else{
        res.redirect("/login");
    }
};

function createTjanst(req, res){
    let data = req.body;

    let services = JSON.parse(fs.readFileSync("services.json").toString());

    services.push(data);

    fs.writeFileSync("services.json", JSON.stringify(services, null, 3));
}

