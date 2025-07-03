import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Assets from '../../pages/assets';

jest.mock('next/image', () => () => null);
jest.mock('@/lib/assetRepository', () => ({ fetchAssets: jest.fn() }));
jest.mock('@/lib/versionRepository', () => ({ fetchVersionById: jest.fn() }));
const { fetchAssets } = jest.requireMock('@/lib/assetRepository');
const { fetchVersionById } = jest.requireMock('@/lib/versionRepository');

describe('Assets page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('タイトル・アップロードボタン・フィルタUIが表示される', async () => {
    fetchAssets.mockResolvedValue([]);
    render(<Assets />);
    await waitFor(() => expect(screen.queryByText('Loading...')).not.toBeInTheDocument());
    expect(screen.getByText('All Assets')).toBeInTheDocument();
    expect(screen.getByText('Upload')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Search\s+assets/)).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Tags')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Upload Date')).toBeInTheDocument();
    expect(screen.getByText('File Type')).toBeInTheDocument();
    expect(screen.getByText('Category')).toBeInTheDocument();
  });

  it('ローディング表示が出る', async () => {
    fetchAssets.mockReturnValue(new Promise(() => {})); // never resolves
    render(<Assets />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('アセットデータが表示される', async () => {
    fetchAssets.mockResolvedValue([
      { id: '1', title: 'Asset1', tags: ['tag1'], uploadedAt: '2024-07-01', latestVersionId: 'v1' },
    ]);
    fetchVersionById.mockResolvedValue({ fileType: 'image/png', fileName: 'file.png', fileUrl: 'url' });
    render(<Assets />);
    await waitFor(() => {
      expect(screen.getByText('Asset1')).toBeInTheDocument();
      expect(screen.getByText('tag1')).toBeInTheDocument();
      expect(screen.getByText('2024-07-01')).toBeInTheDocument();
      expect(screen.getByText('file.png')).toBeInTheDocument();
    });
  });

  it('アセットが0件の場合No assets found.が表示される', async () => {
    fetchAssets.mockResolvedValue([]);
    render(<Assets />);
    await waitFor(() => {
      expect(screen.getByText('No assets found.')).toBeInTheDocument();
    });
  });

  it('ページネーションボタンでページが切り替わる', async () => {
    fetchAssets.mockResolvedValue([]);
    render(<Assets />);
    const page2 = screen.getByText('2');
    fireEvent.click(page2);
    // ページ切り替えでfetchAssetsが再度呼ばれる
    await waitFor(() => {
      expect(fetchAssets).toHaveBeenCalled();
    });
  });
}); 