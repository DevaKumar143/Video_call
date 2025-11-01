const express = require('express');
const mongoose = require('mongoose');
const app = express()
const port = 8080;
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");
const User = require("./models/User");
const VideoCall = require('./models/Videocall');
const wrapasync = require('./middleware/wrapasync');
const cors = require("cors");


const JWT_SECRET = "SurajVishwakarma@1";

app.use(express.json());
app.use(cors());

let MONGOURL = 'mongodb://127.0.0.1:27017/video';
main()
.then(() => {
console.log("connection successful");
})
.catch((err) => console.log(err));

async function main() {
  await mongoose.connect(MONGOURL);
}

// Route
app.post(
  "/create",
  [
    body("name", "Enter a valid name").isLength({ min: 3 }),
    body("email", "Enter a valid email").isEmail(),
    body("password").isLength({ min: 5 }),
  ],
  async (req, res) => {
    // If there are errors, return Bad request and the erros
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      // Check whether the user with this email exists already
      let user = await User.findOne({ email: req.body.email });
      if (user) {
        return res
          .status(400)
          .json({ errors: "Sorry a user with this email alredy exists" });
      }

      const salt = await bcrypt.genSalt(10);
      const secPass = await bcrypt.hash(req.body.password, salt);

      // Create New User
      user = await User.create({
        name: req.body.name,
        password: secPass,
        email: req.body.email,
      });
      const data = {
        user: {
          id: user.id,
        },
      };

      const authtoken = jwt.sign(data, JWT_SECRET);
      res.json({ authtoken });
    } catch (error) {
      console.log(error.message);
      res.status(500).send("Internal Server Error");
    }
  }
);

// Login the user Using post : 'login

app.post(
  "/login",
  [
    body("email", "Enter a valid Email").isEmail(),
    body("password", "Enter a valid password").exists(),
  ],
  async (req, res) => {
    // If there are errors , return Bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    try {
      let user = await User.findOne({ email });
      if (!user) {
        return res
          .status(400)
          .json({ error: "Please try to login correct credentials" });
      }

      const passwordCompare = await bcrypt.compare(password, user.password);
      if (!passwordCompare) {
        return res
          .status(400)
          .json({ error: "Please try to login with correct credential" });
      }
      const data = {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      };
      const authtoken = jwt.sign(data, JWT_SECRET);
      res.json({ authtoken });
    } catch (error) {
      console.log(error.message);
      res.status(500).send("Internal Server Error");
    }
  }
);

// Loggedin User Details Using post: '/getuser'
app.post("/getuser", wrapasync, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select("-password");
    res.send(user);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Internal Server Error");
  }
});


// POST /create-call
app.post('/createcall', wrapasync, async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch User name
    const user = await User.findById(userId).select('name');
    if(!user){
      return res.status(404).json({error: "User not found"});
    }
    
    const roomId = "room_" + Date.now();
    const startedAt  = new Date();

    
    const newCall = new VideoCall({
      roomId,
      participants: [
        {
          userId: userId,
          name: user.name
        }
      ],
      createdBy: userId,
      startedAt: startedAt
      
    });
    

    const joinLink = `http://localhost:3000/videocall/${roomId}`;
    newCall.joinLink = joinLink;
    await newCall.save();

    // Generate join link
    res.status(201).json({
      message: "Call created successfully",
      roomId: newCall.roomId,
      createdBy: user.name,
      participants: newCall.participants,
      startedAt: startedAt,
      joinLink: joinLink,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Internal Server Error");
  }
});


app.post('/acceptcall', wrapasync, async (req, res) => {
  try {
    const userId = req.user.id;
    const { roomId } = req.body;

    // Find the call
    const call = await VideoCall.findOne({ roomId });
    if (!call) {
      return res.status(404).json({ error: "Call not found" });
    }

    // Fetch user info
    const user = await User.findById(userId).select('name');
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if user already in participants
    const alreadyJoined = call.participants.some(
      (p) => p.userId.toString() === userId
    );

    if (!alreadyJoined) {
      call.participants.push({
        userId,
        name: user.name,
      });
      await call.save();
    }

    res.status(200).json({
      message: "Joined call successfully",
      roomId: call.roomId,
      participants: call.participants,
      joinLink: call.joinLink,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Internal Server Error");
  }
});


app.post('/end-call/:roomId', wrapasync, async (req, res) => {
  try {
    const userId = req.user.id;
    const { roomId } = req.params;

    // Find the call
    const call = await VideoCall.findOne({ roomId });

    if (!call) {
      return res.status(404).json({ error: "Call not found" });
    }

    // Optional: Ensure only the creator can end the call
    if (call.createdBy.toString() !== userId) {
      return res.status(403).json({ error: "Not allowed to end this call" });
    }

    // Mark call as ended
    call.status = 'ended';
    call.callEndedAt = new Date();

    // calculate duration
    if(call.startedAt){
      const durationMs = call.callEndedAt - call.startedAt;
      call.duration = Math.floor(durationMs / 1000);
    }

    await call.save();

    res.json({
      message: "Call ended successfully",
      roomId: call.roomId,
      endedAt: call.callEndedAt,
      duration: call.duuration,
      createdBy: call.createdBy
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
});


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})