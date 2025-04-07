// const express = require("express");
// const app = express();
// const UserModel = require("./models/user");
// const cookieParser = require("cookie-parser");
// const bcrypt = require("bcrypt");
// const jwt = require("jsonwebtoken");
// const cors = require("cors");

// // Middleware
// // For specific origins (add your frontend port)
// app.use(cors({ 
//     origin: ["http://localhost:3001", "http://localhost:5173"], 
//     credentials: true 
//   }));
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use(cookieParser());



// const authMiddleware = (req, res, next) => {
//   const token = req.cookies.token;
//   if (!token) return res.status(401).json({ error: "Unauthorized" });

//   jwt.verify(token, "Aashish", (err, decoded) => {
//     if (err) return res.status(403).json({ error: "Invalid token" });
//     req.user = decoded;
//     next();
//   });
// };

// // Faculty credentials
// const FACULTY_EMAIL = "aashish@1234.com";
// const FACULTY_PASSWORD = "Ab@9765229769";

// // Register Student
// app.post("/register", async (req, res) => {
//   try {
//     const { name, email, phoneNo, studentClass, password, confirmPassword } = req.body;

//     if (password !== confirmPassword) {
//       return res.status(400).json({ error: "Passwords do not match" });
//     }

//     const existingUser = await UserModel.findOne({ email });
//     if (existingUser) {
//       return res.status(400).json({ error: "Email already exists" });
//     }

//     const salt = await bcrypt.genSalt(10);
//     const hash = await bcrypt.hash(password, salt);

//     const user = await UserModel.create({
//       name,
//       email,
//       phoneNo,
//       class: studentClass,
//       password: hash,
//       role: "student"
//     });

//     const token = jwt.sign({ email, role: "student" }, "Aashish", { expiresIn: "1h" });
//     res.cookie("token", token, { httpOnly: true });

//     res.status(201).json({ message: "Student registered successfully", user });
//   } catch (error) {
//     res.status(500).json({ error: "Error registering student" });
//   }
// });

// // Login (Both faculty and student)
// app.post("/login", async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     // Check if faculty login
//     if (email === FACULTY_EMAIL) {
//       if (password === FACULTY_PASSWORD) {
//         const token = jwt.sign({ email, role: "faculty" }, "Aashish", { expiresIn: "1h" });
//         res.cookie("token", token, { httpOnly: true });
//         return res.status(200).json({ message: "Faculty login successful", role: "faculty" });
//       } else {
//         return res.status(400).json({ error: "Invalid faculty credentials" });
//       }
//     }

//     // Student login
//     const user = await UserModel.findOne({ email });
//     if (!user) return res.status(400).json({ error: "Invalid credentials" });

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

//     const token = jwt.sign({ email, role: "student" }, "Aashish", { expiresIn: "1h" });
//     res.cookie("token", token, { httpOnly: true });

//     res.status(200).json({ message: "Login successful", user, role: "student" });
//   } catch (error) {
//     res.status(500).json({ error: "Login error" });
//   }
// });

// // Get all students (for faculty)
// app.get("/students", authMiddleware, async (req, res) => {
//   try {
//     if (req.user.role !== "faculty") {
//       return res.status(403).json({ error: "Access denied" });
//     }

//     const students = await UserModel.find({ role: "student" }, { password: 0 });
//     res.status(200).json({ students });
//   } catch (error) {
//     res.status(500).json({ error: "Error fetching students" });
//   }
// });

// // Get student profile
// app.get("/profile", authMiddleware, async (req, res) => {
//   try {
//     const user = await UserModel.findOne({ email: req.user.email }, { password: 0 });
//     if (!user) return res.status(404).json({ error: "User not found" });

//     res.status(200).json({ user });
//   } catch (error) {
//     res.status(500).json({ error: "Error fetching profile" });
//   }
// });

// app.post("/logout", (req, res) => {
//   res.cookie("token", "", { expires: new Date(0) });
//   res.status(200).json({ message: "Logged out successfully" });
// });

// app.listen(3000, () => console.log("Server running on port 3000"));






const express = require("express");
const app = express();
const UserModel = require("./models/user");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");

