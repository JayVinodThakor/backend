// ===== IMPORTS =====
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// ===== INIT =====
const app = express();

// ===== MIDDLEWARE =====
app.use(cors({
  origin: "*",
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());

// ===== MONGO CONNECT =====
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected 🚀"))
  .catch(err => console.log(err));

// ===== USER MODEL =====
const userSchema = new mongoose.Schema({
  email: String,
  password: String
});

const User = mongoose.model("User", userSchema);

// ===== ROUTES =====

// TEST
app.get("/", (req, res) => {
  res.send("Backend running 🚀");
});

// REGISTER
app.post("/api/register", async (req, res) => {
  const { email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      email,
      password: hashedPassword
    });

    await user.save();

    // 🔥 RETURN TOKEN ALSO
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ message: "User registered ✅", token });

  } catch (err) {
    res.json({ message: "Error registering user" });
  }
});

// LOGIN
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.json({ message: "Wrong password" });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ message: "Login successful 😎", token });

  } catch (err) {
    res.json({ message: "Login error" });
  }
});

// CHAT
app.post("/api/chat", async (req, res) => {
  const { message } = req.body;

  try {
    const reply = "AI says: " + message;
    res.json({ reply });

  } catch (err) {
    res.json({ reply: "Error occurred" });
  }
});

// ===== START SERVER =====
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("Server running 🚀");
});
