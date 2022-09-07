//Requires
require("dotenv").config();
process.setMaxListeners(0);

const https = require('https');
const fs = require('fs');
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const lodash = require("lodash");
const mongoose = require("mongoose");

const app = express();


require("./src/routes/user")(app);
require("./src/routes/profile")(app);
app.use(express.static(__dirname + '/public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: false
}));


mongoose.connect("mongodb://localhost:27017/userDB", {
  useNewUrlParser: true
});

// Variables



app.get("/", function(req, res) {
  res.render("dashboard", {
    profile_picture: "/img/theviper.jpg",
    nextOpponent: "/img/Hera.jpg",
    name:"Hera",
    wonGames: "4",
    playedGames:"8",
    lostGames: "4",
    position: "3"
  });
});

app.listen(process.env.PORT, function() {
  console.log("server started on port: ", process.env.PORT);
});
// https.createServer(options, app).listen(8080, () => {
//   console.log(`HTTPS server started on port 8080`);
// });
