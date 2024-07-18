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
      transports: ['websocket'],
    });
    setSocket(socket);

    socket.on('connect', () => {
      console.log('connected!');
    });

    socket.on('created', (room) => {
      setIsInitiator(true);
      console.log(`Created room ${room}`);
      document.getElementById("remotename").innerHTML = `Waiting for a peer to join...`;
      socket.emit('creatorname', room, clientName); // Send the creator's name
    });

    socket.on('full', (room) => {
      console.log(`Room ${room} is full`);
    });

    socket.on('notfound', (room) => {
      console.log(`Room ${room} not found`);
    });

    socket.on('join', (room, client) => {
      console.log(`Another peer made a request to join room ${room} with name: ${client}`);
      setIsChannelReady(true);
      if (isInitiator) {
        document.getElementById("remotename").innerHTML = `Connected to: ${client}`;
        setRemoteClient(client);
      }
    });

    socket.on('mynameis', (client) => {
      console.log(`The creator's name is ${client}`);
      setRemoteClient(client);
      document.getElementById("remotename").innerHTML = `Connected to: ${client}`;
    });

    socket.on('joined', (room) => {
      console.log(`joined: ${room}`);
      setIsChannelReady(true);
      maybeStart();
    });

    socket.on('message', (message, room) => {
      console.log('Client received message:', message, room);
      if (message === 'gotuser') {
        setIsChannelReady(true);
        maybeStart();
      } else if (message.type === 'offer') {
        if (!isInitiator && !isStarted) {
          maybeStart();
        }
        if (pc) {
          pc.setRemoteDescription(new RTCSessionDescription(message));
          doAnswer();
        }
      } else if (message.type === 'answer' && isStarted) {
        if (pc) {
          pc.setRemoteDescription(new RTCSessionDescription(message));
        }
      } else if (message.type === 'candidate' && isStarted) {
        if (pc) {
          var candidate = new RTCIceCandidate({
            sdpMLineIndex: message.label,
            candidate: message.candidate,
          });
          pc.addIceCandidate(candidate);
        }
      } else if (message === 'bye' && isStarted) {
        handleRemoteHangup();
      }
    });

    document.getElementById("yourname").innerHTML = `You: ${clientName}`;

    return () => {
      socket.disconnect();
    };
  }, [pc]);

  useEffect(() => {
    if (isChannelReady) {
      maybeStart();
    }
  }, [isChannelReady]);

  const sendMessage = (message) => {
    console.log("Client sending message: ", message);
    socket.emit('message', message, 'test');
  };

  const maybeStart = () => {
    console.log(">>>>>>> maybeStart() ", isStarted, isChannelReady);
    if (!isStarted && isChannelReady) {
      console.log(">>>>>> creating peer connection");
      createPeerConnection();
    }
  };

  const createPeerConnection = () => {
    try {
      const newPc = new RTCPeerConnection(turnConfig); // Create a new RTCPeerConnection
      newPc.onicecandidate = handleIceCandidate;
      console.log("Created RTCPeerConnection");

      if (isInitiator) {
        const dataChannel = newPc.createDataChannel("filetransfer");
        dataChannel.onopen = () => {
          console.log("Data channel opened");
          setDataChannel(dataChannel);
        };
        dataChannel.onmessage = (event) => {
          console.log("Received message: " + event.data);
          viewMsgToElement(document.getElementById("messagesent"), event.data);
        };
        console.log("Initiator data channel set");
      } else {
        newPc.ondatachannel = (event) => {
          const channel = event.channel;
          channel.onopen = () => {
            console.log("Data channel opened");
            setDataChannel(channel);
          };
          channel.onmessage = (event) => {
            console.log("Received message: " + event.data);
            viewMsgToElement(document.getElementById("messagesent"), event.data);
          };
          console.log("Non-initiator data channel set");
        };
      }

      setPc(newPc);
      setIsStarted(true); // Set isStarted after setting pc
      if (isInitiator) {
        doCall(newPc); // Pass newPc to doCall
      }
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

  const doCall = (peerConnection) => {
    console.log("Sending offer to peer");
    if (peerConnection) {
      peerConnection.createOffer().then(setLocalAndSendMessage, handleCreateOfferError);
    } else {
      console.log("PeerConnection not created.");
    }
  };

  const doAnswer = () => {
    console.log("Sending answer to peer.");
    if (pc) {
      pc.createAnswer().then(
        setLocalAndSendMessage,
        onCreateSessionDescriptionError
      );
    } else {
      console.log("PeerConnection not created.");
    }
  };

  const setLocalAndSendMessage = (sessionDescription) => {
    if (pc) {
      pc.setLocalDescription(sessionDescription);
      console.log("setLocalAndSendMessage sending message", sessionDescription);
      sendMessage(sessionDescription);
    }
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

  const createRoom = () => {
    socket.emit('create', 'test', clientName);
  };

  const joinRoom = () => {
    socket.emit('join', 'test', clientName);
    sendMessage('gotuser');
  };

  const handleSendMessage = () => {
    const messageArea = document.getElementById("messagearea");
    const message = `${clientName}: ${messageArea.value}`;
    console.log(message, dataChannel);
    if (dataChannel && dataChannel.readyState === "open") {
      console.log("message wird gesendet");
      dataChannel.send(message);
      viewMsgToElement(document.getElementById("messagesent"), `<p>${message}</p>`);
    } else {
      console.log("Data channel is not open");
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
      <p id="remotename">{remoteClient ? `Connected to: ${remoteClient}` : 'Waiting for a peer to join...'}</p>
      <button id="createbutton" onClick={createRoom}>
        Create Room
      </button>
      <button id="joinbutton" onClick={joinRoom}>
        Join Room
      </button>
      <textarea id="messagearea" name="message" rows="5" cols="50"></textarea>
      <button id="sendmessage" onClick={handleSendMessage}>Send message</button>
      <div id="messagesent"></div>
    </div>
  );
};

export default Chat;
