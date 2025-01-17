# Halvkursprojekt
## För halvkursprojektet gjorde jag en simpel crd hemsida där en användare kan skapa en tjänst ta bort dem med ramverket express i nodejs.
Länk till git-repository: https://github.com/Sniffo5/AronLoreskarHalvkurs

---
---
## Index.js

```javascript
const express = require('express');
const bcrypt = require("bcryptjs");
const session = require('express-session');
const { v4: uuidv4 } = require('uuid');
const { render, sendEmail } = require("./utils.js");
const fs = require("fs");
const escape = require('escape-html')
const validator = require('validator');
```
I början av min index.js så importerar jag alla mina dependencies. Jag använder mig av ramverket express, hasningsverktyget bcrypt, express.session för sessioner, uuid för att ska unika id:n, utils.js använder jag för att dela up min kod, fs är för att få tillgång til filsystemet i projektet, escape-html för att skydda från xss attacker, och validator för att validera mailadresser.

---

```javascript
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000
    }
}));
```

Här definerar jag mina middlewares, `app.use(express.urlencoded({ extended: true }));` detta gör så att inkommande formulärdata omvandlas till javascript objekt samt ser till så att mer komplexa datatyper kan tolkas, det behövs när man ska ta emot data från en post request (kan bara ske i formulär).

`app.use(express.static("public"));` ser till så att allt i mappen "public" är tillgänglig till användaren. det behövs när man skak oppla css til html eller eventuell klient skript.

---

```javascript
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000
    }
}));
```

Här deffinerar jag hur sessionenera ska funger i mitt prjekt. jag konfigurerar det till mina exakta behov. `secret: 'keyboard cat'` värdet här används för att kryptera sessions id:na i cookien. `resave: false` ser till så att sessionsdatabasen förblir ofärndrad om inte någon ändring har gjorts på sessionen. `saveUninitialized: true` skapar en sessionsid för alla nvändare och sessionen är tom. 

---

```javascript
cookie: {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000
    }
```
Här se jag till så att cookien inte kan ändras av klient javascript och gör så att cookien har en max livslängd på 24h.

---

```javascript
let iconC = '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#5f6368"><path d=""/></svg>'
let iconP = '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#5f6368"><path d=""/></svg>'
```
här deffinerar jag två variabler med två olika svg ikoner, en för privat personer på iconP och en för företag på iconC. Dessa ska visas senare på tjänsterna för att tydligt förmedla om ifall tjänstskaparen är en privatperson eller ett företag

---

```javascript
app.listen(3000, () => console.log("http://localhost:3000/"));
```
Berättar vilken port som webbservern ska lyssna på i detta fall 3000, varje gång sevrern startar ska även det loggas i konsolen länken till hemsidan

---

```javascript
app.get("/", home);
app.post("/login", login);
app.get("/login", showLogin);
app.post("/register", register);
app.get("/register", showRegister)
app.get("/services", services);
app.get("/createService", showcreateService);
app.post("/createService", createService);
app.get("/logout", logOut);
app.post("/deleteService/:id", deleteService);
app.get("/verify", verify);
```

Här är alla mina olika routes jag har på hemsidan, de flesta görs med "get" då användaren ska gå till en sida och "post" används för att skicka och tar emot data, i routes så är post för att ta emot data på ett speccifikt ställe och i formulär för att skicka. i app. `post("/deleteService/:id", deleteService);` här använder jag mig av en parameter i routen, det är för att i url:n ska användaren kunna skicka med id:t av den specifika tjänsten som ska tas bort,  `req.params.id` kommer då kunna hanteras som en variabel i funktionen  `deleteService`. När en perso neller data går till en av de routsen så kommer funktionen eller funktionerna som är kopplade till den routen köras.

---

```javascript
function home(req, res) {
    res.send(render("<h2>Dagens bästa tjänst:</h2><br>" + showTop(), req.session));
}
```

Här är min home funktion som körs när någon surfar in på `"/"` alltså standard sidan. jag tar emot req och res vilket är http request och http response. Request kan vi hantera med eventuell data som har skickats med som till exempel sessions data eller en eventuell parameter. res använder vi för att deffinera datan vi ska skicka ut till användaren. Med `res.send()` skickar vi det som står inuti till användaren som har surfat in på `"/"`. I `res.send()` kallar jag på min render funktion. Den ser till så att allt vi stoppar in i den kommer visas snyggt och prydligt inuti fullständig html. mer förklaring på den kommer senare. Jag skickar in en html sträng men även värdet av som produceras av funktionen `showTop()` som vi kallar här. jag skickar även med session cookien för att jag ska kunna i min render funktion anpassa vad för länkar som ska visas på toppen av hemsidan beroende på ifall användare är inloggad eller inte. 

