import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';

const turnConfig = {
  iceServers: [
    { urls: ["stun:fr-turn1.xirsys.com"] },
    {
      username: "YOUR_USERNAME",
      credential: "YOUR_CREDENTIAL",
      urls: [
        "turn:fr-turn1.xirsys.com:80?transport=udp",
        "turn:fr-turn1.xirsys.com:3478?transport=udp",
        "turn:fr-turn1.xirsys.com:80?transport=tcp",
        "turn:fr-turn1.xirsys.com:3478?transport=tcp",
        "turns:fr-turn1.xirsys.com:443?transport=tcp",
        "turns:fr-turn1.xirsys.com:5349?transport=tcp",
      ],
    },
  ],
};

const Chat = () => {
  const [socket, setSocket] = useState(null);
  const [isChannelReady, setIsChannelReady] = useState(false);
  const [isInitiator, setIsInitiator] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [pc, setPc] = useState(null);
  const [dataChannel, setDataChannel] = useState(null);
  const [clientName] = useState(`user${Math.floor(Math.random() * 1000 + 1)}`);
  const [remoteClient, setRemoteClient] = useState('');

  useEffect(() => {
    const socket = io.connect('http://localhost:4000', {
      transports: ['websocket'], // Ensure that websocket is used
    });
    setSocket(socket);

    socket.on('connect', () => {
      console.log('connected!');
    });

    socket.on('created', (room) => {
      setIsInitiator(true);
      console.log(`Created room ${room}`);
    });

    socket.on('full', (room) => {
      console.log(`Room ${room} is full`);
    });

    socket.on('join', (room, client) => {
      console.log(`Another peer made a request to join room ${room} with name: ${client}`);
      console.log(`This peer is the initiator of room ${room}!`);
      setIsChannelReady(true);
      setRemoteClient(client);
      document.getElementById("remotename").innerHTML = `Connected to: ${client}`;
      socket.emit('creatorname', room, clientName);
    });

    socket.on('mynameis', (client) => {
      console.log(`The creator's name is ${client}`);
      setRemoteClient(client);
      document.getElementById("remotename").innerHTML = `Connected to: ${client}`;
    });

    socket.on('joined', (room) => {
      console.log(`joined: ${room}`);
      setIsChannelReady(true);
    });

    socket.on('message', (message, room) => {
      console.log('Client received message:', message, room);
      if (message === 'gotuser') {
        maybeStart();
      } else if (message.type === 'offer') {
        if (!isInitiator && !isStarted) {
          maybeStart();
        }
        pc.setRemoteDescription(new RTCSessionDescription(message));
        doAnswer();
      } else if (message.type === 'answer' && isStarted) {
        pc.setRemoteDescription(new RTCSessionDescription(message));
      } else if (message.type === 'candidate' && isStarted) {
        var candidate = new RTCIceCandidate({
          sdpMLineIndex: message.label,
          candidate: message.candidate,
        });
        pc.addIceCandidate(candidate);
      } else if (message === 'bye' && isStarted) {
        handleRemoteHangup();
      }
    });

    document.getElementById("yourname").innerHTML = `You: ${clientName}`;

    return () => {
      socket.disconnect();
    };
  }, [pc]);

  const sendMessage = (message) => {
    console.log("Client sending message: ", message, 'test');
    socket.emit('message', message, 'test');
  };

  const maybeStart = () => {
    console.log(">>>>>>> maybeStart() ", isStarted, isChannelReady);
    if (!isStarted && isChannelReady) {
      console.log(">>>>>> creating peer connection");
      createPeerConnection();
      setIsStarted(true);
      console.log("isInitiator", isInitiator);
      if (isInitiator) {
        doCall();
      }
    }
  };

  const createPeerConnection = () => {
    try {
      const pc = new RTCPeerConnection(turnConfig);
      pc.onicecandidate = handleIceCandidate;
      console.log("Created RTCPeerConnnection");

      if (isInitiator) {
        const dataChannel = pc.createDataChannel("filetransfer");
        dataChannel.onopen = () => {
          console.log("Data channel opened");
        };
        dataChannel.onmessage = (event) => {
          console.log("Received message: " + event.data);
          viewMsgToElement(document.getElementById("messagesent"), event.data);
        };
        setDataChannel(dataChannel);
      } else {
        pc.ondatachannel = (event) => {
          const channel = event.channel;
          channel.onopen = () => {
            console.log("Data channel opened");
          };
          channel.onmessage = (event) => {
            console.log("Received message: " + event.data);
            viewMsgToElement(document.getElementById("messagesent"), event.data);
          };
          setDataChannel(channel);
        };
      }

      setPc(pc);
    } catch (e) {
      console.log("Failed to create PeerConnection, exception: " + e.message);
      alert("Cannot create RTCPeerConnection object.");
      return;
    }
  };

  const handleIceCandidate = (event) => {
    console.log("icecandidate event: ", event);
    if (event.candidate) {
      sendMessage({
        type: "candidate",
        label: event.candidate.sdpMLineIndex,
        id: event.candidate.sdpMid,
        candidate: event.candidate.candidate,
      });
    } else {
      console.log("End of candidates.");
    }
  };

  const handleCreateOfferError = (event) => {
    console.log("createOffer() error: ", event);
  };

  const doCall = () => {
    console.log("Sending offer to peer");
    pc.createOffer().then(setLocalAndSendMessage, handleCreateOfferError);
  };

  const doAnswer = () => {
    console.log("Sending answer to peer.");
    pc.createAnswer().then(
      setLocalAndSendMessage,
      onCreateSessionDescriptionError
    );
  };

  const setLocalAndSendMessage = (sessionDescription) => {
    pc.setLocalDescription(sessionDescription);
    console.log("setLocalAndSendMessage sending message", sessionDescription);
    sendMessage(sessionDescription);
  };

  const onCreateSessionDescriptionError = (error) => {
    console.log("Failed to create session description: " + error.toString());
  };

  const handleRemoteHangup = () => {
    console.log("Session terminated.");
    stop();
    setIsInitiator(false);
  };

  const stop = () => {
    setIsStarted(false);
    if (pc) {
      pc.close();
      setPc(null);
    }
  };

  const connectToRoom = () => {
    socket.emit('create or join', 'test', clientName);
    sendMessage('gotuser');
  };

  const handleSendMessage = () => {
    const messageArea = document.getElementById("messagearea");
    const message = `${clientName}: ${messageArea.value}`;
    if (dataChannel && dataChannel.readyState === "open") {
      dataChannel.send(message);
      viewMsgToElement(document.getElementById("messagesent"), `<p>${message}</p>`);
    }
    messageArea.value = '';
  };

  const viewMsgToElement = (element, message) => {
    element.innerHTML += "\n" + message;
  };

  return (
    <div>
      <h1>Send messages peer to peer</h1>
      <p id="yourname">You: {clientName}</p>
      <p id="remotename">{remoteClient ? `Connected to: ${remoteClient}` : ''}</p>
      <button id="connectbutton" onClick={connectToRoom}>
        Connect with peer
      </button>
      <textarea id="messagearea" name="message" rows="5" cols="50"></textarea>
      <button id="sendmessage" onClick={handleSendMessage}>Send message</button>
      <div id="messagesent"></div>
    </div>
  );
};

export default Chat;
