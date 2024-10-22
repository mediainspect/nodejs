import React, { useState, useEffect } from 'react';
import Register from './components/Register';
import Login from './components/Login';
import Profile from './components/Profile';
import { uploadFile, convertStream, performMediaOperation, getMediaItems } from './mediaOperations';

function App() {
  const [user, setUser] = useState(null);
  const [data, setData] = useState(null);
  const [file, setFile] = useState(null);
  const [outputFormat, setOutputFormat] = useState('mp4');

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        try {
          const mediaData = await getMediaItems();
          setData(mediaData.results);
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      }
    };

    fetchData();
  }, [user]);

  const handleRegister = (userData) => {
    setUser(userData);
  };

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
    setData(null);
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      alert('Please select a file first');
      return;
    }
    try {
      const result = await uploadFile(file, outputFormat);
      alert(`File uploaded and converted successfully: ${result.convertedName}`);
    } catch (error) {
      alert('Error uploading file');
    }
  };

  const handleConvertStream = async () => {
    try {
      await convertStream('http://example.com/input.mp4', 'http', 'rtmp');
      alert('Stream converted successfully');
    } catch (error) {
      alert('Error converting stream');
    }
  };

  const handleMediaOperation = async () => {
    try {
      await performMediaOperation('convert', 'input.mp4', ['output.avi']);
      alert('Media operation performed successfully');
    } catch (error) {
      alert('Error performing media operation');
    }
  };

  return (
    <div className="App">
      <h1>Media Server</h1>
      {user ? (
        <>
          <Profile user={user} onLogout={handleLogout} />
          <div>
            <input type="file" onChange={handleFileChange} />
            <select value={outputFormat} onChange={(e) => setOutputFormat(e.target.value)}>
              <option value="mp4">MP4</option>
              <option value="avi">AVI</option>
              <option value="mov">MOV</option>
            </select>
            <button onClick={handleUpload}>Upload and Convert</button>
          </div>
          <div>
            <button onClick={handleConvertStream}>Convert Stream</button>
            <button onClick={handleMediaOperation}>Perform Media Operation</button>
          </div>
          {data ? (
            <ul>
              {data.map(item => (
                <li key={item.id}>{item.title}</li>
              ))}
            </ul>
          ) : (
            <p>Loading...</p>
          )}
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
