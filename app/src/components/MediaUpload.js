import React, { useState } from 'react';
import { uploadFile } from '../mediaOperations';
import { getToken } from '../utils/auth';

function MediaUpload() {
  const [file, setFile] = useState(null);
  const [outputFormat, setOutputFormat] = useState('mp4');
  const [message, setMessage] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage('Please select a file first');
      return;
    }
    try {
      const result = await uploadFile(file, outputFormat, getToken());
      setMessage(`File uploaded and converted successfully: ${result.convertedName}`);
    } catch (error) {
      setMessage('Error uploading file: ' + error.message);
    }
  };

  return (
    <div className="media-upload">
      <h2>Upload Media</h2>
      <input type="file" onChange={handleFileChange} />
      <select value={outputFormat} onChange={(e) => setOutputFormat(e.target.value)}>
        <option value="mp4">MP4</option>
        <option value="avi">AVI</option>
        <option value="mov">MOV</option>
      </select>
      <button onClick={handleUpload}>Upload and Convert</button>
      {message && <p className="message">{message}</p>}
    </div>
  );
}

export default MediaUpload;
