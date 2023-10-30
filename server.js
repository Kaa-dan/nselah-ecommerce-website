// mongoose and atlas
const mongoose = require("mongoose");
const dbURL =
  "mongodb+srv://shalomWines:nithinni@cluster0.zuubnhm.mongodb.net/shalomWinesManagement?retryWrites=true&w=majority";
const connectionParams = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};
mongoose.set("strictQuery", false);
mongoose
  .connect(dbURL, connectionParams)
  .then(() => {
    console.info("connected to the database");
  })
  .catch((e) => {
    console.log(`error ${e}`);
  });

const express = require("express");
const app = express();

app.set("view engine", "ejs");
app.set("views", "./views");

const userRoute = require("./routes/users");

const adminRoute = require("./routes/admin");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// const session = require('express-session');

// app.use( session({secret: 'sessionSecret',resave: false,saveUninitialized: true }))

const nocache = require("nocache");

app.use(nocache());

const PORT = process.env.PORT || 9999;

app.use(express.static("public"));

app.use("/", userRoute);

app.use("/admin", adminRoute);

app.use("*", (req, res) => {
  res.render("users/error404");
});

app.listen(PORT, () => {
  console.log(`port is running @ ${PORT}`);
});
