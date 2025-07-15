import React, { useState } from 'react';
import VideoChat from './VideoChat';

function App() {
  const [identity, setIdentity] = useState('');
  const [room, setRoom] = useState('');
  const [role, setRole] = useState('viewer');
  const [joined, setJoined] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (identity && room) setJoined(true);
  };

  return (
    <div style={{ padding: 20 }}>
      {!joined ? (
        <form onSubmit={handleSubmit}>
          <h2>Join Room</h2>
          <input value={identity} onChange={e => setIdentity(e.target.value)} placeholder="Your Name" /><br /><br />
          <input value={room} onChange={e => setRoom(e.target.value)} placeholder="Room Name" /><br /><br />
          <select value={role} onChange={e => setRole(e.target.value)}>
            <option value="host">Host</option>
            <option value="viewer">Viewer</option>
          </select><br /><br />
          <button type="submit">Join</button>
        </form>
      ) : (
        <VideoChat identity={identity} roomName={room} role={role} />
      )}
    </div>
  );
}

export default App;
