import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import VersionHistory from '../../pages/version-history';

jest.mock('next/image', () => () => null);
jest.mock('next/router', () => ({ useRouter: () => ({ query: { assetId: 'aid' } }) }));
jest.mock('@/lib/versionRepository', () => ({ fetchVersions: jest.fn(), revertVersion: jest.fn() }));
const { fetchVersions, revertVersion } = jest.requireMock('@/lib/versionRepository');

describe('VersionHistory page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    fetchVersions.mockResolvedValue([
      { id: 'v1', version: '1', updatedAt: '2024-07-01', updatedBy: 'user', fileUrl: 'url1', fileType: 'image/png', assetId: 'aid', fileName: '', fileSize: 1 },
      { id: 'v2', version: '2', updatedAt: '2024-07-02', updatedBy: 'user2', fileUrl: 'url2', fileType: 'application/pdf', assetId: 'aid', fileName: '', fileSize: 1 },
    ]);
  });

  it('タイトルとテーブルヘッダーが表示される', async () => {
    render(<VersionHistory />);
    await waitFor(() => {
      expect(screen.getByText('Version')).toBeInTheDocument();
      expect(screen.getByText('Updated')).toBeInTheDocument();
      expect(screen.getByText('Updated By')).toBeInTheDocument();
      expect(screen.getByText('Actions')).toBeInTheDocument();
      expect(screen.getByText('Version 1')).toBeInTheDocument();
    });
    expect(screen.getByText('Version History')).toBeInTheDocument();
  });

  it('バージョンデータが表示される', async () => {
    render(<VersionHistory />);
    await waitFor(() => {
      expect(screen.getByText('Version 1')).toBeInTheDocument();
      expect(screen.getByText('Version 2')).toBeInTheDocument();
    });
  });

  it('プレビューボタン押下でプレビューモーダルが表示される', async () => {
    render(<VersionHistory />);
    await waitFor(() => expect(screen.getAllByText('Preview').length).toBeGreaterThan(0));
    fireEvent.click(screen.getAllByText('Preview')[0]);
    // プレビューモーダルが表示されることを検証
    await waitFor(() => {
      expect(screen.getByRole('button', { name: '×' })).toBeInTheDocument();
    });
  });

  it('リバートボタン押下でrevertVersionが呼ばれる', async () => {
    window.confirm = jest.fn(() => true);
    window.alert = jest.fn();
    revertVersion.mockResolvedValue();
    render(<VersionHistory />);
    await waitFor(() => expect(screen.getAllByText('Revert').length).toBeGreaterThan(0));
    fireEvent.click(screen.getAllByText('Revert')[0]);
    await waitFor(() => {
      expect(revertVersion).toHaveBeenCalled();
      expect(window.alert).toHaveBeenCalledWith('バージョンを復元しました');
    });
  });
}); 