import React, { useState } from 'react';
import { Box, Button, Input, Stack, Heading } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

const JoinRoom = () => {
  const [inputRoomId, setInputRoomId] = useState('');
  const navigate = useNavigate();

  const handleCreateRoom = () => {
    /*
      Join unique Room
    */
    const roomId = uuidv4();
    navigate(`/chat-room/${roomId}`);
  };

  const handleJoinRoom = () => {
     /* 
      Joins room with entered roomID
     */
    if (inputRoomId) {
      navigate(`/chat-room/${inputRoomId}`);
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
      <Stack spacing={4} width="100%" maxWidth="400px" backgroundColor="purple.600" padding="6" boxShadow="lg" borderRadius="md">
        <Heading as="h1" size="lg" color={"white"} textAlign="center">Room Management</Heading>
        <Button color="purple.600" border={"2px solid"} borderColor={"purple.200"} backgroundColor={"white"} onClick={handleCreateRoom}>Create Room</Button>
        <Input
          border={"2px solid"}
          borderColor = {"purple.200"}
          placeholder="Enter Room ID"
          placeholderColor="purple"
          background={'white'}
          value={inputRoomId}
          onChange={(e) => setInputRoomId(e.target.value)}
        />        <Button  color="purple.600" border={"2px solid"} borderColor={"purple.200"} backgroundColor={"white"} onClick={handleJoinRoom}>Join Room</Button>
      </Stack>
    </Box>
  );
};

export default JoinRoom;