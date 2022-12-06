const express = require("express");
const cookieSession = require('cookie-session')
const bcrypt = require("bcryptjs")
const app = express();
const { generateRandomString, getUsersByEmail, userURL } = require('./helper.js');

const PORT = 8080; // default port 8080

//MIDDLEWARE
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'Session', 
  keys: ['shh-key', 'topsecret-key']
}));


// database for storing user data
const users = {
  "hikaw": {
    id: "whateva", 
    email: "whateva@gmail.com",
    password: "whatevaEva"
  }
};

// database for storing userURL's
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

// home page just redirects to /urls
app.get("/", (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID];
  if (!user) {
    res.redirect('/login');
  } else {
    res.redirect('/urls'
    )
  }
});

// page to display list of user URL's
// if user is not logged in, redirect to html response.
app.get("/urls", (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID]
  if (!user) {
    res.send("You need to <a href='/login'>login</a> to create shortened urls.")
  } else {
    const urls = userURL(userID, urlDatabase)
    const templateVars = { 
      userID,
      urls, 
      user
    }; 
    res.render("urls_index", templateVars);
  };
});

// page displays new URL creation page. Only logged in users can create tinyURL
// checks for logged in user, if none, redirect to login page.
app.get("/urls/new", (req, res) => {
  let userID = req.session.user_id;
  const user = users[userID];
  if (!user) {
    res.send("Please <a href='/login'>login</a> to create new Tiny Urls.")
  } else {
    const templateVars = { 
      userID: userID,
      user
    }
    res.render("urls_new", templateVars);
  }
});

// page to redirect short URL to corresponding long URL.
app.get("/u/:id", (req, res) => {
  const id = req.params.id
  if (!urlDatabase[id]) {
    res.send("This URL does not exist. Create a new one here <a href='/urls/new'>here.</a>")
  } else {
    const longURL = urlDatabase[id].longURL
    res.redirect(longURL);
  }
});

// Page to display specific URL with redirection to specfic URL implemented. Allows for tinyURL editing if it belongs to user.
app.get("/urls/:id", (req, res) => {
  let userID = req.session.user_id;
  const id = req.params.id;
  const user = users[userID];
  if (!user || !id) {
    return res.send("You need to <a href='/login'>login</a> to edit your urls. If you are logged in, this URL is not yours or does not exist.")
} 
const urlsForuser = userURL(userID, urlDatabase) 
console.log("urlsforuser:", urlsForuser) 
  if (urlsForuser[id]) {
  const longURL = urlDatabase[id].longURL;
  const templateVars = { 
      id,
      longURL,
      userID, 
      user
    } 
    res.render("urls_show", templateVars);
  } else {
    res.send('Url does not belong to this user. Please login with correct User to edit this url.');
  }
});

// Page to display registration. Redirects if logged in, if not renders page to allow for user registration.
app.get("/register", (req, res) => {
  let userID = req.session.user_id;
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

// Creation a new tinyURL. Checks to see if user is logged-in to do this. Redirects user to /urls page with newly implemented url on display from the user's database.
app.post("/urls/new", (req, res) => {
  const longURL = req.body.longURL;
  const userID = req.session.user_id;
  const shortURL = generateRandomString(6);
  const user = users[userID];
  if (!user) {
    res.send("Please <a href='/login'>login</a> to create a new url.")
  } else if (longURL.startsWith('http://') || longURL.startsWith('https://')) {
      urlDatabase[shortURL] = { 
        userID, 
        longURL: longURL 
      };
      res.redirect(`/urls`)
  } else {
    res.send("Invalid url. If you are admin of this tinyURL, please recreate to include https:// or http://.")
  } 
})

// Button post to allow for deletion of personal URL from the urlDatabase.
app.post("/urls/:id/delete", (req, res) => {
  let userID = req.session.user_id;
  const user = users[userID] 
  if (!user) {
    res.redirect("/login")
  } else {
    const id = req.params.id;
    delete urlDatabase[id];
  }
  res.redirect("/urls")
})

// Allows for editing of the url. Checks if user owns url. Sends an error if the url doesn't include http or https.
app.post("/urls/:id", (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID];
  const longURL = req.body.longURL;
  if (!user) {
    res.redirect('/login')
  } else if (longURL.startsWith('http://') || longURL.startsWith('https://')) {
    const id = req.params.id;
    urlDatabase[id] = { 
      longURL,
      userID
     };
    res.redirect("/urls");
  } else {
    res.send("Invalid url. If you are admin of this tinyURL, please recreate to include https:// or http://.")
  } 
})


//Allows user to logout. Clears encryptoed cookie and redirects to login page.
app.post("/logout", (req, res) => {
  req.session = null; 
  res.redirect("/login")
})

//creation of login page. If the user is already logged in, it redirects to urls page.
app.get("/login", (req, res) => {
  let userID = req.session.user_id;
  const user = users[userID];
  if (user) {
    res.redirect('/urls');
  } else {
    res.render("urls_login", {user: null});
  }
})

// Allows user to login if user in in the databse. Redirects logged in user to urls page
app.post('/login', (req,res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = getUsersByEmail(users, email);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    res.send("Email has already been used. Or account does not exist. Try Again. <a href='/login'>Login here</a>");
  } else {
    req.session.user_id = user.id;
    res.redirect('/urls');
  }
})

// allows creation of new user and pushes that user to the userdatabase
// if user exists, throws an error. if no user or pass was implemented, throw an error
//redirect new user to personal urls page
app.post("/register", (req, res) => {
  const newUserEmail = req.body.email;
  const newUserPass = req.body.password;
  const hashPassword = bcrypt.hashSync(newUserPass)
  if (!newUserEmail || !newUserPass) {
    return res.status(404).send("Please enter registration credentials. Please <a href='/register'> try again.</a>")
  };
  if (getUsersByEmail(users, newUserEmail)) {
    res.status(404).send("User has already been established. Please register with a different email. <a href='/register'>Regsiter</a>");
  } else {
    const id = generateRandomString(6);
    const newUser = {
      id,
      email: newUserEmail,
       password: hashPassword
      };
    users[id] = newUser;
    req.session.user_id = id;
    res.redirect("/urls");
  };
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

//module.export = { urlDatabase, users }