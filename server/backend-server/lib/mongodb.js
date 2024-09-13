/**
 * Mongo helper functions
 */

const mongoose = require('mongoose');

const connectMongoDB = async () => {
  /**
   * Connects to MongoDB
   */
  if (mongoose.connections[0].readyState) {
    return;
  }
  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
};

module.exports = connectMongoDB;
