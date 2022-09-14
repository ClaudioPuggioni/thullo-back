const express = require("express");
const UserModel = require("../models/userModel");
const bcrypt = require("bcryptjs");
const router = express.Router();
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();
// process.env.TOKEN_SECRET;
let generateAccessToken = (payload) => {
  let accessToken = jwt.sign(payload, process.env.ACCESSTOKEN_SECRET, { expiresIn: process.env.ACCESSTOKEN_EXPIRATION });
  let refreshToken = jwt.sign(payload, process.env.REFRESHTOKEN_SECRET, { expiresIn: process.env.REFRESHTOKEN_EXPIRATION });
  return { accessToken, refreshToken };
};

router.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;

  console.log("USERNAME:", username, "\nEMAIL:", email, "\nPASSWORD:", password);

  if (!email || !password || !username) return res.status(400).send("Please fill all fields");

  const existingUser = await UserModel.findOne({ email: email });

  if (existingUser) return res.status(400).send("User already exists");

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  console.log("PASSWORD-HASH:", hashedPassword);

  const newUser = new UserModel({
    username: username,
    email: email,
    password: hashedPassword,
  });

  try {
    const savedUser = await newUser.save();
    console.log("SIGNUP/savedUser:", savedUser);

    const editedUser = savedUser.toJSON();
    delete editedUser.password;

    const payload = {
      id: savedUser._id,
      email: savedUser.email,
    };

    let { refreshToken, accessToken } = generateAccessToken(payload);

    return res.status(201).send({
      msg: "User created successfully",
      user: editedUser,
      refreshToken: refreshToken,
      accessToken: accessToken,
    });
  } catch (err) {
    console.log("SIGNUP/SAVE-ERROR:", err);
    return res.status(501).send(err.message);
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  console.log("EMAIL:", email, "\nPASSWORD:", password);

  if (!email || !password) return res.status(400).send("Please fill all fields");

  const foundUser = await UserModel.findOne({ email: email });

  if (!foundUser) return res.status(400).send("User does not exist");

  const isMatch = await bcrypt.compare(password, foundUser.password);

  if (!isMatch) return res.status(400).send("Invalid credentials");

  const payload = {
    id: foundUser._id,
    email: foundUser.email,
  };

  let { refreshToken, accessToken } = generateAccessToken(payload);

  let editedUser = foundUser.toJSON();
  delete editedUser.password;

  console.log(editedUser);

  return res.send({
    msg: "Logged in successfully",
    user: editedUser,
    refreshToken: refreshToken,
    accessToken: accessToken,
  });
});

router.post("/token", async (req, res) => {
  const email = req.body.email;
  const refresh_token = req.body.refreshToken;
  if (!refresh_token) return res.status(401).send("Please provide refresh token");

  const foundUser = await UserModel.findOne({ email: email });

  if (!foundUser) return res.status(404).send("Account does not exist");

  try {
    const payload = jwt.verify(refresh_token, process.env.REFRESHTOKEN_SECRET);
    console.log("TOKENPAYLOAD:", payload);

    // const { accessToken, refreshToken } = generateTokens();

    const accessToken = jwt.sign({ id: payload.id, email: foundUser.email }, process.env.ACCESSTOKEN_SECRET, {
      expiresIn: process.env.ACCESSTOKEN_EXPIRATION,
    });
    const refreshToken = jwt.sign({ id: payload.id, email: foundUser.email }, process.env.REFRESHTOKEN_SECRET, {
      expiresIn: process.env.REFRESHTOKEN_EXPIRATION,
    });

    return res.status(200).json({ accessToken, refreshToken });
  } catch (err) {
    return res.status(501).send(err.message);
  }
});

module.exports = router;
