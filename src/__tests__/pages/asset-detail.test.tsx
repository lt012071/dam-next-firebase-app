import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import AssetDetail from '../../pages/assets/[id]';

jest.mock('next/image', () => () => null);
jest.mock('next/router', () => ({ useRouter: () => ({ query: { id: 'test-id' }, push: jest.fn() }) }));
jest.mock('@/lib/assetRepository', () => ({ fetchAssetById: jest.fn() }));
jest.mock('@/lib/versionRepository', () => ({ fetchVersionById: jest.fn() }));
jest.mock('@/lib/commentRepository', () => ({ subscribeComments: jest.fn(() => () => {}), addComment: jest.fn(), deleteComment: jest.fn() }));
jest.mock('@/contexts/AuthContext', () => ({ useAuth: () => ({ user: { displayName: 'testuser', email: 'test@example.com' } }) }));

const { fetchAssetById } = jest.requireMock('@/lib/assetRepository');
const { fetchVersionById } = jest.requireMock('@/lib/versionRepository');


describe('AssetDetail page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('ローディング表示が出る', async () => {
    fetchAssetById.mockReturnValue(new Promise(() => {}));
    render(<AssetDetail />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('Not found表示が出る', async () => {
    fetchAssetById.mockResolvedValue(null);
    render(<AssetDetail />);
    await waitFor(() => {
      expect(screen.getByText('Not found.')).toBeInTheDocument();
    });
  });

  it('アセット詳細が表示される', async () => {
    fetchAssetById.mockResolvedValue({
      id: 'test-id',
      title: 'Test Asset',
      description: 'desc',
      category: 'Design',
      tags: ['tag1', 'tag2'],
      visibility: 'public',
      uploader: 'testuser',
      uploadedAt: '2024-07-01',
      updatedAt: '2024-07-02',
      latestVersionId: 'ver-1',
    });
    fetchVersionById.mockResolvedValue({
      fileType: 'image/png',
      fileName: 'file.png',
      fileUrl: 'url',
      fileSize: 1048576,
      version: '1',
    });
    render(<AssetDetail />);
    await waitFor(() => {
      expect(screen.getByText('Asset Details')).toBeInTheDocument();
      expect(screen.getByText('Test Asset')).toBeInTheDocument();
      expect(screen.getByText('desc')).toBeInTheDocument();
      expect(screen.getByText('file.png')).toBeInTheDocument();
      expect(screen.getByText('image/png')).toBeInTheDocument();
      expect(screen.getByText('1.00 MB')).toBeInTheDocument();
      expect(screen.getByText('testuser')).toBeInTheDocument();
      expect(screen.getByText('2024-07-01')).toBeInTheDocument();
      expect(screen.getByText('2024-07-02')).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('Design / tag1, tag2')).toBeInTheDocument();
      expect(screen.getByText('public')).toBeInTheDocument();
    });
  });
}); 