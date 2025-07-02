import { db } from '@/firebase';
import { Version } from '@/types/version';
import {
  collection,
  doc,
  getDocs,
  addDoc,
  deleteDoc,
  query,
  orderBy,
  where,
  getDoc,
  updateDoc,
} from 'firebase/firestore';

const VERSION_COLLECTION = 'versions';

export async function fetchVersions(assetId: string): Promise<Version[]> {
  const q = query(collection(db, VERSION_COLLECTION), where('assetId', '==', assetId), orderBy('updatedAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Version));
}

export async function createVersion(version: Omit<Version, 'id'>): Promise<string> {
  const docRef = await addDoc(collection(db, VERSION_COLLECTION), version);
  return docRef.id;
}

export async function deleteVersion(id: string) {
  const docRef = doc(db, VERSION_COLLECTION, id);
  await deleteDoc(docRef);
}

export async function revertVersion(versionId: string, assetId: string) {
  // バージョン情報を取得し、該当アセットのlatestVersionIdを上書きする
  const versionDoc = await getDoc(doc(db, VERSION_COLLECTION, versionId));
  if (!versionDoc.exists()) throw new Error('Version not found');
  const assetDoc = doc(db, 'assets', assetId);
  await updateDoc(assetDoc, {
    latestVersionId: versionId,
    updatedAt: new Date().toISOString(),
  });
}

export async function fetchVersionById(versionId: string): Promise<Version | null> {
  const docRef = doc(db, VERSION_COLLECTION, versionId);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  return { id: docSnap.id, ...docSnap.data() } as Version;
}

export async function updateVersion(versionId: string, data: Partial<Version>) {
  const docRef = doc(db, VERSION_COLLECTION, versionId);
  await updateDoc(docRef, data);
} 