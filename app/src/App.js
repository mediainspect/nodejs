import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Register from './components/Register';
import Login from './components/Login';
import Profile from './components/Profile';
import MediaUpload from './components/MediaUpload';
import MediaManager from './components/MediaManager';
import { setToken, getToken, removeToken, isLoggedIn } from './utils/auth';
import './App.css';

const API_URL = `http://${process.env.REACT_APP_API_HOST || 'localhost'}:${process.env.REACT_APP_API_PORT || 3005}`;

function App() {
  const [user, setUser] = useState(null);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (isLoggedIn()) {
        try {
          const response = await axios.get(`${API_URL}/media`, {
            headers: { 'x-access-token': getToken() }
          });
          setData(response.data.results);
        } catch (error) {
          console.error('Error fetching data:', error);
          setError('Failed to fetch media items');
        }
      }
    };

    fetchData();
  }, [user]);

  const handleRegister = (userData) => {
    setUser(userData);
    setToken(userData.token);
  };

  const handleLogin = (userData) => {
    setUser(userData);
    setToken(userData.token);
  };

  const handleLogout = () => {
    setUser(null);
    removeToken();
    setData(null);
  };

  return (
    <div className="App">
      <h1>Media Server</h1>
      {error && <div className="error-message">{error}</div>}
      {user ? (
        <>
          <Profile user={user} onLogout={handleLogout} />
          <MediaUpload />
          <MediaManager data={data} />
        </>
      ) : (
        <>
          <Register onRegister={handleRegister} />
          <Login onLogin={handleLogin} />
        </>
      )}
    </div>
  );
}

export default App;
