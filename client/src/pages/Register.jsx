import React, { useState } from 'react';
import { Box, Button, Input, Stack, Heading, FormControl, FormLabel, FormErrorMessage } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async () => {
    try {
      const response = await axios.post('http://localhost:4000/register', { username, password });
      if (response.status === 201) {
        navigate('/login');
      }
    } catch (error) {
      setError('Registration failed. Please try again.');
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
        <Heading as="h1" size="lg" textAlign="center">Registrieren</Heading>
        <FormControl id="username" isInvalid={error}>
          <FormLabel>Benutzername</FormLabel>
          <Input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </FormControl>
        <FormControl id="password" isInvalid={error}>
          <FormLabel>Passwort</FormLabel>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </FormControl>
        {error && <FormErrorMessage>{error}</FormErrorMessage>}
        <Button colorScheme="blue" onClick={handleRegister}>Registrieren</Button>
      </Stack>
    </Box>
  );
};

export default Register;
