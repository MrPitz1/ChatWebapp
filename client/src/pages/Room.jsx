import React, { useRef, useEffect, useState } from "react";
import { Container, Stack, Textarea, Button, Flex, Box, Text } from '@chakra-ui/react';
import io from "socket.io-client";

const Room = () => {
  const peerRef = useRef(); 
  const socketRef = useRef(); 
  const otherUser = useRef();
  const roomID = window.location.pathname.split('/')[2];
  const [text, setText] = useState(""); 
  const [messages, setMessages] = useState([]); 
  const sendChannel = useRef(); 

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
    });

    /* 
      Handle the event where another user is found
    */
    socketRef.current.on('other user', (userID) => {
      callUser(userID);
    });

    /* 
      Handle the event where a new user joins the room
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
      Handle an incoming offer, create an answer, and send it back
    */
    peerRef.current = createPeer();
    peerRef.current.ondatachannel = (event) => {
      sendChannel.current = event.channel;
      sendChannel.current.onmessage = handleReceiveMessage;
    };
    const desc = new RTCSessionDescription(incoming.sdp);
    peerRef.current.setRemoteDescription(desc).then(() => {
      return peerRef.current.createAnswer();
    }).then(answer => {
      return peerRef.current.setLocalDescription(answer);
    }).then(() => {
      const payload = {
        target: incoming.caller,
        caller: socketRef.current.id,
        sdp: peerRef.current.localDescription
      };
      socketRef.current.emit('answer', payload);
    }).catch(e => console.log('Offer handling error:', e));
  }

  function handleAnswer(message) {
    /* 
      Handle an incoming answer from another peer
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
        <Box></Box> {/* Leerer Platzhalter */}
        <Text fontWeight="bold">RoomID: {window.location.pathname.split('/')[2]}</Text>
      </Flex>
      <Stack spacing={4} mb={4} maxH="400px" overflowY="scroll">
        {messages.map(renderMessage)}
      </Stack>
      <Textarea value={text} onChange={handleChange} placeholder="Say something....." mb={4} />
      <Button onClick={sendMessage} colorScheme="teal">Send</Button>
    </Container>
  );
};

export default Room;