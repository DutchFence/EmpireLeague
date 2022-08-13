const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const lodash= require("lodash");

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));

const port = 3000;
app.get("/", function(req, res){
  res.render("home");
});



app.listen(3000, function(){
  console.log("server started on port: ", port);
});
