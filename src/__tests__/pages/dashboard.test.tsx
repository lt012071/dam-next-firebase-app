import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import Dashboard from '../../pages/dashboard';

jest.mock('@/lib/assetRepository', () => ({ fetchAssets: jest.fn() }));
const { fetchAssets } = jest.requireMock('@/lib/assetRepository');

describe('Dashboard page', () => {
  afterEach(() => { jest.clearAllMocks(); });

  it('タイトルとセクションが表示される', async () => {
    fetchAssets.mockResolvedValue([]);
    render(<Dashboard />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Recently Uploaded Assets')).toBeInTheDocument();
    expect(screen.getByText('Storage Usage')).toBeInTheDocument();
  });

  it('アセットが表示される', async () => {
    fetchAssets.mockResolvedValue([
      { id: '1', title: 'Asset1', fileSize: 1048576 },
      { id: '2', title: 'Asset2', fileSize: 2048576 },
    ]);
    render(<Dashboard />);
    await waitFor(() => {
      expect(screen.getByText('Asset1')).toBeInTheDocument();
      expect(screen.getByText('Asset2')).toBeInTheDocument();
    });
  });

  it('ストレージ合計が正しく表示される', async () => {
    fetchAssets.mockResolvedValue([
      { id: '1', title: 'A', fileSize: 1048576 }, // 1MB
      { id: '2', title: 'B', fileSize: 2097152 }, // 2MB
    ]);
    render(<Dashboard />);
    await waitFor(() => {
      expect(screen.getByText('3.00 MB')).toBeInTheDocument();
    });
  });
}); 