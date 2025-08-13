// app.js
const express = require("express");
const session = require("express-session");
const pgSession = require('connect-pg-simple')(session);
const bodyParser = require("body-parser");
const path = require("path");
const createTables = require("./models/initTables");
// const notificationRoutes = require("./routes/notificationRoutes");
const runNewsletterScheduler = require("./cron/newsletterScheduler");
const runDevotionalScheduler = require("./cron/cronJobs");
require("dotenv").config(); // Load .env variables
const pool = require('./models/db'); // adjust path based on your folder structure
const methodOverride = require("method-override");



const app = express();
const layout = require("express-ejs-layouts");


// app.use(express.json());
// app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Set EJS as view engine
app.set("view engine", "ejs");

app.set("views", path.join(__dirname, "views"));
app.use(layout);

// Set default layout file (optional)
// app.set('layout', 'partials/adminLayout'); // default layout for all .ejs files unless overridden

// Middleware

app.set("view engine", "ejs");
app.set("view cache", false);
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // Change to true only in HTTPS
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    },
  })
);
app.use((req, res, next) => {
  if (req.session && req.session.user) {
    req.user = req.session.user; // 👈 Attach user to req
    res.locals.user = req.session.user; // (optional) make available in views
  }
  next();
});

app.locals.vapidPublicKey = process.env.VAPID_PUBLIC_KEY;

app.use(methodOverride("_method"));

app.use((req, res, next) => {
  console.log("🧾 SESSION:", req.session);
  next();
});

app.use((req, res, next) => {
  res.locals.title = "Company"; // Default title
  next();
});

// Routes
// app.get('/', (req, res) => {
//   res.render('home');
// });

const publicRoutes = require("./routes/publicRoutes");
app.use("/", publicRoutes);

const adminRoutes = require("./routes/adminRoutes");
app.use("/admin", adminRoutes);

// const videoRoutes = require("./routes/videoRoutes");
// app.use("/admin", videoRoutes);

const userRoutes = require("./routes/userRoutes");
app.use("/", userRoutes);

const aboutRoutes = require("./routes/aboutRoutes");
app.use("/", aboutRoutes);

const galleryRoutes = require("./routes/galleryRoutes");
app.use("/", galleryRoutes);


const studentRoutes = require("./routes/student");
app.use("/student", studentRoutes);


app.get("/test", (req, res) => {
  res.send("✅ Test route works");
});

// const subscribeRoutes = require("./routes/subscribeRoutes");
// app.use("/", subscribeRoutes);

// const publicFaqRoutes = require("./routes/publicFaqRoutes.js");
// app.use("/", publicFaqRoutes);

// const adminFaqRoutes = require("./routes/adminFaqRoutes");
// app.use("/", adminFaqRoutes);

// const publicArticleRoutes = require("./routes/publicArticleRoutes");
// app.use("/", publicArticleRoutes);

// const publicVideoRoutes = require("./routes/publicVideoRoutes");
// app.use("/", publicVideoRoutes);

// const interactionRoutes = require("./routes/interactionRoutes");
// app.use("/interaction", interactionRoutes);

// // Example in your routes file
// router.get('/login', (req, res) => {
//   res.render('admin/login'); // note: include 'admin/' because login.ejs is inside admin folder
// });



// app.use("/notifications", notificationRoutes);

runNewsletterScheduler();

// runDevotionalScheduler();

// Run table creation at startup
createTables();

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on https://localhost:${PORT}`);
});
