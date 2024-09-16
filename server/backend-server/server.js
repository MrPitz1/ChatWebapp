const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const connectMongoDB = require('./lib/mongodb');
const Users = require('./models/Users');

const app = express();
const PORT = process.env.PORT;
const NGINX_PORT = process.env.NGINX_PORT;
const TOKEN_SECRET = process.env.TOKEN_SECRET || crypto.randomBytes(32).toString('hex');

// Middleware setup: CORS to handle cross-origin requests and express.json() to parse JSON payloads
app.use(cors({ origin: `http://localhost:${NGINX_PORT}`, credentials: true }));
app.use(express.json());

/*
 * Function to validate password strength.
 * A valid password must be 8-20 characters long, contain at least one number, one uppercase letter,
 * one lowercase letter, and one special character.
 */
const validatePassword = (password) => {
  const minLength = 8;
  const maxLength = 20;
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

/*
 * Function to validate username.
 * A valid username must be 3-20 characters long and consist of letters, numbers, and underscores only.
 */
const validateUsername = (username) => {
  const minLength = 3;
  const maxLength = 20;
  const isValid = /^[a-zA-Z0-9_]+$/.test(username);
  return (
    username.length >= minLength &&
    username.length <= maxLength &&
    isValid
  );
};

/*
 * Function to check if a friendship already exists between two users.
 */
const friendshipExists = async (user1, user2) => {
  const existingFriendship = await Friendship.findOne({
    $or: [
      { user1, user2 },
      { user1: user2, user2: user1 }
    ]
  });
  return !!existingFriendship;
};

/*
 * POST /server/register
 * Endpoint to handle user registration. It validates the username and password, checks if the username
 * already exists, hashes the password, and then creates a new user in the database.
 */
app.post('/server/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!validateUsername(username)) {
      return res.status(400).json({ message: 'Username does not meet the requirements' });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({
        message: 'Password does not meet the requirements. It must be between 8-20 characters long, contain at least one number, one uppercase letter, one lowercase letter, and one special character.'
      });
    }

    await connectMongoDB();

    const userExists = await Users.findOne({ username });
    if (userExists) {
      return res.status(409).json({ message: 'Username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await Users.create({ username, password: hashedPassword });
    return res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

/*
 * POST /server/login
 * Endpoint to handle user login. It verifies the username and password, and if valid, generates a JWT token,
 * sets cookies for the token and username, and returns a success message.
 */
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

    // Set cookies for token and username
    res.cookie('token', token, { httpOnly: true, secure: false, sameSite: 'Lax' });
    res.cookie('username', user.username, { secure: false, sameSite: 'Lax' });

    console.log(`Cookies set for user ${user.username}: token=${token}, username=${user.username}`);

    return res.status(200).json({ message: 'Login successful' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message });
  }
});

/*
 * POST /server/addfriend
 * Endpoint to add a friend. It checks if both users exist, if they aren't the same user, and if a friendship
 * already exists. If all conditions are met, it creates a new friendship entry in the database.
 */
app.post('/server/addfriend', async (req, res) => {
  const { username, friendUsername } = req.body;

  if (!username || !friendUsername) {
    return res.status(400).json({ message: 'Both usernames are required' });
  }
  if (username === friendUsername) {
    return res.status(469).json({ message: 'You can\'t add yourself as a friend' });
  }
  try {
    await connectMongoDB();

    const user = await Users.findOne({ username });
    const friend = await Users.findOne({ username: friendUsername });

    if (!user || !friend) {
      return res.status(404).json({ message: 'One or both users do not exist' });
    }

    // Check if friendship already exists
    const friendshipExists = user.friendships.some(f =>
      f.friendshipURL === friendUsername || f.friendsName === friendUsername
    );
    if (friendshipExists) {
      return res.status(409).json({ message: 'Friendship already exists' });
    }

    const chatUrl = uuidv4()

    user.friendships.push({
      friendshipURL: chatUrl,
      friendsName: friendUsername
    });
    await user.save();

    friend.friendships.push({
      friendshipURL: chatUrl,
      friendsName: username
    });
    await friend.save();
    return res.status(201).json({ message: 'Friend added successfully' });
  } catch (error) {
    console.error('Error adding friend:', error);
    return res.status(500).json({ message: 'An error occurred while adding the friend' });
  }
});

/*
 * GET /server/friendships
 * Endpoint to retrieve all friendships for a given username. It fetches all records from the database
 * where the user is either user1 or user2 in the friendship.
 */
app.get('/server/friendships', async (req, res) => {
  const { username } = req.query;

  if (!username) {
    return res.status(400).json({ message: 'Username is required' });
  }

  console.log('Received username:', username);

  try {
    await connectMongoDB();
    console.log('Connected to MongoDB');

    // Find the user by username
    const user = await Users.findOne({ username }).select('friendships');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Extract the friendships array
    const friendships = user.friendships;

    return res.status(200).json(friendships);
  } catch (error) {
    console.error('Error fetching friendships:', error);
    return res.status(500).json({ message: 'An error occurred while fetching the friendships' });
  }
});

// Start the server and listen on the specified port
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
