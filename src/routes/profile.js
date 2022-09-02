module.exports = function(app) {

  app.get("/dashboard", function(req, res) {
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

}
