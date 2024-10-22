import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import axios from 'axios';
import App from './App';

// Mock axios
jest.mock('axios');

jest.mock('./mediaOperations', () => ({
  uploadFile: jest.fn(),
  convertStream: jest.fn(),
  performMediaOperation: jest.fn(),
  getMediaItems: jest.fn(),
}));

describe('App component', () => {
  test('renders login and register forms when not logged in', () => {
    render(<App />);
    expect(screen.getByText('Register')).toBeInTheDocument();
    expect(screen.getByText('Login')).toBeInTheDocument();
  });

  test('renders profile and media operations when logged in', async () => {
    const mockUser = { username: 'testuser', token: 'testtoken' };
    const mockData = [{ id: 1, title: 'Test Media' }];
    
    axios.get.mockResolvedValueOnce({ data: { results: mockData } });

    render(<App />);
    
    // Simulate login
    fireEvent.click(screen.getByText('Login'));
    await waitFor(() => {
      expect(screen.getByText('Welcome, testuser!')).toBeInTheDocument();
    });

    // Check if media operations are rendered
    expect(screen.getByText('Upload and Convert')).toBeInTheDocument();
    expect(screen.getByText('Convert Stream')).toBeInTheDocument();
    expect(screen.getByText('Perform Media Operation')).toBeInTheDocument();

    // Check if media data is rendered
    await waitFor(() => {
      expect(screen.getByText('Test Media')).toBeInTheDocument();
    });
  });

  // Add more tests for upload, convert, and media operations...
});
