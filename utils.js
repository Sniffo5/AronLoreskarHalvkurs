const fs = require("fs");

/* 
if (!req.session){
        html = html.replace("**log**", '<a href="/login">Logga in</a>');
    }
    else{
        html = html.replace("**log**", '<a href="/logout">Logga ut</a>');
    }   
*/




function render(content){

    let html = fs.readFileSync("templates/template.html").toString();

    html = html.replace("**content**", content);




    return html;
};



function div(content, c=""){
    return `<div class="${c}">
    ${content}
    </div>`;
}

module.exports = {render, div};