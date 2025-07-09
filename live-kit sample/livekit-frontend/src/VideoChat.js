import React, { useEffect, useState } from 'react';
import { Room, RoomEvent } from 'livekit-client';

function VideoChat({ identity, roomName }) {
    const [room, setRoom] = useState(null);
    const [message, setMessage] = useState('');
    const [chat, setChat] = useState([]);

    useEffect(() => {
        let currentRoom = null;

        const connectToLiveKit = async () => {
            console.log("🔄 Connecting to LiveKit...");
            try {
                const res = await fetch(`${process.env.REACT_APP_API_URL}/get-token?identity=${identity}&room=${roomName}`);
                const data = await res.json();

                const newRoom = new Room();
                currentRoom = newRoom;
                setRoom(newRoom);

                await newRoom.connect(process.env.REACT_APP_LIVEKIT_URL, data.token);
                console.log("✅ Connected to LiveKit");

                try {
                    await newRoom.localParticipant.enableCameraAndMicrophone();
                    console.log("✅ Camera and mic enabled");
                } catch (err) {
                    console.error("❌ Camera/Mic error:", err);
                    alert("Please allow camera and microphone access.");
                    return;
                }

                // Show local video
                if (newRoom.localParticipant.videoTracks) {
                    newRoom.localParticipant.videoTracks.forEach((publication) => {
                        if (publication.track) {
                            const el = publication.track.attach();
                            el.style.border = '2px solid green';
                            document.getElementById('video-area')?.appendChild(el);
                        }
                    });
                }

                // Show remote video
                newRoom.on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
                    if (track.kind === 'video') {
                        const el = track.attach();
                        el.style.border = '2px solid blue';
                        document.getElementById('video-area')?.appendChild(el);
                    }
                });

                // Handle incoming messages
                newRoom.on(RoomEvent.DataReceived, (payload, participant) => {
                    const msg = new TextDecoder().decode(payload);
                    setChat(prev => [...prev, `${participant.identity}: ${msg}`]);
                });

                // Handle disconnects
                newRoom.on(RoomEvent.Disconnected, () => {
                    console.warn("🔌 Disconnected from room");
                });

            } catch (err) {
                console.error("❌ Error connecting to LiveKit:", err);
            }
        };

        connectToLiveKit();

        return () => {
            if (currentRoom) {
                console.log("🧹 Disconnecting room");
                currentRoom.disconnect();
            }
        };
    }, [identity, roomName]);

    useEffect(() => {
        const div = document.getElementById('chat-box');
        if (div) div.scrollTop = div.scrollHeight;
    }, [chat]);

    const sendMessage = async () => {
        if (!room || !message.trim()) return;

        try {
            if (room.state !== 'connected') {
                console.warn('Room not connected');
                return;
            }

            const encoded = new TextEncoder().encode(message);
            await room.localParticipant.publishData(encoded, { reliable: true });
            setChat(prev => [...prev, `Me: ${message}`]);
            setMessage('');
        } catch (err) {
            console.error("Send failed:", err);
        }
    };

    return (
        <div>
            <h3>Room: {roomName} | You: {identity}</h3>

            <div id="video-area" style={{ marginBottom: 20, display: 'flex', gap: '10px' }}></div>

            <div
                id="chat-box"
                style={{
                    border: '1px solid #ccc',
                    padding: 10,
                    height: 150,
                    overflowY: 'auto',
                    marginBottom: 10,
                }}
            >
                {chat.map((msg, idx) => (
                    <p key={idx} style={{ margin: 0 }}>{msg}</p>
                ))}
            </div>

            <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message"
                style={{ width: '70%' }}
            />
            <button onClick={sendMessage} style={{ marginLeft: 10 }}>Send</button>
        </div>
    );
}

export default VideoChat;
