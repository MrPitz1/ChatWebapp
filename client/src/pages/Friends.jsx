import React, { useState, useEffect } from 'react';
import { Box, Button, Input, Stack, Heading } from '@chakra-ui/react';
import Cookies from 'js-cookie';
import axios from 'axios';

const Friends = () => {
  const [username, setUsername] = useState(null);
  const [friendUsername, setFriendUsername] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const username = Cookies.get('username');
    if (username) {
      setUsername(username);
    }
  }, []);

  const handleAddFriend = async () => {
    try {
      const response = await axios.post(
        'http://localhost:4000/server/addfriend',
        { username, friendUsername }
      );
      if (response.status === 201) {
        console.log('Friend added successfully');
        setError('');
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
      </Stack>
    </Box>
  );
};

export default Friends;
