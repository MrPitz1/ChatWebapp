const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const connectMongoDB = require('./lib/mongodb');
const Users = require('./models/Users');

const app = express();
const PORT = process.env.PORT || 7000;
const TOKEN_SECRET = process.env.TOKEN_SECRET || 'your_jwt_secret'; // Ensure this is set in your environment variables

app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON request bodies

const validatePassword = (password) => {
  const minLength = 8;
  const hasNumber = /\d/;
  const hasUpperCase = /[A-Z]/;
  const hasLowerCase = /[a-z]/;
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/;
  return (
    password.length >= minLength &&
    hasNumber.test(password) &&
    hasUpperCase.test(password) &&
    hasLowerCase.test(password) &&
    hasSpecialChar.test(password)
  );
};

app.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;

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

app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    await connectMongoDB();

    const user = await Users.findOne({ username });

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const tokenData = {
      id: user._id,
      username: user.username,
    };

    const token = jwt.sign(tokenData, TOKEN_SECRET, { expiresIn: '1d' });

    res.cookie('token', token, { httpOnly: true });
    res.cookie('username', user.username);

    return res.status(200).json({ message: 'Login successful' });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
