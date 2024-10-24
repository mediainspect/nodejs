import axios from 'axios';

const API_URL = `http://${process.env.REACT_APP_API_HOST || 'localhost'}:${process.env.REACT_APP_API_PORT || 3005}`;

export const uploadFile = async (file, outputFormat, token) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('outputFormat', outputFormat);

  try {
    const response = await axios.post(`${API_URL}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'x-access-token': token
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

export const convertStream = async (input, inputProtocol, outputProtocol, token) => {
  try {
    const response = await axios.get(`${API_URL}/convert`, {
      params: { input, inputProtocol, outputProtocol },
      headers: { 'x-access-token': token }
    });
    return response.data;
  } catch (error) {
    console.error('Error converting stream:', error);
    throw error;
  }
};

export const performMediaOperation = async (operation, input, params, token) => {
  try {
    const response = await axios.post(`${API_URL}/media/operation`, {
      operation,
      input,
      params,
    }, {
      headers: { 'x-access-token': token }
    });
    return response.data;
  } catch (error) {
    console.error('Error performing media operation:', error);
    throw error;
  }
};

export const getMediaItems = async (page = 1, limit = 10, token) => {
  try {
    const response = await axios.get(`${API_URL}/media`, {
      params: { page, limit },
      headers: { 'x-access-token': token }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching media items:', error);
    throw error;
  }
};
