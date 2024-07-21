import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  Container,
  Input,
  Stack,
  Text,
  VStack,
  useToast,
} from '@chakra-ui/react';

const AllChat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const ws = useRef(null);
  const toast = useToast();

  useEffect(() => {
    // Create WebSocket connection
    ws.current = new WebSocket('ws://localhost:4000/all-chat');

    ws.current.onopen = () => {
      console.log('WebSocket connection opened');
    };

    ws.current.onmessage = (event) => {
      if (event.data instanceof Blob) {
        // Convert Blob to text
        const reader = new FileReader();
        reader.onload = () => {
          const newMessage = reader.result;
          console.log(`Received message: ${newMessage}`);
          setMessages(prevMessages => [...prevMessages, newMessage]);
        };
        reader.readAsText(event.data);
      } else {
        // If the message is already text
        const newMessage = event.data;
        console.log(`Received message: ${newMessage}`);
        setMessages(prevMessages => [...prevMessages, newMessage]);
      }
    };

    ws.current.onerror = (error) => {
      console.error('WebSocket error:', error);
      toast({
        title: 'WebSocket Error',
        description: 'There was a problem with the WebSocket connection.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    };

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [toast]);

  const sendMessage = () => {
    if (input.trim()) {
      ws.current.send(input);
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
                bg="gray.100"
                shadow="sm"
              >
                <Text>{msg}</Text>
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
