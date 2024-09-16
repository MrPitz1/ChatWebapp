/**
 * Helper functions for redis
 */


/**
 * Helper function to add a socket ID to a Redis set for a room.
 * @param {string} room - The Redis key for the room.
 * @param {string} socketId - The socket ID to add.
 * @param {object} redisClient - The Redis client instance.
 */
async function addSocketToRoom(room, socketId, redisClient) {
    await redisClient.sadd(room, socketId);
}

/**
 * Helper function to remove a socket ID from a Redis set for a room.
 * @param {string} room - The Redis key for the room.
 * @param {string} socketId - The socket ID to remove.
 * @param {object} redisClient - The Redis client instance.
 */
async function removeSocketFromRoom(room, socketId, redisClient) {
    await redisClient.srem(room, socketId);
}
/**
 * Retrieve all socket IDs from a Redis set for a specific room.
 * @param {string} roomID - The room ID to get members for.
 * @param {object} redisClient - The Redis client instance.
 * @returns {Promise<Array<string>>} - A promise that resolves to an array of socket IDs.
 */

async function getSocketIDsInRoom(roomID, redisClient) {
    return await redisClient.smembers(`room:${roomID}`);
}

module.exports = {
    addSocketToRoom,
    removeSocketFromRoom,
    getSocketIDsInRoom
};