---

```javascript
function services(req, res) {
    let services = JSON.parse(fs.readFileSync("services.json").toString());

    let servicesHtml = services.map(service => {
        return showServices(service, req)
    }).join("\n");

    servicesHtml = servicesHtml.replaceAll("iföretag", iconC);
    servicesHtml = servicesHtml.replaceAll("iperson", iconP);

    res.send(render(servicesHtml, req.session));
}
```
Här är min funktion services som är till för att visa de tjänster som finns på hemsidan. Först tar jag emot datan från min `services.json` där jag har sparat allt olika tjänster och informationen sparad om tjänsterna. Därefter delar jag upp de olika tjänsterna i min "Databas" och kör funktionen showServices med dem. Jag skickar även med req här för att få med cookien för att anpassa hur tjänsten ska visas beroende på användarens inloggningststatus. `.join("\n")` används för att stoppa ihop allt till en sträng med en nya rad emellan. `showServices()` returnerar html för varje tjänst som skickas in, den kommer ut anpassad med all information som fanns om varje unik tjänst. Djupare förklaring komemr senare

`servicesHtml = servicesHtml.replaceAll("iföretag", iconC);` används för att byta ut alla instanser där jag det finns "iföretag" i `servicesHtml` med ikonen för företag som vi deklarerade tidigare. 

Tillslut skickar vi ut `servicesHtml` till användaren via render funktionen.

---

```javascript
function showTop() {
    let services = JSON.parse(fs.readFileSync("services.json").toString());

    let service = services[0];
    let servicesHtml = showServices(service, null);

    servicesHtml = servicesHtml.replaceAll("iföretag", iconC)
    servicesHtml = servicesHtml.replaceAll("iperson", iconP)

    return servicesHtml
}
```

Denna funktion är väldigt lik `services()` men det finsn två saker som skiljer dem åt, en är att istället för att visa alal tjänster visar vi bara tjäbnsten på position 0 i json filen. Vi skickar även med `null` i `showservices()` då vi inte vill att en delete knapp ska visas på start sidan utan den ska enbart synas på sidan där alla tjänster visas.

---

```javascript
function showServices(service, req) {
    let deleteButton = "";

    if (req != null) {
        if (req.session.loggedIn && (service.userId === req.session.userId || req.session.isAdmin == true)) {
            deleteButton = `<form action="/deleteService/${service.id}" method="post">
                                <button type="submit">Ta bort</button>
                            </form>`;
        }

    }

    return `
    <div id = "${(service.id)}" class="service">
    <h2>${(escape(service.serviceName))}</h2>
    <p>${escape((service.bio))}</p>
    <p>Pris: ${escape((service.price))}</p>
    <p>Plats: ${escape((service.location))}</p>
    <p> i${escape(service.type)} ${escape((service.type))}</p>
    ${deleteButton}
    </div>
    
    `
}
```
`showServices()` skapar htmlen för varje tjänst som skickas in via `service` variablen. först deffinerar vi `deleteButton` som en tom sträng, detta är för att ifall if statsen under inte ska köras så ska koden ändå fungera för att visa till en användaren som inte är inloggad till rätt konto. If-satsen börjar med en kontroll av att en req har skickats med och ifall den har kan kontrollerna påbörja. Då kontolleras ifall användaren har ett värde i sessionen på `req.session.loggedIn` när användaren loggar in så stoppas värdet av `loggedIn` till true och ifall de loggar ut förstörs den. alltså kontrollerar vi ifall användaren är inloggad vid tillfället. vi kräver även att värdet av `userId` på tjänsten som deffinerades när tjänsten skapades till anvädnare idet av tjänstens skapare är samma som det användar id:t som skickas med i sessionen eller ifall användaren är admin. Ifall allt detta stämmer eller ifall rätt delar stämmer så kommer `deleteButton` fyllas på med html för ett formulär som skickar en post-request för att ta bort den specifika tjänsten. 

