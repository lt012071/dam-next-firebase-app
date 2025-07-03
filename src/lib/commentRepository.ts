import { db } from '@/firebase';
import { Comment } from '@/types/comment';
import {
  collection,
  doc,
  getDocs,
  addDoc,
  deleteDoc,
  query,
  orderBy,
  where,
  onSnapshot,
} from 'firebase/firestore';

const COMMENT_COLLECTION = 'comments';

export async function fetchComments(assetId: string): Promise<Comment[]> {
  const q = query(collection(db, COMMENT_COLLECTION), where('assetId', '==', assetId), orderBy('createdAt', 'asc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Comment));
}

export async function addComment(comment: Omit<Comment, 'id'>): Promise<string> {
  const docRef = await addDoc(collection(db, COMMENT_COLLECTION), comment);
  return docRef.id;
}

export async function deleteComment(id: string) {
  const docRef = doc(db, COMMENT_COLLECTION, id);
  await deleteDoc(docRef);
}

// コメントのリアルタイム購読
export function subscribeComments(assetId: string, callback: (comments: Comment[]) => void) {
  const q = query(
    collection(db, COMMENT_COLLECTION),
    where('assetId', '==', assetId),
    orderBy('createdAt', 'asc')
  );
  return onSnapshot(q, (snapshot) => {
    const comments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Comment));
    callback(comments);
  });
} 