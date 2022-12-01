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
     return users[user];
    } 
  } 
  console.log("no match")
  return false;
}

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

const users = {
  userRandomID: {
    id: "a@b.com",
    email: "a@b.com",
    password: "123123",
  },
  user2RandomID: {
    id: "b@a.com",
    email: "b@a.com",
    password: "123123",
  },
};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.redirect("/urls");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});



app.get("/urls", (req, res) => {
    if (!users) {
      console.log(users)
    res.redirect(`/register`)
  } else{
    const userID = req.cookies["user_id"]
    console.log("userID", userID)
    const user = users[userID]
    console.log("user", user)
    const templateVars = { 
      user: user,
      urls: urlDatabase, 
    }; 
    res.render("urls_index", templateVars);
  }
}
);



app.get("/urls/new", (req, res) => {
  let id = req.cookies["user_id"];
  const user = users[id];
  const templateVars = { 
    user: user
  }
  res.render("urls_new", templateVars);
});

app.get("/u/:id", (req, res) => {
  const id = req.params.id
  let userID = req.cookies["user_id"]
  const user = users[userID]
  const templateVars = {user: 
    user,
    id: id, 
    longURL: urlDatabase[id]
  }
  res.redirect("urls_show", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const id = req.params.id;
  let userID = req.cookies["user_id"];
  const user = users[userID];
  const longURL = urlDatabase[id]
  const templateVars = { 
    id,
    longURL,
    user
  };
  res.render("urls_show", templateVars);
});

app.get("/register", (req, res) => {
  const id = req.params.id;
  let userID = req.cookies["user_id"]
  const user = users[userID]
  const templateVars = {
    user: user,
    id: id, 
    longURL: urlDatabase[id]
  }
  res.render("register", templateVars)
})

app.get("/login", (req, res) => {
  const id = req.params.id;
  let userID = req.cookies["user_id"]
  const user = users[userID]
  const templateVars = {
    user: user,
    id: id, 
    longURL: urlDatabase[id]
  }
  res.render("urls_login", templateVars)
})

app.post("/urls", (req, res) => {
  const longURL = req.body.longURL;
  const shortURL = generateRandomString();
  urlDatabase[shortURL] - longURL;
  res.redirect(`/urls/${shortURL}`)
})


app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect("/urls")
})

app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  urlDatabase[id] = req.body.longURL
  res.redirect("/urls")
})

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/login")
})

app.post('/login', (req,res) => {
  const currentUser = req.body.email;
  const pass = req.body.password;
  const templateVars = {
    currentUser,
    id: currentUser, 
    password: pass,
  }
  for (let key in users){
   //console.log(key)
    console.log(users[key])
    if (users[key].email === currentUser){
      if (users[key].password === pass) {
        res.cookie("user_id", )
        return res.redirect('/urls', templateVars)
      } else {
        return res.send("error: user or password incorrect.")
      }
    }
  };
})

app.post("/register", (req, res) => {
  const newUserEmail = req.body.email;
  const newUserPass = req.body.password;
  const id = generateRandomString();
  if (newUserEmail === "" || newUserPass === "") {
    res.status(404).send("Please enter registration credentials.")
  };
  if (getUsersByEmail(users, newUserEmail)) {
    res.status(404).send("Email or password does not match.");
  } else {
    const newUser = {id, email: newUserEmail, password: newUserPass};
    users[id] = newUser;
    res.cookie("user_id", id);
    res.redirect("/urls");
  };
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

