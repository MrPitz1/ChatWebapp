import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';

const Room = () => {
  const room = window.location.pathname.split('/')[2];
  const socket = useRef(null);
  const [isCaller, setIsCaller] = useState(false);
  const peerConnection = useRef(null);
  const iceServers = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };

  useEffect(() => {
    const newSocket = io('http://localhost:4000/p2p', {
      transports: ['websocket'],
    });
    socket.current = newSocket;
    console.log('Socket connected:', newSocket.id);
    newSocket.emit('join', room);
    console.log(`Joined room: ${room}`);

    newSocket.on('you-are-caller', () => {
      console.log('Received you-are-caller event');
      setIsCaller(true);
    });

    newSocket.on('you-are-callee', () => {
      console.log('Received you-are-callee event');
      console.log('I am the callee');
    });

    newSocket.on('offer', async (sdp) => {
      console.log('Received offer:', sdp);
      if (!isCaller) {
        console.log('I am not the caller, handling offer');
        peerConnection.current = new RTCPeerConnection(iceServers);
        peerConnection.current.onicecandidate = (event) => {
          if (event.candidate) {
            console.log('Sending ICE candidate:', event.candidate);
            newSocket.emit('candidate', { room, candidate: event.candidate });
          }
        };

        await peerConnection.current.setRemoteDescription(new RTCSessionDescription(sdp));
        const answer = await peerConnection.current.createAnswer();
        await peerConnection.current.setLocalDescription(answer);
        console.log('Sending answer:', answer);
        newSocket.emit('answer', { room, sdp: answer });
      }
    });

    newSocket.on('answer', async (sdp) => {
      console.log('Received answer:', sdp);
      if (isCaller) {
        await peerConnection.current.setRemoteDescription(new RTCSessionDescription(sdp));
        console.log('Set remote description with answer');
      }
    });

    newSocket.on('candidate', async (candidate) => {
      console.log('Received candidate:', candidate);
      if (peerConnection.current) {
        await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
        console.log('Added ICE candidate');
      }
    });

    return () => {
      console.log('Disconnecting socket:', newSocket.id);
      newSocket.disconnect();
    };
  }, [room]);

  useEffect(() => {
    if (isCaller && socket.current) {
      console.log('I am the caller, creating offer');
      socket.current.emit('you-are-callee', room);
      createOffer();
    }

    return () => {
      if (socket.current) {
        console.log('Removing you-are-callee listener');
        socket.current.off('you-are-callee');
      }
    };
  }, [isCaller]);

  const createOffer = async () => {
    console.log('Creating offer');
    peerConnection.current = new RTCPeerConnection(iceServers);
    peerConnection.current.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('Sending ICE candidate:', event.candidate);
        socket.current.emit('candidate', { room, candidate: event.candidate });
      }
    };

    const offer = await peerConnection.current.createOffer();
    await peerConnection.current.setLocalDescription(offer);
    console.log('Sending offer:', offer);
    socket.current.emit('offer', { room, sdp: offer });
  };

  return (
    <div>
      Room: {room}
    </div>
  );
};

export default Room;
