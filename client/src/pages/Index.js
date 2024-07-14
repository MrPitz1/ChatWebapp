import React from 'react';
import { Box, Center } from '@chakra-ui/react';

function Index() {
    return (
        <Box
          h="100vh"
          bg="black"
          pos="relative"
          overflow="hidden"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
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
          <Center
            pos="absolute"
            top="50%"
            left="50%"
            transform="translate(-50%, -50%)"
            color="white"
            textAlign="center"
          >
            <Box>
              <h1>Hero Section</h1>
              <p>Your hero section content goes here.</p>
            </Box>
          </Center>
        </Box>
      );
}

export default Index;
