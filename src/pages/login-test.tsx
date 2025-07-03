import React, { useState, useEffect } from "react";
import styles from "@/styles/LoginPage.module.css";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { app } from "@/firebase";
import { useRouter } from "next/router";

export default function LoginTest() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (process.env.NODE_ENV === "production" && !process.env.CI) {
      router.replace("/404");
    }
  }, [router]);

  if (process.env.NODE_ENV === "production" && !process.env.CI) {
    return null;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const auth = getAuth(app);
      await signInWithEmailAndPassword(auth, email, password);
      router.replace("/");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError("ログインに失敗しました: " + err.message);
      } else {
        setError("ログインに失敗しました: 不明なエラー");
      }
    }
  };

  return (
    <div className={styles.loginRoot} style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f7f8fa' }}>
      <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', padding: 40, minWidth: 320, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 32, letterSpacing: 1 }}>E2Eテスト用ログイン</h1>
        <form onSubmit={handleLogin} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <input
            type="email"
            placeholder="メールアドレス"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            style={{ padding: 12, borderRadius: 8, border: '1px solid #ddd', fontSize: 16 }}
            aria-label="メールアドレス"
          />
          <input
            type="password"
            placeholder="パスワード"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            style={{ padding: 12, borderRadius: 8, border: '1px solid #ddd', fontSize: 16 }}
            aria-label="パスワード"
          />
          <button
            type="submit"
            style={{ background: '#1976d2', color: '#fff', border: 'none', borderRadius: 8, padding: '12px 0', fontSize: 18, fontWeight: 500, cursor: 'pointer' }}
          >
            ログイン
          </button>
        </form>
        {error && <div style={{ color: 'red', marginTop: 16 }}>{error}</div>}
      </div>
    </div>
  );
} 