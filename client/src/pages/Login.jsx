import React, { useState } from 'react';
import { Box, Button, Input, Stack, Heading, FormControl, FormLabel, FormErrorMessage, Text, Link } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = () => {
    // Hier kannst du die Login-Logik hinzufügen (z.B. API-Aufruf)
    if (username === 'admin' && password === 'password') {
      // Erfolgreiches Login, Weiterleitung zur nächsten Seite
      navigate('/dashboard'); // Beispielziel
    } else {
      // Fehler bei der Anmeldung
      setError('Ungültiger Benutzername oder Passwort');
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
        <Button colorScheme="blue" onClick={handleLogin}>Login</Button>
        <Text textAlign="center">
          You are not logged in yet? <Link color="teal.500" onClick={() => navigate('/register')}>Click here</Link>
        </Text>
      </Stack>
    </Box>
  );
};

export default Login;
