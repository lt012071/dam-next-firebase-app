import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Home from '../../pages/index';

jest.mock('next/image', () => () => null);
jest.mock('next/font/google', () => ({ Geist: () => ({}), Geist_Mono: () => ({}) }));
jest.mock('next/head', () => () => null);

jest.mock('@/contexts/AuthContext', () => ({ useAuth: jest.fn() }));
const { useAuth } = jest.requireMock('@/contexts/AuthContext');

describe('Home page', () => {
  afterEach(() => { jest.clearAllMocks(); });

  it('主要なUI要素が表示される', () => {
    useAuth.mockReturnValue({ user: null, signInWithGoogle: jest.fn() });
    render(<Home />);
    const listItems = screen.getAllByRole('listitem');
    expect(listItems[0].textContent).toContain('Get started by editing');
    expect(listItems[0].textContent).toContain('src/pages/index.tsx');
    expect(screen.getByText('Deploy now')).toBeInTheDocument();
    expect(screen.getByText('Read our docs')).toBeInTheDocument();
    expect(screen.getByText('Learn')).toBeInTheDocument();
    expect(screen.getByText('Examples')).toBeInTheDocument();
    expect(screen.getByText('Go to nextjs.org →')).toBeInTheDocument();
  });

  it('Googleログインボタンが表示され、押下でsignInWithGoogleが呼ばれる', () => {
    const signInWithGoogle = jest.fn();
    useAuth.mockReturnValue({ user: null, signInWithGoogle });
    render(<Home />);
    const btn = screen.getByText('Googleでログイン');
    fireEvent.click(btn);
    expect(signInWithGoogle).toHaveBeenCalled();
  });

  it('userが存在する場合はGoogleログインボタンが表示されない', () => {
    useAuth.mockReturnValue({ user: { uid: 'u' }, signInWithGoogle: jest.fn() });
    render(<Home />);
    expect(screen.queryByText('Googleでログイン')).toBeNull();
  });
}); 