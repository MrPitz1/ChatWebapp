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
    try {
      const response = await axios.get('http://localhost:4000/server/friendships', {
        params: { username }
      });
      setFriendships(response.data);
    } catch (error) {
      console.error('Error fetching friendships:', error);
    }
  };

  const handleAddFriend = async () => {
    try {
      const response = await axios.post(
        'http://localhost:4000/server/addfriend',
        { username, friendUsername }
      );
      if (response.status === 201) {
        console.log('Friend added successfully');
        setError('');
        fetchFriendships(username);
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
          {friendships.map((friendship) => (
            <Flex key={friendship.friendshipId} alignItems="center" justifyContent="space-between" marginY="2">
              <Text>{friendship.user1} and {friendship.user2}</Text>
              <Link to={`/chat-room/${friendship.friendshipId}`}>
                <Button colorScheme="teal" size="sm">Go to Chat</Button>
              </Link>
            </Flex>
          ))}
        </Box>
      </Stack>
    </Box>
  );
};

export default Friends;
