const express = require('express');
const { execArgv } = require('process');
const bcrypt = require("bcryptjs");
const session = require('express-session');
const app = express();
app.use(express.urlencoded({extended:true}));
const fs = require("fs");
const {render, div} = require("./utils.js");
const { getRandomValues } = require('crypto');
const {v4: uuidv4} = require ('uuid');

app.use(express.static("public"));
app.listen(3000, () => console.log("http://localhost:3000/"));

app.get("/", home);
app.get("/login", login);
app.post("/registrera", register);
app.get("/registrera", showRegister)
app.get("/tjanster", tjanster);
app.get("/skapaTjanst", showCreateTjanst);
app.post("/skapaTjanst", createTjanst);





function home(req, res){
    res.send(render("Hem").toString());
    generateId();
}




function login(){};
function tjanster(req, res){

    let services = JSON.parse(fs.readFileSync("services.json")).toString();

    
    let html = services.map(s=>(

        `
        <div id = "${s.id}">
            <h3>${s.serviceName}</h3>
            <p>${s.bio}</p>
        </div>
        `

    )).join("");

    console.log(html);


};

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
function showCreateTjanst(req, res){

    let x = "1";
    let y = "1"

    if (x == y){
        res.send(render(fs.readFileSync("templates/createTjanst.html").toString()));
    }
    else{
        res.redirect("/login");
    }
};

function createTjanst(req, res){

    let data = req.body;

    data.id = generateId();

    console.log(data)

    let services = JSON.parse(fs.readFileSync("services.json").toString());

    services.push(data);

    fs.writeFileSync("services.json", JSON.stringify(services, null, 3));

    res.redirect("/")
}

function generateId(){

    return uuidv4();
    
}
