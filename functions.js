const fs = require("fs");
module.exports(render, div);

function render(content){

    let html = fs.readFileSync("template.html").toString();

    html.replace("**content**", content);

    return html;
};

function div(content, c){

    let html = fs.readFileSync("div.html").toString();

    html.replace("**content**", content);
    html.replace("**class**", c);

    return html;

}