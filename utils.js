const fs = require("fs");

/* 
if (!req.session){
        html = html.replace("**log**", '<a href="/login">Logga in</a>');
    }
    else{
        html = html.replace("**log**", '<a href="/logout">Logga ut</a>');
    }   
*/




function render(content, session = {}) {

    let html = fs.readFileSync("templates/template.html").toString();

    
    if (session.loggedIn == true) {
        html = html.replace("**log**", '<a href="/createService">Skapa tjänst</a> | <a href="/logout">Logga ut</a>');
    } else {
        html = html.replace("**log**", '<a href="/register">Registrera</a> | <a href="/login">Logga in</a>');
    }

    // vfixa så att koden ovanfgör är i en anna n funktion, har args i render och ifall det finns någon header argument körs renderheader


    html = html.replace("**content**", content);

    return html;
}




function div(content, c=""){
    return `<div class="${c}">
    ${content}
    </div>`;
}

module.exports = {render, div};