Därefter returnerar funktionen en html sträng där vissa delar byts ut med värdet av olika delar av service objektet elelr deletebutton variablen. Alla data som skickas ut körs via `escape()`. Det är för att förstöra alla eventuella xss attacker som någon ahd försökt skicka ut via tjänster so mde kan skapa men skrivs först ut här. 

---

```javascript
async function login(req, res) {
    let data = req.body;
    let users = JSON.parse(fs.readFileSync("users.json").toString());
    let userFind = users.find(u => u.email == data.email);

    if (!userFind) {
        return res.redirect("/login");
    }

    if (!userFind.isVerified) {
        return res.send(render("Kolla din mail för verifieringsemail", req.session));
    }

    let check = await bcrypt.compare(data.password, userFind.password);
    if (!check) return res.redirect("/login?wrong_credentials");

    req.session.email = userFind.email;
    req.session.loggedIn = true;
    req.session.isAdmin = userFind.isAdmin;
    req.session.userId = userFind.id;

    res.send(render("Välkommen tillbaka " + escape(userFind.email), req.session));
}
```

Denna funktion login hanterar inloggningen av en användare. Först tar vi emot data från formuläret via `req.body`. Därefter läser vi in användardatan från `users.json` och letar efter en användare med samma email som den som skickades in.

Om ingen användare hittas, omdirigeras användaren tillbaka till inloggningssidan. Om användaren inte är verifierad, skickas ett meddelande till användaren att kontrollera sin mail för verifiering.

Vi använder `bcrypt.compare` för att jämföra det inskickade lösenordet med det hashade lösenordet i databasen. Om lösenorden inte matchar, omdirigeras användaren tillbaka till inloggningssidan med en felmeddelande.

Om allt stämmer, sparar vi användarens email, inloggningsstatus, adminstatus och användar-ID i sessionen. Slutligen skickar vi ett välkomstmeddelande till användaren. 

---

```javascript
function showLogin(req, res) {

    if (!req.session.loggedIn) {
        let logForm = fs.readFileSync("templates/logForm.html").toString();
        res.send(render(logForm, req.session));
    } else {
        res.redirect("/");
    }
}
```
`showLogin()` hanterar visningen av inloggningssidan. Först kontrollerar vi om användaren inte är inloggad genom att kolla req.session.loggedIn.

Om användaren inte är inloggad, läser vi in innehållet från `logForm.html` och skickar det till användaren genom att använda render-funktionen. Om användaren redan är inloggad, omdirigeras de till startsidan.

---

```javascript
function logOut(req, res) {
    req.session.destroy(() => {
        res.send(render("Utloggad"));
    });
}
```

Denna funktion `logOut()` hanterar utloggningen av en användare. Först förstör vi sessionen med `req.session.destroy()`, vilket tar bort all sessiondata för användaren. När sessionen är förstörd, skickar vi ett meddelande till användaren genom att använda render-funktionen för att visa att de har loggats ut. 

---

```javascript
async function register(req, res) {
    let data = req.body;

    if (!validator.isEmail(data.email) || data.password == "") {
        return res.redirect("/register");
    }

    const token = generateId();
    data.token = token;

    data.isVerified = false;

    data.password = await bcrypt.hash(data.password, 12);
    data.id = generateId();
```
Denna första del av register-funktionen hanterar validering och förberedelse av användardata. Först tar vi emot data från formuläret via req.body. Vi kontrollerar om emailen är giltig med hjälp av `validator.isEmail` och om lösenordet inte är tomt. Om något av dessa villkor inte uppfylls skickas användaren tillbaka till registreringssidan.

Vi genererar en verifieringstoken och sätter `data.isVerified` till false eftersom användaren ännu inte har verifierat sitt konto. Verifieringstokenet ska användas för att kontrollera konto verifiering via email. Lösenordet hashas med bcrypt för säkerhet och ett unikt ID genereras för användaren.

```javascript
let users = JSON.parse(fs.readFileSync("users.json").toString());
    let userFind = users.find(u => u.email == data.email);
    if (userFind) {
        return res.send(render("User exists", req.session));
    }

    data.isAdmin = false;

    users.push(data);
    fs.writeFileSync("users.json", JSON.stringify(users, null, 3));
```
I denna andra del läser vi in användardatan från `users.json` och letar efter en användare med samma email som den som skickades in. Om en användare med samma email redan finns, skickas ett meddelande till användaren att kontot redan existerar.

