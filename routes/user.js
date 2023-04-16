const express = require("express");
const router = express.Router();

const uid2 = require("uid2");
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");

const User = require("../models/User");

router.post("/user/signup", async (req, res) => {
  try {
    const { username, email, password, newsletter } = req.body;
    if (
      !username ||
      !email ||
      !password ||
      (newsletter !== true && newsletter !== false)
    ) {
      return res.status(409).json("informatios manquantes");
    }

    const emailData = await User.findOne({ email: req.body.email });
    if (emailData) {
      return res.status(409).json("email existant");
    }

    const salt = uid2(16); //String alétoire de 16 caractère
    //on concatène le salt + password et tout est encrypter pour crée un hash
    const hash = SHA256(salt + password).toString(encBase64);
    const token = uid2(64);

    const newUser = new User({
      email: req.body.email,
      account: {
        username: req.body.username,
      },
      newsletter: req.body.newsletter,
      token: token,
      hash: hash,
      salt: salt,
    });

    await newUser.save();

    res.status(200).json({
      _id: newUser._id,
      token: newUser.token,
      account: newUser.account,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/user/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(409).json("non autorisé");
    }

    const userData = await User.findOne({ email: email });
    if (!userData) {
      return res.status(409).json("non autorisé");
    }

    const hash2 = SHA256(userData.salt + password).toString(encBase64);
    if (hash2 !== userData.hash) {
      return res.status(401).json("non autorisé");
    }
    res.status(200).json({
      _id: userData.id,
      token: userData.token,
      account: userData.account,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
