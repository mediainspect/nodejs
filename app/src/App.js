import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [mediaItems, setMediaItems] = useState([]);
  const [title, setTitle] = useState('');
  const [type, setType] = useState('video');
  const [url, setUrl] = useState('');
  const [token, setToken] = useState('');

  useEffect(() => {
    if (token) {
      fetchMediaItems();
    }
  }, [token]);

  const fetchMediaItems = async () => {
    try {
      const response = await axios.get('http://localhost:3000/media', {
        headers: { 'x-access-token': token }
      });
      setMediaItems(response.data.results);
    } catch (error) {
      console.error('Error fetching media items:', error);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3000/login', {
        username: 'testuser',
        password: 'testpassword'
      });
      setToken(response.data.token);
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3000/media', 
        { title, type, url },
        { headers: { 'x-access-token': token } }
      );
      setTitle('');
      setType('video');
      setUrl('');
      fetchMediaItems();
    } catch (error) {
      console.error('Error creating media item:', error);
    }
  };

  return (
    <div className="App">
      <h1>Media Server Frontend</h1>
      {!token ? (
        <button onClick={handleLogin}>Login</button>
      ) : (
        <>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title"
              required
            />
            <select value={type} onChange={(e) => setType(e.target.value)}>
              <option value="video">Video</option>
              <option value="audio">Audio</option>
            </select>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="URL"
              required
            />
            <button type="submit">Add Media Item</button>
          </form>
          <h2>Media Items:</h2>
          <ul>
            {mediaItems.map((item, index) => (
              <li key={index}>{item.title} - {item.type}</li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

export default App;
