import React, { useState } from 'react';
import { Box, Button, Input, Stack, Heading, FormControl, FormLabel, FormErrorMessage, Text, Link } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const response = await axios.post(
        '/server/login',
        { username, password },
        { withCredentials: true } // This is crucial for including cookies in the request
      );
      if (response.status === 200) {
        // Handle successful login
        console.log('Login successful');
        window.location.href = '/'; 
      }
    } catch (error) {
      setError('Login failed. Please try again.');
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
        <Heading as="h1" size="lg" textAlign="center">Login</Heading>
        <FormControl id="username" isInvalid={error}>
          <FormLabel>Username</FormLabel>
          <Input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </FormControl>
        <FormControl id="password" isInvalid={error}>
          <FormLabel>Password</FormLabel>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </FormControl>
        {error && <FormErrorMessage>{error}</FormErrorMessage>}
        <Button colorScheme="blue" onClick={handleLogin}>Login</Button>
        <Text textAlign="center">
          You are not logged in yet? <Link color="teal.500" onClick={() => navigate('/register')}>Click here</Link>
        </Text>
      </Stack>
    </Box>
  );
};

export default Login;
