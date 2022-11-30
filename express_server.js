const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

function generateRandomString() {
  let chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQURSTUVWXYZ0123456789';
  let result = '';
  let charLength = chars.length;
  for (let i = 0; i < 6; i++) {
     result += chars.charAt(Math.floor(Math.random() * charLength));
  }
  return result;
};

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/u/:id", (req, res) => {
  const id = req.params.id
  const longURL = urlDatabase[id]
  res.redirect(longURL);
});

app.get("/urls/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id]
  const templateVars = { id, longURL };
  res.render("urls_show", templateVars);
});


app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect("/urls")
})

app.post("/urls/:id", (req, res) => {
  console.log("req.body:", req.body )
  console.log(req.params.id)
  const id = req.params.id;
  urlDatabase[id] = req.body.longURL
  res.redirect("/urls")
  // get the new url submitted from the form.
  // update the urldatabase with short url
  // render urls index template
})

// app.post("/urls", (req, res) => {
//   console.log(req.body); // Log the POST request body to the console
//   res.send("Ok"); // Respond with 'Ok' (we will replace this)
// });


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});