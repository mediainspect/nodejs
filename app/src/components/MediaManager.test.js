import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import MediaManager from './MediaManager';
import { getMediaItems } from '../mediaOperations';

jest.mock('../mediaOperations');

describe('MediaManager', () => {
  beforeEach(() => {
    getMediaItems.mockResolvedValue({
      results: [
        { id: 1, title: 'Test Media 1' },
        { id: 2, title: 'Test Media 2' },
      ]
    });
  });

  it('renders media items', async () => {
    render(<MediaManager />);
    await waitFor(() => {
      expect(screen.getByText('Test Media 1')).toBeInTheDocument();
      expect(screen.getByText('Test Media 2')).toBeInTheDocument();
    });
  });

  it('allows editing of media items', async () => {
    render(<MediaManager />);
    await waitFor(() => {
      fireEvent.click(screen.getAllByText('Edit')[0]);
    });
    const input = screen.getByDisplayValue('Test Media 1');
    fireEvent.change(input, { target: { value: 'Updated Media 1' } });
    fireEvent.click(screen.getByText('Save'));
    expect(screen.getByText('Updated Media 1')).toBeInTheDocument();
  });
});
