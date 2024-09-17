/**
 * Helper functions for redis
 */

async function addSocketToRoom(room, socketId, redisClient) {
    /**
     * Helper function to add a socket ID to a Redis set for a room.
     */
    await redisClient.sadd(room, socketId);
}

async function removeSocketFromRoom(room, socketId, redisClient) {
    /**
     * Helper function to remove a socket ID from a Redis set for a room.
     */
    await redisClient.srem(room, socketId);
}

async function getSocketIDsInRoom(roomID, redisClient) {
    /**
     * Retrieve all socket IDs from a Redis set for a specific room.
     */
    return await redisClient.smembers(`room:${roomID}`);
}

module.exports = {
    addSocketToRoom,
    removeSocketFromRoom,
    getSocketIDsInRoom
};
