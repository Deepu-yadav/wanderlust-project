if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
let session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user");

const MongoStore = require("connect-mongo");

const ExpressError = require("./utils/ExpressError");

const listingRouter = require("./routes/listing");
const reviewRouter = require("./routes/reviews");
const userRouter = require("./routes/user");

const cookieParser = require("cookie-parser");

const PORT = 8080;


const MONGO_URL = process.env.DB_URL;

main()
  .then(() => {
    console.log("MongoDb Connected successfully!");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

// Express-sessions (+ Connect Mongo)

const store = MongoStore.create({
  mongoUrl: MONGO_URL,
  crypto: {
    secret: process.env.SECRET,
  },
  touchAfter: 24 * 3600,
});

store.on("error", () => {
  console.log("ERROR in MONGO SESSION STORE", err)
})


const sessionOptions = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000, 
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true, 
  },
};

app.use(session(sessionOptions));
app.use(flash());

// COOKIE-PARSER

app.use(cookieParser("secretcode")); 


app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate())); 

passport.serializeUser(User.serializeUser()); 
passport.deserializeUser(User.deserializeUser()); 

// SETTING UP EJS:

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true })); 
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));


app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currentUser = req.user; 
  console.log("success value", res.locals.success);
  next();
});


app.get("/demouser", async (req, res) => {
  let fakeUser = new User({
    email: "student@gmail.com",
    username: "hello-world",
  });

  let registeredUser = await User.register(fakeUser, "hello-password"); 

  res.send(registeredUser);
});

// LISTINGS ROUTER
app.use("/", listingRouter);

// REVIEWS ROUTER
app.use("/listings/:id/reviews", reviewRouter);

// USERS ROUTER
app.use("/", userRouter);


app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page not found!")); 
});


app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something went wrong!" } = err; 

  res.status(statusCode).render("error.ejs", { statusCode, message });
});

app.listen(PORT, () => {
  console.log(`Server is listening on ${PORT}`);
});
