const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const connectMongoDB = require('./lib/mongodb');
const { validatePassword, validateUsername } = require('./lib/validation');
const Users = require('./models/Users');

const app = express();
const PORT = process.env.PORT;
const NGINX_PORT = process.env.NGINX_PORT;
const TOKEN_SECRET = process.env.TOKEN_SECRET || crypto.randomBytes(32).toString('hex');

// Middleware setup: CORS to handle cross-origin requests and express.json() to parse JSON payloads
app.use(cors({ origin: `http://localhost:${NGINX_PORT}`, credentials: true }));
app.use(express.json());

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
  /** 
   * Route to register a new user
   * Validates username and password, checks for existing users, hashes the password, and creates a new user
   */
  try {
    const { username, password } = req.body;

    // Validate username and password
    if (!validateUsername(username)) {
      return res.status(400).json({ message: 'Username does not meet the requirements' });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({
        message: 'Password does not meet the requirements. It must be between 8-20 characters long, contain at least one number, one uppercase letter, one lowercase letter, and one special character.'
      });
    }

    // Connect to MongoDB
    await connectMongoDB();

    // Check if the user already exists
    const userExists = await Users.findOne({ username });
    if (userExists) {
      return res.status(409).json({ message: 'Username already exists' });
    }

    // Hash the password and create a new user
    const hashedPassword = await bcrypt.hash(password, 12);
    await Users.create({ username, password: hashedPassword });
    return res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

/*
 * POST /server/login
 * Endpoint to handle user login. It verifies the username and password, and if valid, generates a JWT token,
 * sets cookies for the token and username, and returns a success message.
 */
app.post('/server/login', async (req, res) => {
  /** 
   * Route to login a user
   * Checks if the user exists, verifies the password, generates a JWT token, and sets cookies for the token and username
   */
  try {
    const { username, password } = req.body;

    // Connect to MongoDB
    await connectMongoDB();

    // Find the user by username
    const user = await Users.findOne({ username });

    // Check if the user exists
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Verify the password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token and set cookies
    const tokenData = {
      id: user._id,
      username: user.username,
    };
    const token = jwt.sign(tokenData, TOKEN_SECRET, { expiresIn: '1d' });

    // Set cookies for token and username
    res.cookie('token', token, { httpOnly: true, secure: false, sameSite: 'Lax' });
    res.cookie('username', user.username, { secure: false, sameSite: 'Lax' });

    return res.status(200).json({ message: 'Login successful' });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

/*
 * POST /server/addfriend
 * Endpoint to add a friend. It checks if both users exist, if they aren't the same user, and if a friendship
 * already exists. If all conditions are met, it creates a new friendship entry in the database.
 */
app.post('/server/addfriend', async (req, res) => {
  /** 
   * Route to add a friend
   * Validates request, checks if both users exist, checks if friendship already exists, and creates a new friendship
   */
  const { username, friendUsername } = req.body;

  if (!username || !friendUsername) {
    return res.status(400).json({ message: 'Both usernames are required' });
  }
  if (username === friendUsername) {
    return res.status(469).json({ message: 'You can\'t add yourself as a friend' });
  }
  try {
    // Connect to MongoDB
    await connectMongoDB();

    // Find the users by username
    const user = await Users.findOne({ username });
    const friend = await Users.findOne({ username: friendUsername });

    // Check if both users exist
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
    return res.status(500).json({ message: 'An error occurred while adding the friend' });
  }
});

/*
 * GET /server/friendships
 * Endpoint to retrieve all friendships for a given username. It fetches all records from the database
 * where the user is either user1 or user2 in the friendship.
 */
app.get('/server/friendships', async (req, res) => {
  /** 
   * Route to fetch friendships for a user
   * Retrieves and returns all friendships where the specified username is either user1 or user2
   */
  const { username } = req.query;

  if (!username) {
    return res.status(400).json({ message: 'Username is required' });
  }

  console.log('Received username:', username);

  try {
    // Connect to MongoDB
    await connectMongoDB();

    // Find the user by username
    const user = await Users.findOne({ username }).select('friendships');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Extract the friendships array
    const friendships = user.friendships;

    return res.status(200).json(friendships);
  } catch (error) {
    return res.status(500).json({ message: 'An error occurred while fetching the friendships' });
  }
});

// Start the server and listen on the specified port
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
