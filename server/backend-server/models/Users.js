const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  friendships: [{
    friendshipURL: { type: String },
    friendsName: { type: String }
  }]
});

const Users = mongoose.model('Users', userSchema);
module.exports = Users;
