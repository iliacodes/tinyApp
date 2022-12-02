const express = require("express");
const cookieSession = require('cookie-session')
const bcrypt = require("bcryptjs")
const app = express();
const { generateRandomString, getUsersByEmail } = require('./helper.js');

const PORT = 8080; // default port 8080

const userURL = function(user_ID) {
  let results = {}
  const userIDs = Object.keys(urlDatabase);
  for (let user of userIDs) {
    const url = urlDatabase[user];
    if(url.userID === user_ID) {
      results[user] = url;
    }
  };
  return results;
};

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'Session', 
  keys: ['shh-key', 'topsecret-key']
}));

const users = {};

const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "user1"
    },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "user1"
  }
};

app.get("/", (req, res) => {
  res.redirect("/urls");
});

app.get("/urls", (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID]
  if (!user) {
    res.send("You need to <a href='/login'>login</a> to create shortened urls.")
  } else {
    const urls = userURL(userID)
    const templateVars = { 
      userID,
      urls, 
      user
    }; 
    res.render("urls_index", templateVars);
  };
});

app.get("/urls/new", (req, res) => {
  let userID = req.session.user_id//["user_id"];
  const user = users[userID];
  if (!user) {
    res.redirect("/login")
  } else {
    const templateVars = { 
      userID: userID,
      user
    }
    res.render("urls_new", templateVars);
  }
});

app.get("/u/:id", (req, res) => {
  let userID = req.session.user_id//["user_id"]
  const user = users[userID]
  const id = req.params.id
  const templateVars = {
    user: user,
    id, 
    longURL: urlDatabase[id].longURL,
  }
  res.render("urls_show", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const id = req.params.id;
  let userID = req.session.user_id//["user_id"];
  const user = users[userID];
  const longURL = urlDatabase[id].longURL
  const templateVars = { 
    id,
    longURL,
    userID, 
    user
  };
  res.render("urls_show", templateVars);
});

app.get("/register", (req, res) => {
  let userID = req.session.user_id//["user_id"]
  const user = users[userID]
  if (user) {
    res.redirect('/urls')
  } else {
      const userID = req.params.id;
      const templateVars = {
        user: user,
        userID, 
        longURL: urlDatabase[userID]
      };
      res.render("register", templateVars);
    };
});

app.post("/urls/new", (req, res) => {
  const longURL = req.body.longURL;
  const userID = req.session.user_id//["user_id"];
  const shortURL = generateRandomString(6);
  const user = users[userID];
  if (!user) {
    res.send("Please <a href='/login'>login</a> to create a new url.")
  } else {
    urlDatabase[shortURL] = { userID, longURL: longURL };
    res.redirect(`/urls/${shortURL}`)
  }
})

app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect("/urls")
})

app.post("/urls/:id", (req, res) => {
  const userID = req.session.user_id//["user_id"];
  const id = req.params.id;
  const longURL = req.body.longURL
  urlDatabase[id] = { longURL, userID }
  res.redirect("/urls")
})

app.post("/logout", (req, res) => {
  req.session = null; //("user_id");
  res.redirect("/login")
})

app.get("/login", (req, res) => {
  let userID = req.session.user_id;
  const user = users[userID];
  if (user) {
    res.redirect('/urls');
  } else {
    res.render("urls_login", {user: null});
  }
})

app.post('/login', (req,res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = getUsersByEmail(users, email);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    res.send("Please enter matching email and password. <a href='/login'>Login here</a>");
  } else {
    req.session.user_id = user.id;
    res.redirect('/urls');
  }
})

app.post("/register", (req, res) => {
  const newUserEmail = req.body.email;
  const newUserPass = req.body.password;
  const hashPassword = bcrypt.hashSync(newUserPass)
  if (!newUserEmail || !newUserPass) {
    return res.status(404).send("Please enter registration credentials. Please <a href='/register'> try again.</a>")
  };
  if (getUsersByEmail(users, newUserEmail)) {
    res.status(404).send("Email or password does not match. Please <a href='/register'>try again.</a>");
  } else {
    const id = generateRandomString(6);
    const newUser = {id, email: newUserEmail, password: hashPassword};
    users[id] = newUser;
    req.session.user_id = id//("user_id", id);
    res.redirect("/urls");
  };
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});