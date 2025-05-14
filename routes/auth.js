const express = require("express");
const router = express.Router();
const User = require("../models/User");

// Sign up route
router.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res
        .status(400)
        .render("signup", { error: "Username or email already exists" });
    }

    const user = await User.create({ username, email, password });

    req.session.user = {
      id: user._id,
      username: user.username,
      email: user.email,
      userId: user.userId,
    };

    res.redirect(303, "/");
  } catch (error) {
    res.status(500).render("signup", { error: error.message });
  }
});

// Login route
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    // find user
    const user = await User.findOne({ username });

    if (!user) {
      return res
        .status(401)
        .render("login", { error: "Incorrect username or password" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res
        .status(401)
        .render("login", { error: "Incorrect username or password" });
    }

    req.session.user = {
      id: user._id,
      username: user.username,
      email: user.email,
      userId: user.userId,
    };

    // redirect 303
    res.redirect(303, "/");
  } catch (error) {
    //return 500 cho lỗi server
    res.status(500).render("login", { error: "Lỗi server: " + error.message });
  }
});

//  route logout
router.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Lỗi đăng xuất:", err);
      return res.status(500).send("Lỗi server");
    }
    res.redirect(303, "/");
  });
});

module.exports = router;
