const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const session = require("express-session");
const authRoutes = require("./routes/auth");
const User = require("./models/User");

const app = express();

// Connect to the database
mongoose
  .connect("mongodb://localhost:27017/interviewApp", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("connect success");
  })
  .catch((err) => {
    console.error("err MongoDB:", err);
  });

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));
app.use(
  session({
    secret: "secret_key",
    resave: false,
    saveUninitialized: true,
  })
);

app.set("view engine", "ejs");

// Routes

app.get("/", async (req, res) => {
  try {
    // Đếm tổng số người dùng đã đăng ký
    const totalUsers = await User.countDocuments();

    if (req.session.user) {
      // Nếu đã đăng nhập
      res.render("index", {
        user: req.session.user,
        totalUsers: totalUsers,
        isLoggedIn: true,
      });
    } else {
      // Nếu chưa đăng nhập
      res.render("index", {
        user: null,
        totalUsers: totalUsers,
        isLoggedIn: false,
      });
    }
  } catch (error) {
    console.error("Lỗi khi truy vấn database:", error);
    res.status(500).send("Lỗi server");
  }
});

app.get("/signup", (req, res) => {
  res.render("signup");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.use(authRoutes);

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
