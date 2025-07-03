import {
  fetchAssets,
  fetchAssetById,
  createAsset,
  updateAsset,
  deleteAsset,
  uploadAssetFile,
  deleteAssetFile
} from '../../lib/assetRepository';

jest.mock('@/firebase', () => ({
  db: {},
  storage: {},
}));

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
  getDocs: jest.fn(),
  updateDoc: jest.fn(),
  where: jest.fn(),
  query: jest.fn(),
  orderBy: jest.fn(),
  limit: jest.fn(),
  addDoc: jest.fn(),
}));

jest.mock('firebase/storage', () => ({
  ref: jest.fn(),
  uploadBytes: jest.fn(),
  getDownloadURL: jest.fn(),
  deleteObject: jest.fn(),
}));

describe('assetRepository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetchAssets: フィルターなしでassetsを取得', async () => {
    const mockDocs = [
      { id: '1', data: () => ({ title: 'A', isDeleted: false }) },
      { id: '2', data: () => ({ title: 'B', isDeleted: false }) },
    ];
    const getDocs = jest.requireMock('firebase/firestore').getDocs;
    getDocs.mockResolvedValue({ docs: mockDocs });
    const assets = await fetchAssets();
    expect(assets.length).toBe(2);
    expect(assets[0].title).toBe('A');
  });

  it('fetchAssetById: 存在しない場合null', async () => {
    const getDoc = jest.requireMock('firebase/firestore').getDoc;
    getDoc.mockResolvedValue({ exists: () => false });
    const asset = await fetchAssetById('notfound');
    expect(asset).toBeNull();
  });

  it('createAsset: 正常にIDを返す', async () => {
    const addDoc = jest.requireMock('firebase/firestore').addDoc;
    addDoc.mockResolvedValue({ id: 'newid' });
    const id = await createAsset({ title: 't', description: '', category: '', tags: [], uploader: '', uploadedAt: '', updatedAt: '', visibility: 'public' });
    expect(id).toBe('newid');
  });

  it('updateAsset: updateDocが呼ばれる', async () => {
    const updateDoc = jest.requireMock('firebase/firestore').updateDoc;
    updateDoc.mockResolvedValue(undefined);
    await updateAsset('id', { title: 'new' });
    expect(updateDoc).toHaveBeenCalled();
  });

  it('deleteAsset: 論理削除が呼ばれる', async () => {
    const updateDoc = jest.requireMock('firebase/firestore').updateDoc;
    updateDoc.mockResolvedValue(undefined);
    await deleteAsset('id');
    expect(updateDoc).toHaveBeenCalledWith(undefined, expect.objectContaining({ isDeleted: true }));
  });

  it('uploadAssetFile: ファイルアップロード成功', async () => {
    const uploadBytes = jest.requireMock('firebase/storage').uploadBytes;
    const getDownloadURL = jest.requireMock('firebase/storage').getDownloadURL;
    uploadBytes.mockResolvedValue({ ref: 'ref' });
    getDownloadURL.mockResolvedValue('http://url');
    const file = new File(['data'], 'test.png', { type: 'image/png' });
    const result = await uploadAssetFile(file);
    expect(result.url).toBe('http://url');
    expect(result.name).toBe('test.png');
  });

  it('deleteAssetFile: deleteObjectが呼ばれる', async () => {
    const deleteObject = jest.requireMock('firebase/storage').deleteObject;
    deleteObject.mockResolvedValue(undefined);
    await deleteAssetFile('fileurl');
    expect(deleteObject).toHaveBeenCalled();
  });
}); 