Om användaren inte finns, sätts `data.isAdmin` till false och den nya användaren läggs till i listan över användare. Detta görs så att alla konton hade kunnat enkelt blivit tilldelade admin behörigheter från json filen. Den uppdaterade listan skriver över `users.json`.

```javascript
    req.session.email = data.email;
    req.session.loggedIn = false;
    req.session.userId = data.id;
    req.session.isAdmin = data.isAdmin;
    req.session.isVerified = data.isVerified;

    sendVerificationEmail(data.email, token);

    res.send(render(`Välkommen, ${data.email}! Ditt konto har skapats. Kolla din inkorg för att verifiera det.`, req.session));
}
```
I den sista delen av funktionen sparar vi användarens email, inloggningsstatus, användar-ID, adminstatus och verifieringsstatus i sessionen. Vi skickar ett verifieringsmail till användaren med hjälp av `sendVerificationEmail()`. Vi skickar med token som skapades tidigare och emailet som kontot registrerades med. Slutligen skickar vi ett meddelande till användaren att kontot har skapats och att de ska kontrollera sin inkorg för verifiering.

---

```javascript
async function sendVerificationEmail(userEmail, token) {

    const emailContent = `
      <h1>Välkommen till Proffstorget!</h1>
      <p>Tryck på länken för att verifiera ditt konto</p>
      <a href="http://localhost:3000/verify?token=${token}">Verifiera konto</a>
    `;

    await sendEmail(userEmail, 'Verifiera ditt konto', emailContent);
}
```

Denna funktion sendVerificationEmail skickar ett verifieringsmail till användaren. Först skapar vi innehållet i mailet med en HTML-sträng som innehåller en länk för att verifiera kontot. Länken använder en query string med namnet token som vi ger värdet av token som generardes under registeringen för email verifieringen.

Vi använder sedan sendEmail-funktionen för att skicka mailet. Funktionen sendEmail är asynkron och vi använder await för att vänta på att mailet ska skickas innan vi fortsätter.

```javascript
const nodemailer = require('nodemailer');

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
```
Funktionen `sendEmail` använder `nodemailer` för att skicka email. Först skapar vi en transporter med nodemailer. Med `createTransport` anger vi vilken emailtjänst vi använder (i detta fall `Gmail`) och autentiseringsuppgifter.

Funktionen `sendEmail` tar emot tre parametrar: mottagarens emailadress `to`, ämnet `subject` och innehållet `htmlContent`. Vi använder `transporter.sendMail` för att skicka mailet och loggar resultatet i konsolen. Om det uppstår ett fel loggar vi felet i konsolen. 

---

```javascript
function verify(req, res) {

    if (req.session.isVerified) {
        return res.redirect("/");
    }

    const token = req.query.token;

    let users = JSON.parse(fs.readFileSync("users.json").toString());
    let userFind = users.find(u => u.token == token);

    if (!userFind) {
        return res.redirect("/");
    }

    userFind.isVerified = true;
    req.session.isVerified = true;

    users = users.filter(user => user.token != token);

    users.push(userFind);
    fs.writeFileSync("users.json", JSON.stringify(users, null, 3));

    req.session.loggedIn = true

    res.send(render("Välkommen " + escape(userFind.email), req.session));
}
```
`verify` hanterar verifieringen av en användares konto. Först kontrollerar vi om användaren redan är verifierad genom att kolla `req.session.isVerified`. Om användaren redan är verifierad, omdirigeras de till startsidan.

Vi hämtar verifieringstoken från query-parametern `token` i url:en. Därefter läser vi in användardatan från `users.json` och letar efter en användare med samma token.

Om ingen användare hittas, omdirigeras användaren till startsidan. Om användaren hittas, sätts `userFind.isVerified `och `req.session.isVerified` till true.

Vi filtrerar bort användaren med den gamla token från listan och lägger till den uppdaterade användaren. Den uppdaterade listan skrivs tillbaka till `users.json`.

Slutligen sätts `req.session.loggedIn` till true och ett välkomstmeddelande skickas till användaren.

---

```javascript
function showRegister(req, res) {
    let regForm = fs.readFileSync("templates/regForm.html").toString();
    res.send(render(regForm, req.session));
}
```

