//Requires
require("dotenv").config();
const https = require('https');
const fs = require('fs');


const express = require("express");

process.setMaxListeners(0);
const bodyParser = require("body-parser");
const ejs = require("ejs");
const lodash = require("lodash");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const FacebookStrategy = require('passport-facebook');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require("mongoose-findorcreate");
const options = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem')
};
// Inits
const app = express();
app.use(express.static(__dirname + '/public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: false
}));

app.use(session({
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/userDB", {
  useNewUrlParser: true
});

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true
  },
  email_verified: {
    type: Boolean,
    default: false
  },
  username: {
    type: String,
    required: false,
    unique: true
  },
  display: {
    type: String
  },
  password: {
    type: String,
    required: false
  },
  provider: {
    type: String,
    required: true,
    default: "Empire League"
  },
  providerId: String,
  secret: String
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const User = new mongoose.model("User", userSchema);
passport.use(User.createStrategy());

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/dashboard",
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
  },
  function(accessToken, refreshToken, profile, cb) {
    // console.log(profile);
    User.findOrCreate({
      email: profile.emails[0].value,
      username: profile.emails[0].value,
      provider: "Google",
      providerId: profile.id
    }, function(err, user) {
      return cb(err, user);
    });
  }
));

passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: "http://localhost:3000/auth/facebook/dashboard",
    enableProof: true,
    profileFields: ['id', 'emails']
  },
  function(accessToken, refreshToken, profile, cb) {
    // console.log(profile);
    User.findOrCreate({
      email: profile.emails[0].value,
      username: profile.emails[0].value,
      provider: "Facebook",
      providerId: profile.id
    }, function(err, user) {
      // console.log(profile.id);
      return cb(err, user);
    });
  }
));
// Variables



app.get("/", function(req, res) {
  res.render("home");
});

app.post("/login", function(req, res) {
  const user = new User({
    username: req.body.username,
    password: req.body.password
  });
  req.login(user, function(err) {
    if (err) {
      console.log(err);
    } else {
      passport.authenticate("local")(req, res, function() {
        res.redirect("/dashboard");
      });
    };
  });
});

app.post('/logout', function(req, res) {
  req.logout(function(err) {
    if (err) {
      return next(err);
    }
    res.redirect('/');
  });
});

app.get("/login", function(req, res) {
  if (req.isAuthenticated()) {
    res.render("dashboard", {
      profile: req
    });
  } else {
    res.render("login");
  }
});
app.get('/verifyEmailRegistration', function(req, res) {
  res.render("verifyEmailRegistration");
});
app.post("/register", function(req, res) {
  console.log("post register");
  User.register({
    email: req.body.email,
    username: req.body.email
  }, req.body.password, function(err, user) {
    console.log("registered");
    if (req.body.password.length < 7) {
      console.log("te kort");
      let data = {
        email: req.body.email,
        content: "Password is too short: requires a minimum of 7 characters"
      };
      res.render("register", {
        message: data
      });
    } else if (req.body.password != req.body.verifyPassword) {
      console.log("matching passwords");
      let data = {
        email: req.body.email,
        content: "Passwords don't match: try again gl hf"
      };
      res.render("register", {
        message: data
      });
    } else if (err) {
      console.log("err");
      let data = {
        email: req.body.email,
        content: err
      };
      res.render("register", {
        message: data
      });
      console.log(err);
    } else {
      console.log("else");
      console.log(req);

      if (req.isAuthenticated()) {
        console.log("authenticated ");
        console.log(req);
        res.render("dashboard", {
          profile: req
        });


      } else {
        console.log("lol");
      }

    }
  });

});

app.get('/auth/facebook',
  passport.authenticate('facebook', {
    scope: ['email']
  }));

app.get('/auth/facebook/dashboard',
  passport.authenticate('facebook', {
    failureRedirect: '/login'
  }),
  function(req, res) {

    // Successful authentication, redirect home.
    res.redirect('/dashboard');
  });

app.get('/auth/google',
  passport.authenticate('google', {
    scope: ['profile', 'email']
  }));

app.get('/auth/google/dashboard',
  passport.authenticate('google', {
    failureRedirect: '/login'
  }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/dashboard');
  });

app.get("/register", function(req, res) {
  console.log("get register");
  let data = {
    email: "",
    content: "The longer the better and keep it original. Minimum of 7 characters."
  }
  res.render("register", {
    message: data
  });
});


app.get("/dashboard", function(req, res) {
  // console.log(req);
  console.log("redirected naar dashboard");
  if (req.isAuthenticated()) {
    console.log("authenticated ");
    console.log(req);
    res.render("dashboard", {
      profile: req
    });


  } else {
    res.redirect("/login");
  }
});

app.listen(process.env.PORT, function() {
  console.log("server started on port: ", process.env.PORT);
});
// https.createServer(options, app).listen(8080, () => {
//   console.log(`HTTPS server started on port 8080`);
// });
