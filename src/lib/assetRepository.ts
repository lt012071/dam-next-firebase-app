import { db, storage } from '@/firebase';
import { Asset } from '@/types/asset';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  where,
  query,
  orderBy,
  limit,
  addDoc
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

const ASSET_COLLECTION = 'assets';

export interface AssetFilter {
  fileType?: string;
  category?: string;
  tags?: string[];
  uploadedAt?: string;
  title?: string;
  page?: number;
  pageSize?: number;
}

export async function fetchAssets(filter?: AssetFilter): Promise<Asset[]> {
  let q = query(collection(db, ASSET_COLLECTION), orderBy('uploadedAt', 'desc'));
  if (filter) {
    const conds = [];
    if (filter.fileType) conds.push(where('fileType', '==', filter.fileType));
    if (filter.category) conds.push(where('category', '==', filter.category));
    if (filter.tags && filter.tags.length > 0) conds.push(where('tags', 'array-contains-any', filter.tags));
    if (filter.uploadedAt) conds.push(where('uploadedAt', '>=', filter.uploadedAt));
    conds.push(where('isDeleted', '!=', true));
    if (conds.length > 0) {
      q = query(collection(db, ASSET_COLLECTION), ...conds, orderBy('uploadedAt', 'desc'));
    }
    if (filter.pageSize) {
      q = query(q, limit(filter.pageSize));
    }
  } else {
    q = query(collection(db, ASSET_COLLECTION), where('isDeleted', '!=', true), orderBy('uploadedAt', 'desc'));
  }
  const snapshot = await getDocs(q);
  let assets = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Asset));
  if (filter?.title) {
    assets = assets.filter(a => a.title.toLowerCase().includes(filter.title!.toLowerCase()));
  }
  if (filter?.page && filter?.pageSize) {
    const start = (filter.page - 1) * filter.pageSize;
    assets = assets.slice(start, start + filter.pageSize);
  }
  return assets;
}

export async function fetchAssetById(id: string): Promise<Asset | null> {
  const docRef = doc(db, ASSET_COLLECTION, id);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  const data = docSnap.data();
  if (data.isDeleted) return null;
  return { id: docSnap.id, ...data } as Asset;
}

export async function createAsset(asset: Omit<Asset, 'id'>): Promise<string> {
  const docRef = await addDoc(collection(db, ASSET_COLLECTION), asset);
  return docRef.id;
}

export async function updateAsset(id: string, data: Partial<Asset>) {
  const docRef = doc(db, ASSET_COLLECTION, id);
  await updateDoc(docRef, data);
}

export async function deleteAsset(id: string) {
  const docRef = doc(db, ASSET_COLLECTION, id);
  await updateDoc(docRef, {
    isDeleted: true,
    deletedAt: new Date().toISOString(),
  });
}

export async function uploadAssetFile(file: File): Promise<{ url: string; name: string; size: number; type: string }> {
  const storageRef = ref(storage, `assets/${Date.now()}_${file.name}`);
  const snapshot = await uploadBytes(storageRef, file);
  const url = await getDownloadURL(snapshot.ref);
  return {
    url,
    name: file.name,
    size: file.size,
    type: file.type,
  };
}

export async function deleteAssetFile(fileUrl: string) {
  const storageRef = ref(storage, fileUrl);
  await deleteObject(storageRef);
} 