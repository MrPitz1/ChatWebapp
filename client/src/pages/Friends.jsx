import React, { useState, useEffect } from 'react';
import { Box, Button, Input, Stack, Heading, Text, Flex } from '@chakra-ui/react';
import Cookies from 'js-cookie';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Friends = () => {
  const [username, setUsername] = useState(null);
  const [friendUsername, setFriendUsername] = useState('');
  const [error, setError] = useState('');
  const [friendships, setFriendships] = useState([]);

  useEffect(() => {
    const username = Cookies.get('username');
    if (username) {
      setUsername(username);
      fetchFriendships(username);
    }
  }, []);

   const fetchFriendships = async (username) => {
   /**
   * Fetches the list of friendships for a given user.
   * Sends a GET request to the server with the username as a query parameter,
   * and updates the friendships state with the response data.
   * 
   * @param {string} username - The username for which to fetch friendships.
   */
    try {
      const response = await axios.get('/server/friendships', {
        params: { username }
      });
      setFriendships(response.data);
    } catch (error) {
      console.error('Error fetching friendships:', error);
    }
  };

  const handleAddFriend = async () => {
  /**
   * Handles adding a new friend by sending a POST request to the server
   * with the username and friendUsername in the request body. If the
   * request is successful, it fetches the updated friendships list. If the
   * friendship already exists, an error message is set.
   */
    try {
      const response = await axios.post(
        '/server/addfriend',
        { username, friendUsername }
      );
      if (response.status === 201) {
        console.log('Friend added successfully');
        setError('');
        fetchFriendships(username); // Fetch the updated list of friendships
      }
    } catch (error) {
      if (error.response && error.response.status === 409) {
        setError('Friendship already exists');
      } else {
        setError('Adding friend failed. Please try again.');
      }
    }
  };
  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      backgroundColor="gray.100"
      padding="4"
    >
      <Stack spacing={4} width="100%" maxWidth="400px" backgroundColor="white" padding="6" boxShadow="lg" borderRadius="md">
        <Heading as="h1" size="lg" textAlign="center">Friend Management</Heading>
        <Input
          placeholder="Enter friend's username"
          value={friendUsername}
          onChange={(e) => setFriendUsername(e.target.value)}
        />
        <Button colorScheme="blue" onClick={handleAddFriend}>Add Friend</Button>
        {error && <Box color="red.500">{error}</Box>}

        <Heading as="h2" size="md" textAlign="center" marginTop="4">Existing Friendships</Heading>
        <Box>
          {friendships.map((friendship, index) => (
            <Flex key={index} alignItems="center" justifyContent="space-between" marginY="2">
              <Text>{friendship.friendsName}</Text>
              {friendship.friendshipURL && (
                <Link to={`/chat-room/${friendship.friendshipURL}`}>
                  <Button colorScheme="teal" size="sm">Go to Chat</Button>
                </Link>
              )}
            </Flex>
          ))}
        </Box>
      </Stack>
    </Box>
  );
};

export default Friends;
