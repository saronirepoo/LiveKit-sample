import React, { useState } from 'react';
import VideoChat from './VideoChat';

function App() {
  const [identity, setIdentity] = useState('');
  const [roomName, setRoomName] = useState('');
  const [start, setStart] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (identity && roomName) setStart(true);
  };

  return (
    <div style={{ padding: 20 }}>
      {!start ? (
        <>
          <h2>Join LiveKit Room</h2>
          <form onSubmit={handleSubmit}>
            <input placeholder="Your name" value={identity} onChange={(e) => setIdentity(e.target.value)} /><br /><br />
            <input placeholder="Room name" value={roomName} onChange={(e) => setRoomName(e.target.value)} /><br /><br />
            <button type="submit">Join</button>
          </form>
        </>
      ) : (
        <VideoChat identity={identity} roomName={roomName} />
      )}
    </div>
  );
}

export default App;