// Middleware
app.use(cors({ 
  origin: ["http://localhost:3001", "http://localhost:5173","http://localhost:3000"], 
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const authMiddleware = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  jwt.verify(token, "Aashish", (err, decoded) => {
    if (err) return res.status(403).json({ error: "Invalid token" });
    req.user = decoded;
    next();
  });
};

// Faculty credentials
const FACULTY_EMAIL = "aashish@1234.com";
const FACULTY_PASSWORD = "Ab@9765229769";

// Register Student
app.get('/', (req, res) => {
  res.send('🚀 Express server is running!');
});
app.post("/register", async (req, res) => {
  try {
    const { name, email, phoneNo, studentClass, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match" });
    }

    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const user = await UserModel.create({
      name,
      email,
      phoneNo,
      class: studentClass,
      password: hash,
      role: "student",
      gameResults: []
    });

    const token = jwt.sign({ email, role: "student" }, "Aashish", { expiresIn: "1h" });
    res.cookie("token", token, { 
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production'
    });

    res.status(201).json({ message: "Student registered successfully", user });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Error registering student" });
  }
});

// Login (Both faculty and student)
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if faculty login
    if (email === FACULTY_EMAIL) {
      if (password === FACULTY_PASSWORD) {
        const token = jwt.sign({ email, role: "faculty" }, "Aashish", { expiresIn: "1h" });
        res.cookie("token", token, { 
          httpOnly: true,
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production'
        });
        return res.status(200).json({ message: "Faculty login successful", role: "faculty" });
      } else {
        return res.status(400).json({ error: "Invalid faculty credentials" });
      }
    }

    // Student login
    const user = await UserModel.findOne({ email });
    if (!user) return res.status(400).json({ error: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign({ email, role: "student" }, "Aashish", { expiresIn: "1h" });
    res.cookie("token", token, { 
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production'
    });

    res.status(200).json({ message: "Login successful", user, role: "student" });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login error" });
  }
});

// Save game results
app.post("/save-game-result", authMiddleware, async (req, res) => {
  try {
    const { gameName, score, completionTime, totalQuestions, accuracy } = req.body;
    
    const gameResult = {
      gameName,
      score,
      completionTime,
      totalQuestions,
      accuracy,
      date: new Date()
    };

    await UserModel.updateOne(
      { email: req.user.email },
      { $push: { gameResults: gameResult } }
    );

    res.status(200).json({ message: "Game result saved successfully" });
  } catch (error) {
    console.error("Error saving game result:", error);
    res.status(500).json({ error: "Error saving game result" });
  }
});

// Get all students (for faculty)
// Get all students (for faculty)
// Get all students (for faculty)
app.get("/students", authMiddleware, async (req, res) => {
  try {
    console.log("Fetching students...");
    
    if (req.user.role !== "faculty") {
      console.log("Access denied - user is not faculty");
      return res.status(403).json({ error: "Access denied" });
    }

    // Correct projection - either include fields or exclude, don't mix
    const students = await UserModel.find(
      { role: "student" },
      { 
        name: 1,
        email: 1,
        phoneNo: 1,
        class: 1,
        createdAt: 1,
        gameResults: 1,
        _id: 1
      }
    ).sort({ createdAt: -1 }).lean();
    
    console.log(`Found ${students.length} students`);
    res.status(200).json({ students });
  } catch (error) {
    console.error("Detailed error fetching students:", {
      message: error.message,
      stack: error.stack,
      fullError: error
    });
    res.status(500).json({ 
      error: "Error fetching students",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Add these new routes to your existing index.js

// Clear game results (keeps last 3 attempts per game)
app.post("/clear-game-results/:studentId", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "faculty") {
      return res.status(403).json({ error: "Access denied" });
    }

    const student = await UserModel.findById(req.params.studentId);
    if (!student) return res.status(404).json({ error: "Student not found" });

    // Group by gameName and keep last 3 attempts for each game
    const games = {};
    student.gameResults.forEach(result => {
      if (!games[result.gameName]) {
        games[result.gameName] = [];
      }
      games[result.gameName].push(result);
    });

    // Sort each game's results by date (newest first) and keep last 3
    const newResults = [];
    Object.keys(games).forEach(gameName => {
      const sorted = games[gameName].sort((a, b) => b.date - a.date).slice(0, 3);
      newResults.push(...sorted);
    });

    // Update student with filtered results
    student.gameResults = newResults;
    await student.save();

    res.status(200).json({ 
      message: "Game results cleared (kept last 3 attempts per game)",
      student 
    });
  } catch (error) {
    console.error("Error clearing game results:", error);
    res.status(500).json({ error: "Error clearing game results" });
  }
});

// Clear all results for a specific game
app.post("/clear-game-results/:studentId/:gameName", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "faculty") {
      return res.status(403).json({ error: "Access denied" });
    }

    const student = await UserModel.findById(req.params.studentId);
    if (!student) return res.status(404).json({ error: "Student not found" });

    // Keep only results not matching the specified game
    student.gameResults = student.gameResults.filter(
      result => result.gameName !== req.params.gameName
    );

    await student.save();

    res.status(200).json({ 
      message: `All ${req.params.gameName} results cleared`,
      student 
    });
  } catch (error) {
    console.error("Error clearing game results:", error);
    res.status(500).json({ error: "Error clearing game results" });
  }
});
// Get student profile
app.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await UserModel.findOne({ email: req.user.email }, { password: 0 });
    if (!user) return res.status(404).json({ error: "User not found" });

    res.status(200).json({ user });
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ error: "Error fetching profile" });
  }
});

app.post("/logout", (req, res) => {
  res.cookie("token", "", { 
    expires: new Date(0),
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production'
  });
  res.status(200).json({ message: "Logged out successfully" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));