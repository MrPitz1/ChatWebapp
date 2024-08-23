import React from 'react';
import { Box, Center, Heading, Text, VStack } from '@chakra-ui/react';

function Index() {
  return (
    <Box
      h="100vh"
      pos="relative"
      overflow="hidden"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg="black" // Background color to fallback in case video doesn't load
    >
      {/* Video Background */}
      <video
            autoPlay
            loop
            muted
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          >
            <source src="/blackhole.webm" type="video/webm" />
            Your browser does not support the video tag.
          </video>

      {/* Centered Text Container */}
      <Center
        pos="relative"
        color="white"
        textAlign="center"
        p={8} // Padding around the text
      >
        <VStack spacing={4} align="center">
          <Heading
            as="h1"
            fontSize={{ base: '3xl', md: '4xl', lg: '5xl' }}
            fontWeight="bold"
            textShadow="2px 2px 4px rgba(0, 0, 0, 0.5)"
          >
            P2P Chat
          </Heading>
          <Text
            fontSize={{ base: 'lg', md: 'xl', lg: '2xl' }}
            fontWeight="semibold"
            maxW="md"
            lineHeight="tall"
            textShadow="1px 1px 2px rgba(0, 0, 0, 0.3)" 
          >
            Chat with your friends now!
          </Text>
        </VStack>
      </Center>
    </Box>
  );
}

export default Index;
