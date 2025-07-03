import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import Layout from '../../components/Layout';

jest.mock('next/router', () => ({
  useRouter: () => ({ push: jest.fn() })
}));

jest.mock('next/image', () => () => null);

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { displayName: 'テストユーザー', email: 'test@example.com', photoURL: '/user.png' },
    loading: false,
    signInWithGoogle: jest.fn(),
    signOut: jest.fn(),
  })
}));

describe('Layout', () => {
  it('子要素を表示する', () => {
    render(<Layout><div>子要素テスト</div></Layout>);
    expect(screen.getByText('子要素テスト')).toBeInTheDocument();
  });

  it('サイドバーのメニューが表示される', () => {
    render(<Layout>content</Layout>);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Assets')).toBeInTheDocument();
  });

  it('アカウントメニューが表示される', () => {
    render(<Layout>content</Layout>);
    expect(screen.getByText('テストユーザー')).toBeInTheDocument();
  });

  it('ログアウトボタンがクリックで表示される', () => {
    render(<Layout>content</Layout>);
    const userBtn = screen.getByText('テストユーザー');
    fireEvent.click(userBtn);
    expect(screen.getByText('ログアウト')).toBeInTheDocument();
  });
}); 