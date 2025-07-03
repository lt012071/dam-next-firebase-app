import {
  fetchComments,
  addComment,
  deleteComment,
  subscribeComments
} from '../../lib/commentRepository';
import { Comment } from '@/types/comment';
import { Query, QuerySnapshot } from 'firebase/firestore';

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
  onSnapshot: jest.fn(),
}));

describe('commentRepository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetchComments: コメント一覧取得', async () => {
    const mockDocs = [
      { id: '1', data: () => ({ assetId: 'a', text: 'c1', user: 'u', createdAt: '' }) },
      { id: '2', data: () => ({ assetId: 'a', text: 'c2', user: 'u', createdAt: '' }) },
    ];
    const getDocs = jest.requireMock('firebase/firestore').getDocs;
    getDocs.mockResolvedValue({ docs: mockDocs });
    const comments = await fetchComments('a');
    expect(comments.length).toBe(2);
    expect(comments[0].text).toBe('c1');
  });

  it('addComment: 正常にIDを返す', async () => {
    const addDoc = jest.requireMock('firebase/firestore').addDoc;
    addDoc.mockResolvedValue({ id: 'newid' });
    const id = await addComment({ assetId: 'a', user: 'u', text: 't', createdAt: '' });
    expect(id).toBe('newid');
  });

  it('deleteComment: deleteDocが呼ばれる', async () => {
    const deleteDoc = jest.requireMock('firebase/firestore').deleteDoc;
    deleteDoc.mockResolvedValue(undefined);
    await deleteComment('id');
    expect(deleteDoc).toHaveBeenCalled();
  });

  it('subscribeComments: onSnapshotが呼ばれる', () => {
    const onSnapshot = jest.requireMock('firebase/firestore').onSnapshot;
    onSnapshot.mockImplementation((q: Query, cb: (snapshot: QuerySnapshot<Comment>) => void) => {
      cb({ docs: [
        { id: '1', data: () => ({ assetId: 'a', text: 'c1', user: 'u', createdAt: '' }) },
      ] } as unknown as QuerySnapshot<Comment>);
      return 'unsubscribe';
    });
    const callback = jest.fn();
    const unsub = subscribeComments('a', callback);
    expect(callback).toHaveBeenCalledWith([
      expect.objectContaining({ text: 'c1' })
    ]);
    expect(unsub).toBe('unsubscribe');
  });
}); 