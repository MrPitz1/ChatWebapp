import React, { useState, useEffect, useRef } from 'react';
import { Box, Button, Container, Input, Stack, Text, VStack } from '@chakra-ui/react';
import io from 'socket.io-client';

const AllChat = () => {
  const room = window.location.pathname;
  const [messages, setMessages] = useState([]); 
  const [input, setInput] = useState('');
  const socket = useRef(null);

  const addMessage = (message, isOwnMessage = false, isItalic = false) => {
    /*
      Adds Messages to the Chat
    */
    setMessages(prevList => [...prevList, { text: message, isOwnMessage, isItalic }]);
  };

  useEffect(() => {
    // Create new WebSocket
    const newSocket = io('http://localhost:4000/all-chat', {
      transports: ['websocket'],
    });
    socket.current = newSocket;

    // Join Room
    newSocket.emit('join', room);

    // If users join display it in the chat
    newSocket.on('user-joined', () => {
      addMessage('User Joined', false, true);
    });

    // Receive Chat Message
    newSocket.on('chat-message', (message) => {
      addMessage(message);
    });

    return () => {
      /*
        If window is closed disconnect
      */
    newSocket.disconnect();
    };
}, [room]);

const sendMessage = () => {
    /*
      Send Message
    */
    const dataAndRoom = {
      message: input,
      room: room
    }
    if (input.trim() && socket.current) {
      socket.current.emit('chat-message', dataAndRoom);
      // Add Own Message
      addMessage(input, true);
      setInput('');
    }
  };

  return (
    <Container maxW="container.md" p={4}>
      <VStack spacing={4} align="stretch" borderWidth={1} borderRadius="md" p={4}>
        <Box borderWidth={1} borderRadius="md" p={4} overflowY="auto" height="400px">
          <Stack spacing={2}>
            {messages.map((msg, index) => (
              <Box
                key={index}
                p={3}
                borderWidth={1}
                borderRadius="md"
                bg={msg.isOwnMessage ? 'teal.100' : 'gray.100'} // Verwende unterschiedliche Hintergrundfarben
                shadow="sm"
              >
                <Text as={msg.isItalic ? 'i' : 'span'}>{msg.text}</Text>
              </Box>
            ))}
          </Stack>
        </Box>
        <Box>
          <Stack direction={['column', 'row']} spacing={4}>
            <Input
              placeholder="Type a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              size="lg"
              flex="1"
            />
            <Button
              colorScheme="teal"
              onClick={sendMessage}
              size="lg"
              flex="none"
            >
              Send
            </Button>
          </Stack>
        </Box>
      </VStack>
    </Container>
  );
};

export default AllChat;
