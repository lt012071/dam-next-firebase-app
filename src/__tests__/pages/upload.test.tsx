import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Upload from '../../pages/upload';

jest.mock('@/lib/assetRepository', () => ({
  uploadAssetFile: jest.fn(),
  createAsset: jest.fn(),
  updateAsset: jest.fn(),
}));
jest.mock('@/lib/versionRepository', () => ({
  createVersion: jest.fn(),
  updateVersion: jest.fn(),
}));
jest.mock('@/contexts/AuthContext', () => ({ useAuth: jest.fn() }));
const { uploadAssetFile, createAsset, updateAsset } = jest.requireMock('@/lib/assetRepository');
const { createVersion, updateVersion } = jest.requireMock('@/lib/versionRepository');
const { useAuth } = jest.requireMock('@/contexts/AuthContext');

describe('Upload page', () => {
  beforeEach(() => {
    useAuth.mockReturnValue({ user: { displayName: 'テストユーザー', email: 'test@example.com' } });
  });
  afterEach(() => { jest.clearAllMocks(); });

  it('主要なUI要素が表示される', () => {
    render(<Upload />);
    expect(screen.getByText('Upload Assets')).toBeInTheDocument();
    expect(screen.getByText('Drag and drop files here')).toBeInTheDocument();
    expect(screen.getByText('Or click to browse your files')).toBeInTheDocument();
    expect(screen.getByText('Upload')).toBeInTheDocument();
  });

  it('バリデーション: ファイル・タイトル・カテゴリが必須', async () => {
    render(<Upload />);
    fireEvent.click(screen.getByText('Upload'));
    await waitFor(() => {
      expect(screen.getByText('ファイル・タイトル・カテゴリは必須です')).toBeInTheDocument();
    });
  });

  it('アップロード成功時に完了メッセージが表示される', async () => {
    uploadAssetFile.mockResolvedValue({ url: 'url', name: 'file.png', size: 1, type: 'image/png' });
    createAsset.mockResolvedValue('aid');
    createVersion.mockResolvedValue('vid');
    updateVersion.mockResolvedValue();
    updateAsset.mockResolvedValue();
    const { container } = render(<Upload />);
    // ファイル選択
    const file = new File(['dummy'], 'file.png', { type: 'image/png' });
    fireEvent.change(screen.getByPlaceholderText('Add tags (カンマ区切り)'), { target: { value: 'tag1,tag2' } });
    fireEvent.change(screen.getByPlaceholderText('Enter asset title'), { target: { value: 'タイトル' } });
    fireEvent.change(screen.getByPlaceholderText('Enter asset description'), { target: { value: '説明' } });
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Design' } });
    const fileInput = container.querySelector('input[type="file"]');
    if (!fileInput) throw new Error('file input not found');
    fireEvent.change(fileInput, { target: { files: [file] } });
    // submit
    fireEvent.click(screen.getByRole('button', { name: 'Upload' }));
    await waitFor(() => {
      expect(screen.getByText('アップロードが完了しました')).toBeInTheDocument();
    });
  });

  it('アップロード失敗時にエラーメッセージが表示される', async () => {
    uploadAssetFile.mockRejectedValue(new Error('fail'));
    const { container } = render(<Upload />);
    const file = new File(['dummy'], 'file.png', { type: 'image/png' });
    fireEvent.change(screen.getByPlaceholderText('Add tags (カンマ区切り)'), { target: { value: 'tag1,tag2' } });
    fireEvent.change(screen.getByPlaceholderText('Enter asset title'), { target: { value: 'タイトル' } });
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Design' } });
    const fileInput = container.querySelector('input[type="file"]');
    if (!fileInput) throw new Error('file input not found');
    fireEvent.change(fileInput, { target: { files: [file] } });
    // submit
    fireEvent.click(screen.getByRole('button', { name: 'Upload' }));
    expect(await screen.findByText('アップロードに失敗しました')).toBeInTheDocument();
  });

  it('ファイル選択時にファイル名が表示される', () => {
    const { container } = render(<Upload />);
    const file = new File(['dummy'], 'file.png', { type: 'image/png' });
    const fileInput = container.querySelector('input[type="file"]');
    if (!fileInput) throw new Error('file input not found');
    fireEvent.change(fileInput, { target: { files: [file] } });
    expect(screen.getByText('file.png')).toBeInTheDocument();
  });

  it('Visibilityを切り替えられる', () => {
    render(<Upload />);
    const publicRadio = screen.getByLabelText('Public');
    const privateRadio = screen.getByLabelText('Private');
    expect(publicRadio).toBeChecked();
    fireEvent.click(privateRadio);
    expect(privateRadio).toBeChecked();
    fireEvent.click(publicRadio);
    expect(publicRadio).toBeChecked();
  });

  it('アップロード中はUploading...が表示される', async () => {
    uploadAssetFile.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ url: 'url', name: 'file.png', size: 1, type: 'image/png' }), 100)));
    createAsset.mockResolvedValue('aid');
    createVersion.mockResolvedValue('vid');
    updateVersion.mockResolvedValue();
    updateAsset.mockResolvedValue();
    const { container } = render(<Upload />);
    const file = new File(['dummy'], 'file.png', { type: 'image/png' });
    const fileInput = container.querySelector('input[type="file"]');
    if (!fileInput) throw new Error('file input not found');
    fireEvent.change(fileInput, { target: { files: [file] } });
    fireEvent.change(screen.getByPlaceholderText('Enter asset title'), { target: { value: 'タイトル' } });
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Design' } });
    fireEvent.click(screen.getByText('Upload'));
    expect(await screen.findByText('Uploading...')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText('アップロードが完了しました')).toBeInTheDocument());
  });

  it('アップロード成功後にフォームがリセットされる', async () => {
    uploadAssetFile.mockResolvedValue({ url: 'url', name: 'file.png', size: 1, type: 'image/png' });
    createAsset.mockResolvedValue('aid');
    createVersion.mockResolvedValue('vid');
    updateVersion.mockResolvedValue();
    updateAsset.mockResolvedValue();
    const { container } = render(<Upload />);
    const file = new File(['dummy'], 'file.png', { type: 'image/png' });
    const fileInput = container.querySelector('input[type="file"]');
    if (!fileInput) throw new Error('file input not found');
    fireEvent.change(fileInput, { target: { files: [file] } });
    fireEvent.change(screen.getByPlaceholderText('Enter asset title'), { target: { value: 'タイトル' } });
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Design' } });
    fireEvent.click(screen.getByText('Upload'));
    await waitFor(() => expect(screen.getByText('アップロードが完了しました')).toBeInTheDocument());
    // フォームがリセットされているか
    expect(screen.getByPlaceholderText('Enter asset title')).toHaveValue('');
    expect(screen.getByRole('combobox')).toHaveValue('');
    expect(screen.queryByText('file.png')).not.toBeInTheDocument();
  });
}); 