const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const connectMongoDB = require('./lib/mongodb');
const Users = require('./models/Users');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 7000;
const TOKEN_SECRET = process.env.TOKEN_SECRET || crypto.randomBytes(32).toString('hex');

app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());
const validatePassword = (password) => {
  const minLength = 8;
  const maxLength = 20; // Maximum length for the password
  const hasNumber = /\d/;
  const hasUpperCase = /[A-Z]/;
  const hasLowerCase = /[a-z]/;
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/;
  return (
    password.length >= minLength &&
    password.length <= maxLength &&
    hasNumber.test(password) &&
    hasUpperCase.test(password) &&
    hasLowerCase.test(password) &&
    hasSpecialChar.test(password)
  );
};

const validateUsername = (username) => {
  const minLength = 3;
  const maxLength = 20;
  const isValid = /^[a-zA-Z0-9_]+$/.test(username); // Allows only alphanumeric characters and underscores
  return (
    username.length >= minLength &&
    username.length <= maxLength &&
    isValid
  );
};

app.post('/server/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate Username
    if (!validateUsername(username)) {
      return res.status(400).json({ message: 'Username does not meet the requirements' });
    }

    // Validate Password
    if (!validatePassword(password)) {
      return res.status(400).json({ message: 'Password does not meet the requirements' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await connectMongoDB();

    const user_exists = await Users.findOne({ username }).select('_id');
    if (user_exists) {
      return res.status(404).json({ message: 'User already exists' });
    }

    await Users.create({ username, password: hashedPassword });
    return res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.post('/server/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    await connectMongoDB();

    const user = await Users.findOne({ username });

    if (!user) {
      console.log('Invalid credentials: User not found');
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      console.log('Invalid credentials: Incorrect password');
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const tokenData = {
      id: user._id,
      username: user.username,
    };

    const token = jwt.sign(tokenData, TOKEN_SECRET, { expiresIn: '1d' });

    res.cookie('token', token, { httpOnly: true, secure: false, sameSite: 'Lax' });
    res.cookie('username', user.username, { secure: false, sameSite: 'Lax' });

    console.log(`Cookies set for user ${user.username}: token=${token}, username=${user.username}`);

    return res.status(200).json({ message: 'Login successful' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
