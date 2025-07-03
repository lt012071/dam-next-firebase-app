import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Login from '../../pages/login';

jest.mock('next/image', () => () => null);

const mockReplace = jest.fn();
jest.mock('next/router', () => ({
  useRouter: () => ({ replace: mockReplace })
}));

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));
const { useAuth } = jest.requireMock('@/contexts/AuthContext');

describe('Login page', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('タイトルとGoogleログインボタンが表示される', () => {
    useAuth.mockReturnValue({ user: null, signInWithGoogle: jest.fn() });
    render(<Login />);
    expect(screen.getByText('Digital Asset Management')).toBeInTheDocument();
    expect(screen.getByText('Googleでログイン')).toBeInTheDocument();
  });

  it('Googleログインボタン押下でsignInWithGoogleが呼ばれる', () => {
    const signInWithGoogle = jest.fn();
    useAuth.mockReturnValue({ user: null, signInWithGoogle });
    render(<Login />);
    fireEvent.click(screen.getByText('Googleでログイン'));
    expect(signInWithGoogle).toHaveBeenCalled();
  });

  it('userが存在する場合はリダイレクトされる', () => {
    useAuth.mockReturnValue({ user: { uid: 'u' }, signInWithGoogle: jest.fn() });
    render(<Login />);
    expect(mockReplace).toHaveBeenCalledWith('/');
  });
}); 