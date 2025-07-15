// src/VideoChat.js
import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
    Room,
    RoomEvent,
    createLocalVideoTrack,
    createLocalAudioTrack,
    Track,
} from 'livekit-client';

const VideoChat = ({ identity, roomName, role = 'viewer' }) => {
    const roomRef = useRef(null);
    const videoContainerRef = useRef(null);
    const [chat, setChat] = useState([]);
    const [message, setMessage] = useState('');
    const [connected, setConnected] = useState(false);

    const connectToRoom = useCallback(async () => {
        const tokenRes = await fetch(
            `http://localhost:8000/get-token?identity=${identity}&room=${roomName}&role=${role}`
        );
        const { token } = await tokenRes.json();

        const room = new Room({
            autoSubscribe: true,
            rtcConfig: {
                iceServers: [
                    { urls: ['stun:stun.l.google.com:19302'] }, // TURN optional
                ],
                iceTransportPolicy: 'all',
            },
        });

        roomRef.current = room;

        // Attach remote tracks
        room.on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
            console.log(`Track subscribed from ${participant.identity}`);
            if (track.kind === Track.Kind.Video) {
                const videoEl = document.createElement('video');
                videoEl.autoplay = true;
                videoEl.playsInline = true;
                videoEl.width = 300;
                track.attach(videoEl);
                videoContainerRef.current.appendChild(videoEl);
            }
            if (track.kind === Track.Kind.Audio) {
                track.attach(); // audio plays automatically
            }
        });

        room.on(RoomEvent.DataReceived, (payload, participant) => {
            try {
                const text = new TextDecoder().decode(payload);
                const parsed = JSON.parse(text);
                setChat(prev => [...prev, `${parsed.sender}: ${parsed.message}`]);
            } catch (e) {
                console.warn('Failed to parse incoming chat message:', e);
            }
        });

        room.on(RoomEvent.Disconnected, () => {
            console.warn('Disconnected from room');
            setConnected(false);
        });

        await room.connect('ws://localhost:7880', token);

        if (role === 'host') {
            const [videoTrack, audioTrack] = await Promise.all([
                createLocalVideoTrack(),
                createLocalAudioTrack(),
            ]);
            await room.localParticipant.publishTrack(videoTrack);
            await room.localParticipant.publishTrack(audioTrack);

            // Show host's own video
            const localVideoEl = document.createElement('video');
            localVideoEl.autoplay = true;
            localVideoEl.muted = true;
            localVideoEl.playsInline = true;
            localVideoEl.width = 300;
            videoTrack.attach(localVideoEl);
            videoContainerRef.current.appendChild(localVideoEl);
        }

        setConnected(true);
    }, [identity, roomName, role]);

    useEffect(() => {
        connectToRoom();
        return () => {
            roomRef.current?.disconnect();
        };
    }, [connectToRoom]);

    const sendMessage = () => {
        const room = roomRef.current;
        const lp = room?.localParticipant;
        if (!room || !lp || room.state !== 'connected' || !message.trim()) return;

        const payload = JSON.stringify({
            sender: identity,
            message: message.trim(),
        });
        const encoded = new TextEncoder().encode(payload);
        lp.publishData(encoded, { reliable: true });

        setChat(prev => [...prev, `Me: ${message.trim()}`]);
        setMessage('');
    };

    return (
        <div>
            <h2>Room: {roomName} | User: {identity} ({role})</h2>

            <div ref={videoContainerRef} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }} />

            <div style={{ border: '1px solid #ccc', padding: '8px', marginTop: '10px', minHeight: '100px' }}>
                {chat.map((msg, idx) => (
                    <div key={idx}>{msg}</div>
                ))}
            </div>

            <input
                type="text"
                placeholder="Type a message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={!connected}
                style={{ marginTop: '10px' }}
            />
            <button onClick={sendMessage} disabled={!connected}>Send</button>
        </div>
    );
};

export default VideoChat;
