import React, { useEffect } from "react";
import styles from "@/styles/LoginPage.module.css";
import { useAuth } from "@/contexts/AuthContext";
import Image from "next/image";
import { useRouter } from "next/router";

export default function Login() {
  const { user, signInWithGoogle } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.replace("/");
    }
  }, [user, router]);

  return (
    <div className={styles.loginRoot} style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f7f8fa' }}>
      <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', padding: 40, minWidth: 320, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 32, letterSpacing: 1 }}>Digital Asset Management</h1>
        <button
          onClick={() => signInWithGoogle()}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            background: '#fff',
            border: '1px solid #ddd',
            borderRadius: 8,
            padding: '12px 32px',
            fontSize: 18,
            fontWeight: 500,
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            transition: 'box-shadow 0.2s',
          }}
        >
          <Image src="/google.svg" alt="Google" width={24} height={24} />
          Googleでログイン
        </button>
      </div>
    </div>
  );
} 