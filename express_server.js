const express = require("express");
let cookieParser = require('cookie-parser')
const app = express();
app.use(cookieParser())
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

const getUsersByEmail = function(users, newUserEmail){
  for (let user in users) {
    console.log("user", user)
    if (users[user].email === newUserEmail) {
     console.log(user.email)
     const result = users[user]
     console.log(users)
     return result;
    } 
  } 
  console.log("no match")
  return false;
}

const userURL = function(user_ID) {
  let results = {}
  const userIDs = Object.keys(urlDatabase);
  for (let user of userIDs) {
    const url = urlDatabase[user];
    if(url.userID === user_ID) {
      results[user] = url;
    }
  }
  return results;
}

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

const users = {
  user1: {
    id: "user1",
    email: "a@b.com",
    password: "123",
  },
};

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

// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// });

app.get("/urls", (req, res) => {
  const userID = req.cookies["user_id"]
  const user = users[userID]
  if (!user) {
    res.send("You need to <a href='/login'>login</a> to create shortened urls.")
  } else {
    const urls = userURL(userID)
    console.log("urls", urls)
    const templateVars = { 
      userID,
      urls, 
      user
    }; 
    res.render("urls_index", templateVars);
  }
});

app.get("/urls/new", (req, res) => {
  let userID = req.cookies["user_id"];
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
  let userID = req.cookies["user_id"]
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
  let userID = req.cookies["user_id"];
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
  let userID = req.cookies["user_id"]
  const user = users[userID]
  if (user) {
    res.redirect('/urls')
  } else {
      const userID = req.params.id;
      const templateVars = {
        user: user,
        userID, 
        longURL: urlDatabase[userID]
      }
      res.render("register", templateVars)
    }
})


// app.post("/urls", (req, res) => {
//   let userID = req.cookies["user_id"]
//   const user = users[userID]
//   const longURL = req.body.longURL;
//   const shortURL = generateRandomString(6);
  // res.redirect(`/urls/${shortURL}`)
//})

app.post("/urls/new", (req, res) => {
  const longURL = req.body.longURL;
  const userID = req.cookies["user_id"];
  console.log("userid", userID)
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
  const userID = req.cookies["user_id"];
  const id = req.params.id;
  const longURL = req.body.longURL
  urlDatabase[id] = { longURL, userID }
  console.log(urlDatabase)
  res.redirect("/urls")
})

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/login")
})

app.get("/login", (req, res) => {
  let userID = req.cookies["user_id"]
  const user = users[userID]
  if (user) {
    res.redirect('/urls')
  } else {
    res.render("urls_login", {user: null})
  }
})

app.post('/login', (req,res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = getUsersByEmail(users, email)
  if (!user || user.password !== password) {
    res.send("Please enter matching email and password. <a href='/login'>Login here</a>")
  } else {
    console.log("user", user)
    res.cookie("user_id", user.id)
    res.redirect('/urls')
  }
})

app.post("/register", (req, res) => {
  const newUserEmail = req.body.email;
  const newUserPass = req.body.password;
  if (!newUserEmail || !newUserPass) {
    res.status(404).send("Please enter registration credentials. Please <a href='/register'> try again.</a>")
  };
  if (getUsersByEmail(users, newUserEmail)) {
    res.status(404).send("Email or password does not match. Please <a href='/register'>try again.</a>");
  } else {
    const id = generateRandomString(6);
    const newUser = {id, email: newUserEmail, password: newUserPass};
    users[id] = newUser;
    res.cookie("user_id", id);
    res.redirect("/urls");
  };
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});