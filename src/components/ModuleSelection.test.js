import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import ModuleSelection from './ModuleSelection';

// Mock fetch
global.fetch = jest.fn();

describe('ModuleSelection', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  it('renders loading state initially', () => {
    render(<Router><ModuleSelection /></Router>);
    expect(screen.getByText('Loading modules...')).toBeInTheDocument();
  });

  it('renders modules when fetch is successful', async () => {
    const mockModules = ['Module 1', 'Module 2', 'Module 3'];
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockModules,
    });

    render(<Router><ModuleSelection /></Router>);

    await waitFor(() => {
      mockModules.forEach(module => {
        expect(screen.getByText(module)).toBeInTheDocument();
      });
    });
  });

  it('renders error message when fetch fails', async () => {
    fetch.mockRejectedValueOnce(new Error('Failed to fetch'));

    render(<Router><ModuleSelection /></Router>);

    await waitFor(() => {
      expect(screen.getByText('Failed to load modules. Please try again later.')).toBeInTheDocument();
    });
  });

  it('renders no modules message when fetch returns empty array', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    render(<Router><ModuleSelection /></Router>);

    await waitFor(() => {
      expect(screen.getByText('No modules available. Please add some exercises first.')).toBeInTheDocument();
    });
  });
});