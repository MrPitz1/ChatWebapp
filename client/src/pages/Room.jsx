import React, { useRef, useEffect, useState } from "react";
import { Container, Stack, Textarea, Button, Flex, Box, Text, Spinner, VStack } from '@chakra-ui/react';
import io from "socket.io-client";

const Room = () => {
  const peerRef = useRef();
  const socketRef = useRef();
  const otherUser = useRef();
  const roomID = window.location.pathname.split('/')[2];
  const [text, setText] = useState("");
  const [messages, setMessages] = useState([]);
  const sendChannel = useRef();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    /* 
      Connect to the Socket.IO server and join the specified room
    */
    socketRef.current = io.connect("/socket/p2p", { transports: ['websocket'] });

    socketRef.current.on('connect', () => {
      /* 
        Join the room upon successful connection
      */
      socketRef.current.emit('join room', roomID);
      setLoading(false);
    });

    /* 
      Handle the event when another user is found
    */
    socketRef.current.on('other user', (userID) => {
      callUser(userID);
    });

    /* 
      Handle the event when a new user joins the room
    */
    socketRef.current.on('user joined', (userID) => {
      otherUser.current = userID;
    });

    /* 
      Set up handlers for incoming offers, answers, and ICE candidates
    */
    socketRef.current.on('offer', handleOffer);
    socketRef.current.on('answer', handleAnswer);
    socketRef.current.on('ice-candidate', handleNewICECandidateMsg);

    return () => {
      /* 
        Disconnect from the Socket.IO server when the component unmounts
      */
      socketRef.current.disconnect();
    };
  }, [roomID]);

  function callUser(userID) {
    /* 
      Create a new peer connection and data channel for the specified user
    */
    peerRef.current = createPeer(userID);
    sendChannel.current = peerRef.current.createDataChannel("sendChannel");
    sendChannel.current.onmessage = handleReceiveMessage;
  }

  function handleReceiveMessage(e) {
    /* 
      Add the received message to the messages state
    */
    setMessages(messages => [...messages, { yours: false, value: e.data }]);
  }

  function createPeer(userID) {
    /* 
      Create and configure a new RTCPeerConnection instance
    */
    const peer = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" } // STUN server for public IP discovery
      ]
    });
    
    /* 
      Set event handlers for ICE candidates and negotiation needed
    */
    peer.onicecandidate = handleICECandidateEvent;
    peer.onnegotiationneeded = () => handleNegotiationNeededEvent(userID);

    return peer;
  }

  function handleNegotiationNeededEvent(userID) {
    /* 
      Create and send an offer to the specified user
    */
    peerRef.current.createOffer().then(offer => {
      return peerRef.current.setLocalDescription(offer);
    }).then(() => {
      const payload = {
        target: userID,
        caller: socketRef.current.id,
        sdp: peerRef.current.localDescription
      };
      socketRef.current.emit('offer', payload);
    }).catch(e => console.log('Negotiation error:', e));
  }

  function handleOffer(incoming) {
    /* 
      Handle an incoming offer, create an answer, and send it back.
      This function is explained in depth because it can be quite confusing
    */
      peerRef.current = createPeer();

      // When the remote peer creates a data channel, this event is triggered
      peerRef.current.ondatachannel = (event) => {
        sendChannel.current = event.channel; 
        // Set up a handler for receiving messages from the remote peer
        sendChannel.current.onmessage = handleReceiveMessage;
      };
      // Create an RTC session description from the incoming SDP offer 
      const desc = new RTCSessionDescription(incoming.sdp); 
      
      // Set the remote description for the peer connection with the received SDP offer
      peerRef.current.setRemoteDescription(desc)
        .then(() => {
          // After setting the remote description, create an SDP answer to respond to the offer
          return peerRef.current.createAnswer();
        })
        .then(answer => {
          // Set the local description for the peer connection with the created SDP answer
          return peerRef.current.setLocalDescription(answer);
        })
        .then(() => {
          // Once the local description is set, emit the 'answer' event to send the SDP answer back to the caller
          const payload = {
            target: incoming.caller, 
            caller: socketRef.current.id,
            sdp: peerRef.current.localDescription
          };
          socketRef.current.emit('answer', payload);
        })
        .catch(e => console.log('Offer handling error:', e));
  }

  function handleAnswer(message) {
    /* 
      Handle an incoming sdp answer from another peer
    */
    const desc = new RTCSessionDescription(message.sdp);
    peerRef.current.setRemoteDescription(desc).catch(e => console.log('Answer error:', e));
  }

  function handleICECandidateEvent(e) {
    if (e.candidate) {
      /* 
        Send the ICE candidate to the other user
      */
      const payload = {
        target: otherUser.current,
        candidate: e.candidate,
      };
      socketRef.current.emit('ice-candidate', payload);
    }
  }

  function handleNewICECandidateMsg(incoming) {
    /* 
      Add the received ICE candidate to the peer connection
    */
    const candidate = new RTCIceCandidate(incoming);
    peerRef.current.addIceCandidate(candidate)
      .catch(e => console.log('ICE candidate error:', e));
  }

  function handleChange(e) {
    /* 
      Update the input text state when the user types
    */
    setText(e.target.value);
  }

  function sendMessage() {
    /* 
      Send a message through the data channel if the text is not empty
    */
    if (text.trim()) {
      const newMessage = { value: text, yours: true };
      setMessages(prevMessages => [...prevMessages, newMessage]);
      sendChannel.current.send(text);
      setText("");
    }
  }

  function renderMessage(message, index) {
    /* 
      Render each message with appropriate background color
    */
    return (
      <Box key={index} p={2} bg={message.yours ? "blue.100" : "gray.100"} borderRadius="md" mb={2}>
        {message.value}
      </Box>
    );
  }

  return (
    <Container maxW="container.md" p={4}>
      <Flex justify="space-between" align="center" mb={4}>
        <Box></Box> {/* Placeholder */}
        <Text fontWeight="bold">RoomID: {window.location.pathname.split('/')[2]}</Text>
      </Flex>
      <Stack spacing={4} mb={4} maxH="400px" overflowY="scroll">
        {loading ? (
          <VStack justify="center" align="center" h="full">
            <Spinner size="lg" />
            <Text mt={4}>Connecting...</Text>
          </VStack>
        ) : (
          messages.map(renderMessage)
        )}
      </Stack>
      <Textarea value={text} onChange={handleChange} placeholder="Say something....." mb={4} />
      <Button onClick={sendMessage} colorScheme="teal">Send</Button>
    </Container>
  );
};

export default Room;
