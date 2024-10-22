import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import MediaUpload from './MediaUpload';
import { uploadFile } from '../mediaOperations';

jest.mock('../mediaOperations');

describe('MediaUpload', () => {
  it('renders correctly', () => {
    render(<MediaUpload />);
    expect(screen.getByText('Upload Media')).toBeInTheDocument();
    expect(screen.getByText('Upload and Convert')).toBeInTheDocument();
  });

  it('handles file upload', async () => {
    uploadFile.mockResolvedValue({ convertedName: 'test.mp4' });
    render(<MediaUpload />);
    
    const file = new File(['dummy content'], 'test.mp4', {type: 'video/mp4'});
    const input = screen.getByLabelText('File input');
    
    fireEvent.change(input, { target: { files: [file] } });
    fireEvent.click(screen.getByText('Upload and Convert'));

    await waitFor(() => {
      expect(screen.getByText('File uploaded and converted successfully: test.mp4')).toBeInTheDocument();
    });
  });
});
