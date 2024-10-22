import React, { useState } from 'react';
import axios from 'axios';

const API_URL = `http://${process.env.REACT_APP_API_HOST || 'localhost'}:${process.env.REACT_APP_API_PORT || 3005}`;

function Register({ onRegister }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (username.length < 3) newErrors.username = 'Username must be at least 3 characters long';
    if (password.length < 6) newErrors.password = 'Password must be at least 6 characters long';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        const response = await axios.post(`${API_URL}/register`, { username, password });
        onRegister(response.data);
      } catch (error) {
        setErrors({ submit: error.response?.data?.message || 'Registration failed' });
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Register</h2>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      {errors.username && <div className="error">{errors.username}</div>}
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      {errors.password && <div className="error">{errors.password}</div>}
      <button type="submit">Register</button>
      {errors.submit && <div className="error">{errors.submit}</div>}
    </form>
  );
}

export default Register;