`showRegister` hanterar visningen av registreringssidan. Först läser vi in innehållet från `regForm.html` som finns i templates-mappen och konverterar det till en sträng. Därefter skickar vi innehållet till användaren.

---

```javascript
function showcreateService(req, res) {
    if (req.session.loggedIn == true) {
        res.send(render(fs.readFileSync("templates/createService.html").toString(), req.session));
    } else {
        res.redirect("/login");
    }
}
```

`showcreateService` visar sidan för att skapa en ny tjänst. Om användaren är inloggad `req.session.loggedIn == true` läses innehållet från `createService.html` och skickas till användaren. Om användaren inte är inloggad, omdirigeras de till inloggningssidan. 

---

```javascript
function createService(req, res) {
    if (req.session.loggedIn) {
        let data = req.body;

        if (data.serviceName && data.bio && data.price && data.location && data.type) {
            data.id = generateId();
            data.userId = req.session.userId;
            let services = JSON.parse(fs.readFileSync("services.json").toString());

            services.push(data);

            fs.writeFileSync("services.json", JSON.stringify(services, null, 3));

            res.redirect("/");
        } else {
            res.redirect("/createService");
        }
    } else {
        res.redirect("/login");
    }
}
```

`createService` hanterar skapandet av en ny tjänst. Om användaren är inloggad `req.session.loggedIn` hämtas data från formuläret via `req.body`. Om alla nödvändiga fält är ifyllda (`serviceName`, `bio`, `price`, `location`, `type`), genereras ett unikt ID för tjänsten och användarens ID tilldelas tjänsten. Tjänsten läggs till i listan över tjänster som sparas i `services.json`. Om något fält saknas, omdirigeras användaren tillbaka till sidan för att skapa en tjänst. Om användaren inte är inloggad, omdirigeras de till inloggningssidan.

---

```javascript
function deleteService(req, res) {
    let serviceId = req.params.id;
    let services = JSON.parse(fs.readFileSync("services.json").toString());

    let serviceToDelete = services.find(service => service.id == serviceId);

    if (serviceToDelete && (serviceToDelete.userId == req.session.userId || req.session.isAdmin)) {
        let filteredServices = services.filter(service => service.id !== serviceId);
        fs.writeFileSync("services.json", JSON.stringify(filteredServices, null, 3));
        res.redirect("/services");
    } else {
        res.redirect("/services");
    }
}
```
`deleteService` tar bort en tjänst. Först hämtas tjänstens ID från URL-parametern `req.params.id`. Därefter läses listan över tjänster från `services.json`. Om tjänsten hittas och användaren som försöker ta bort den är antingen ägaren av tjänsten `req.session.userId` eller en administratör `req.session.isAdmin` filtreras tjänsten bort från listan och den uppdaterade listan skrivs tillbaka till `services.json`. Slutligen omdirigeras användaren till sidan med alla tjänster. 

---

```javascript
function generateId() {

    return uuidv4();
}
```

`generateId` genererar ett unikt ID för en användare eller tjänst. Funktionen använder uuidv4 för att skapa detta ID.

uuid är ett bibliotek som används för att generera unika identifierare. En UUID är en 128-bitars siffra. UUIDs är designade för att vara unika över både tid och rum.

uuidv4 är en specifik version av UUID (version 4) som genereras slumpmässigt. V4 använder inte tid som en av parametrerna till skillnad från v7.

---

```javascript
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
```
`render` tar hand om att generera HTML-sidor med dynamiskt innehåll. Först läser vi in `template.html` och konverterar det till en sträng. Beroende på om användaren är inloggad (`session.loggedIn == true`) byts länkarna i navigationsmenyn ut för att visa antingen inloggnings- och registreringslänkar eller länkar för att skapa tjänster och logga ut.

Slutligen ersätts `**content**` i mallen med det dynamiska innehållet som skickas in via content-parametern och den färdiga HTML-strängen returneras. ```


---
---

Det var mitt halvkurs projekt. Jag är generellt settt nöjd över det och det känns so men bra bas på att kunan bygga ut en hemsida. Det finns så klart brister här och där men jag är ändå nöjd. Jag hade definitivt villja lägga mer tid på att rensa upp koden och optimera den. Den är väldigt rörig just nu och använder lite skuma tekniker här och där.