import React, { useEffect, useState } from 'react';
import { Box, Button, Stack, Heading, Text } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

const Profile = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [isAuthChecked, setIsAuthChecked] = useState(false);

  useEffect(() => {
    const username = Cookies.get('username');
    const token = Cookies.get('token');
    if (username) {
      setUsername(username);
      setIsAuthChecked(true);
    }
  }, [navigate]);

  const handleLogout = () => {
    Cookies.remove('username');
    Cookies.remove('token');
    window.location.href = '/login'; 
  };

  if (!isAuthChecked) {
    return null;
  }

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
        <Heading as="h1" size="lg" textAlign="center">Profile</Heading>
        {username && (
          <Text fontSize="xl" textAlign="center">
            Logged in as: {username}
          </Text>
        )}
        <Button colorScheme="red" onClick={handleLogout} alignSelf="center">
          Logout
        </Button>
      </Stack>
    </Box>
  );
};

export default Profile;
