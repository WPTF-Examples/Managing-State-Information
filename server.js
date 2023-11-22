const express = require("express");
const app = express();
const clientSessions = require("client-sessions");

const HTTP_PORT = process.env.PORT || 8080;

// A simple user object, hardcoded for this example

const user = {
  username: "sampleuser",
  password: "samplepassword",
  email: "sampleuser@example.com"
};

// This is a helper middleware function that checks if a user is logged in
// we can use it in any route that we want to protect against unauthenticated access.
// A more advanced version of this would include checks for authorization as well after
// checking if the user is authenticated

function ensureLogin(req, res, next) {
  if (!req.session.user) {
    res.redirect("/login");
  } else {
    next();
  }
}

// Register ejs as the rendering engine for views

app.set("view engine", "ejs");

// Setup client-sessions

app.use(clientSessions({
  cookieName: "session", // this is the object name that will be added to 'req'
  secret: "week10example_web322", // this should be a long un-guessable string.
  duration: 2 * 60 * 1000, // duration of the session in milliseconds (2 minutes)
  activeDuration: 1000 * 60 // the session will be extended by this many ms each request (1 minute)
}));

// Parse application/x-www-form-urlencoded

app.use(express.urlencoded({ extended: false }));

// Setup a route on the 'root' of the url to redirect to /login

app.get("/", (req, res) => {
  res.redirect("/login");
});

// Display the login html page

app.get("/login", (req, res) => {
  res.render("login", { 
    errorMsg: ""
  });
});

// The login route that adds the user to the session

app.post("/login", (req, res) => {

  const username = req.body.username;
  const password = req.body.password;

  if(username === "" || password === "") {
    res.render("login", { 
      errorMsg: "Missing credentials."
    });
  }else{
    if(username == user.username && password == user.password) {
      req.session.user = {
        username: user.username,
        email: user.email
      };
      res.redirect("/dashboard");
    } else {
      res.render("login", { 
        errorMsg: "invalid username or password!"
      });
    }
  }
});

// Log a user out by destroying their session
// and redirecting them to /login

app.get("/logout", (req, res) => {
  req.session.reset();
  res.redirect("/login");
});

// An authenticated route that requires the user to be logged in.
// Notice the middleware 'ensureLogin' that comes before the function
// that renders the dashboard page

app.get("/dashboard", ensureLogin, (req, res) => {
  res.render("dashboard", {
    user: req.session.user
  });
});

app.use((req, res, next) => {
  res.status(404).send("Page Not Found");
});

app.listen(HTTP_PORT, ()=>{
  console.log(`server listening on: ${HTTP_PORT}`);
});
