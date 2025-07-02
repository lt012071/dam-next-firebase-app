import React, { ReactNode } from "react";
import styles from "@/styles/Layout.module.css";
import Image from "next/image";
import { useRouter } from "next/router";
import { useSession, signIn, signOut } from "next-auth/react";
import { useState, useRef, useEffect } from "react";

interface LayoutProps {
  children: ReactNode;
}

const menuItems = [
  { label: "Dashboard", path: "/dashboard" },
  { label: "Assets", path: "/assets" },
  // 必要に応じて他のメニューもルーティング先を指定
  // { label: "Collections", path: "/collections" },
  // { label: "Workflows", path: "/workflows" },
  // { label: "Reports", path: "/reports" },
];

export default function Layout({ children }: LayoutProps) {
  const router = useRouter();
  const pathname = typeof window !== 'undefined' ? window.location.pathname : "";
  // Next.js 13以降は usePathname() も利用可
  // const pathname = usePathname();

  return (
    <div className={styles.layoutRoot}>
      <aside className={styles.sidebar}>
        <div className={styles.logoArea}>
          <Image src="/icon1.svg" alt="Logo" width={32} height={32} />
          <span className={styles.logoText}>AssetFlow</span>
        </div>
        <nav className={styles.menu}>
          {menuItems.map(item => (
            <button
              key={item.path}
              className={
                styles.menuItem + (pathname.startsWith(item.path) ? " " + styles.menuItemActive : "")
              }
              onClick={() => router.push(item.path)}
              type="button"
              style={{cursor:'pointer'}}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </aside>
      <div className={styles.mainArea}>
        <header className={styles.header}>
          <div style={{ display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'space-between' }}>
            <div className={styles.searchBox}>
              <Image src="/search_icon.svg" alt="Search" width={20} height={20} />
              <input className={styles.searchInput} type="text" placeholder="Search" />
            </div>
            <AccountMenu />
          </div>
        </header>
        <main className={styles.content}>{children}</main>
      </div>
    </div>
  );
}

// ヘッダー右側のアカウントメニュー
function AccountMenu() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // 外部クリックでメニューを閉じる
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  if (status === "loading") return null;
  if (session?.user) {
    return (
      <div ref={menuRef} style={{ position: "relative", marginLeft: 24 }}>
        <button
          onClick={() => setOpen((v) => !v)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
          }}
        >
          {session.user.image && (
            <Image src={session.user.image} alt="user icon" width={32} height={32} style={{ borderRadius: "50%" }} />
          )}
          <span style={{ fontWeight: 500 }}>{session.user.name || session.user.email}</span>
        </button>
        {open && (
          <div
            style={{
              position: "absolute",
              right: 0,
              top: 40,
              background: "#fff",
              border: "1px solid #eee",
              borderRadius: 8,
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              minWidth: 120,
              zIndex: 100,
              padding: 8,
            }}
          >
            <button
              onClick={() => { setOpen(false); signOut({ callbackUrl: '/api/auth/signin' }); }}
              style={{
                width: "100%",
                background: "none",
                border: "none",
                padding: "8px 0",
                cursor: "pointer",
                textAlign: "left",
                fontWeight: 500,
              }}
            >ログアウト</button>
          </div>
        )}
      </div>
    );
  } else {
    return (
      <button
        onClick={() => signIn(undefined, { callbackUrl: '/' })}
        style={{
          marginLeft: 24,
          background: "none",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: 0,
        }}
        aria-label="ログイン"
      >
        <Image src="/account_circle.svg" alt="login" width={32} height={32} />
        <span style={{ fontWeight: 500, color: '#0D80F2' }}>ログイン</span>
      </button>
    );
  }
} 