const fs = require("fs");
const nodemailer = require('nodemailer');

function render(content, session = {}) {

    let html = fs.readFileSync("templates/template.html").toString();

    
    if (session.loggedIn == true) {
        html = html.replace("**log**", '<a href="/createService">Skapa tjänst</a> | <a href="/logout">Logga ut</a>');
    } else {
        html = html.replace("**log**", '<a href="/register">Registrera</a> | <a href="/login">Logga in</a>');
    }


    html = html.replace("**content**", content);

    return html;
}

/* ---------------------------------------------------------- */

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'proffstorgetab@gmail.com',
      pass: 'aolj hnok mtuc yfvb' 
    }
  });

  async function sendEmail(to, subject, htmlContent){
    try {
        await transporter.sendMail({
          from: '"Proffstorget" <proffstorgetab@gmail.com>', 
          to,                                           
          subject,                                      
          html: htmlContent                             
        });
        console.log('Email sent successfully');
      } catch (error) {
        console.log('Error sending email:', error);
      }
  }


module.exports = {render, sendEmail};
