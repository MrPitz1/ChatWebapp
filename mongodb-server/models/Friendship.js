const mongoose = require('mongoose');

const friendshipSchema = new mongoose.Schema({
  friendshipId: { type: String, unique: true, required: true },
  user1: { type: String, required: true },
  user2: { type: String, required: true },
});

const Friendship = mongoose.model('Friendship', friendshipSchema);

module.exports = Friendship;
