import React, { useState } from 'react';
import { Box, Button, Input, Stack, Heading } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

 /* 
    Function to create random string
 */
function generateRoomId(length) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomIndex);
  }
  return result;
}

const JoinRoom = () => {
  const [inputRoomId, setInputRoomId] = useState('');
  const [username, setUsername] = useState('');
  const navigate = useNavigate();

  /* 
    Creates room with random 6-figure roomID when triggered
  */
  const handleCreateRoom = () => {
    const roomId = generateRoomId(6);
    console.log(roomId);
    navigate(`/chat-room/${roomId}?username=${username}&isInitiator=true`);
  };
  /* 
    Joins room with entered roomID
  */
  const handleJoinRoom = () => {
    if (inputRoomId) {
      navigate(`/chat-room/${inputRoomId}?username=${username}&isInitiator=false`);
    } else {
      alert('Please enter a Room ID');
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
        <Heading as="h1" size="lg" textAlign="center">Room Management</Heading>
        <Button colorScheme="blue" onClick={handleCreateRoom}>Create Room</Button>
        <Input
          placeholder="Enter Room ID"
          value={inputRoomId}
          onChange={(e) => setInputRoomId(e.target.value)}
        />        
        <Input
          placeholder="Enter Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <Button colorScheme="green" onClick={handleJoinRoom}>Join Room</Button>
      </Stack>
    </Box>
  );
};

export default JoinRoom;
