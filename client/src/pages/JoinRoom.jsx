import React from 'react';
import { Box, Button, Input, Stack, Heading } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

const JoinRoom = () => {
  const navigate = useNavigate();

  const handleCreateRoom = () => {
    const roomId = uuidv4();
    navigate(`/chat-room/${roomId}`);
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
        <Heading as="h1" size="lg" textAlign="center">Room Management</Heading>
        <Button colorScheme="blue" onClick={handleCreateRoom}>Create Room</Button>
        <Input placeholder="Enter Room ID" />
        <Button colorScheme="green">Join Room</Button>
      </Stack>
    </Box>
  );
};

export default JoinRoom;
