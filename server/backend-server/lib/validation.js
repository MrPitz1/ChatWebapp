/**
 * Validation helper functions
 */

const Friendship = require('../models/Friendship');

const validatePassword = (password) => {
    /**
     * Function to validate password strength
     */
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

const validateUsername = (username) => {
    /**
     * Function to validate username format and length
     */
    const minLength = 3;
    const maxLength = 20;
    const isValid = /^[a-zA-Z0-9_]+$/.test(username);
    return (
        username.length >= minLength &&
        username.length <= maxLength &&
        isValid
    );
};

const friendshipExists = async (user1, user2) => {
    /**
     * Function to check if a friendship already exists
     */
    const existingFriendship = await Friendship.findOne({
        $or: [
        { user1, user2 },
        { user1: user2, user2: user1 }
        ]
    });
    return !!existingFriendship;
};

module.exports = {
    validatePassword,
    validateUsername,
    friendshipExists
};
