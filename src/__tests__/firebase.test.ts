import * as firebaseApp from 'firebase/app';
import * as firestore from 'firebase/firestore';
import * as storageMod from 'firebase/storage';

jest.mock('firebase/app');
jest.mock('firebase/firestore');
jest.mock('firebase/storage');

describe('firebase.ts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('getAppsが空ならinitializeAppが呼ばれる', async () => {
    (firebaseApp.getApps as jest.Mock).mockReturnValue([]);
    (firebaseApp.initializeApp as jest.Mock).mockReturnValue('app');
    await jest.isolateModulesAsync(async () => {
      const mod = await import('../firebase');
      expect(firebaseApp.initializeApp).toHaveBeenCalled();
      expect(mod.app).toBe('app');
    });
  });

  it('getAppsが空でなければgetAppが呼ばれる', async () => {
    (firebaseApp.getApps as jest.Mock).mockReturnValue([{}]);
    (firebaseApp.getApp as jest.Mock).mockReturnValue('app2');
    await jest.isolateModulesAsync(async () => {
      const mod = await import('../firebase');
      expect(firebaseApp.getApp).toHaveBeenCalled();
      expect(mod.app).toBe('app2');
    });
  });

  it('db, storageが正しく初期化される', async () => {
    (firebaseApp.getApps as jest.Mock).mockReturnValue([{}]);
    (firebaseApp.getApp as jest.Mock).mockReturnValue('app3');
    (firestore.getFirestore as jest.Mock).mockReturnValue('db');
    (storageMod.getStorage as jest.Mock).mockReturnValue('storage');
    await jest.isolateModulesAsync(async () => {
      const mod = await import('../firebase');
      expect(firestore.getFirestore).toHaveBeenCalledWith('app3');
      expect(storageMod.getStorage).toHaveBeenCalledWith('app3');
      expect(mod.db).toBe('db');
      expect(mod.storage).toBe('storage');
    });
  });
}); 