import React, { useState } from 'react';
import { Box, Button, Input, Stack, Heading, FormControl, FormLabel, FormErrorMessage, Text } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async () => {
    try {
      const response = await axios.post('/server/register', { username, password });
      if (response.status === 201) {
        const response = await axios.post(
          '/server/login',
          { username, password },
          { withCredentials: true } // This is crucial for including cookies in the request
        );
        if (response.status === 200) {
          // Handle successful login
          console.log('Login successful');
          window.location.href = '/'; 
        }      }
    } catch (error) {
      console.log('Error response:', error.response);
      if (error.response && error.response.data && error.response.data.message) {
        setError(error.response.data.message); 
      } else {
        setError('Registration failed. Please try again.');
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
        <Heading as="h1" size="lg" textAlign="center">Registration</Heading>

        {/* Username Input */}
        <FormControl id="username" isInvalid={!!error}>
          <FormLabel>Username</FormLabel>
          <Input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </FormControl>

        {/* Password Input */}
        <FormControl id="password" isInvalid={!!error}>
          <FormLabel>Password</FormLabel>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </FormControl>

        {/* Display Error Message */}
        {error && (
          <Text color="red.500" fontSize="sm" mt={2}>
            {error}
          </Text>
        )}

        <Button colorScheme="blue" onClick={handleRegister}>Register</Button>
      </Stack>
    </Box>
  );
};

export default Register;
