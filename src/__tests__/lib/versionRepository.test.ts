import {
  fetchVersions,
  createVersion,
  deleteVersion,
  revertVersion,
  fetchVersionById,
  updateVersion
} from '../../lib/versionRepository';

jest.mock('@/firebase', () => ({
  db: {},
}));

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  doc: jest.fn(),
  getDocs: jest.fn(),
  addDoc: jest.fn(),
  deleteDoc: jest.fn(),
  query: jest.fn(),
  orderBy: jest.fn(),
  where: jest.fn(),
  getDoc: jest.fn(),
  updateDoc: jest.fn(),
}));

describe('versionRepository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetchVersions: バージョン一覧取得', async () => {
    const mockDocs = [
      { id: '1', data: () => ({ assetId: 'a', version: 'v1', fileUrl: '', fileName: '', fileType: '', fileSize: 0, updatedAt: '', updatedBy: '' }) },
      { id: '2', data: () => ({ assetId: 'a', version: 'v2', fileUrl: '', fileName: '', fileType: '', fileSize: 0, updatedAt: '', updatedBy: '' }) },
    ];
    const getDocs = jest.requireMock('firebase/firestore').getDocs;
    getDocs.mockResolvedValue({ docs: mockDocs });
    const versions = await fetchVersions('a');
    expect(versions.length).toBe(2);
    expect(versions[0].version).toBe('v1');
  });

  it('createVersion: 正常にIDを返す', async () => {
    const addDoc = jest.requireMock('firebase/firestore').addDoc;
    addDoc.mockResolvedValue({ id: 'newid' });
    const id = await createVersion({ assetId: 'a', version: 'v', fileUrl: '', fileName: '', fileType: '', fileSize: 0, updatedAt: '', updatedBy: '' });
    expect(id).toBe('newid');
  });

  it('deleteVersion: deleteDocが呼ばれる', async () => {
    const deleteDoc = jest.requireMock('firebase/firestore').deleteDoc;
    deleteDoc.mockResolvedValue(undefined);
    await deleteVersion('id');
    expect(deleteDoc).toHaveBeenCalled();
  });

  it('revertVersion: バージョンが存在しない場合エラー', async () => {
    const getDoc = jest.requireMock('firebase/firestore').getDoc;
    getDoc.mockResolvedValue({ exists: () => false });
    await expect(revertVersion('vid', 'aid')).rejects.toThrow('Version not found');
  });

  it('fetchVersionById: 存在しない場合null', async () => {
    const getDoc = jest.requireMock('firebase/firestore').getDoc;
    getDoc.mockResolvedValue({ exists: () => false });
    const version = await fetchVersionById('notfound');
    expect(version).toBeNull();
  });

  it('updateVersion: updateDocが呼ばれる', async () => {
    const updateDoc = jest.requireMock('firebase/firestore').updateDoc;
    updateDoc.mockResolvedValue(undefined);
    await updateVersion('vid', { version: 'v2' });
    expect(updateDoc).toHaveBeenCalled();
  });
}); 