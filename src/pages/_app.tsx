import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { SessionProvider } from "next-auth/react";
import Layout from "@/components/Layout";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { getAuth, signInWithCredential, GoogleAuthProvider } from 'firebase/auth';
import { app } from '@/firebase';

export default function App({ Component, pageProps }: AppProps) {
  function AuthGuard({ children }: { children: React.ReactNode }) {
    const { status } = useSession();
    const router = useRouter();
    useEffect(() => {
      if (status === "unauthenticated") {
        router.push("/api/auth/signin");
      }
    }, [status, router]);
    return <>{children}</>;
  }

  function AuthSync() {
    const { data: session } = useSession();
    useEffect(() => {
      if (session && (session as any).idToken) {
        const idToken = (session as any).idToken;
        const auth = getAuth(app);
        const credential = GoogleAuthProvider.credential(idToken);
        signInWithCredential(auth, credential)
          .then((userCredential) => {
            console.log("Firebase Auth signInWithCredential success:", userCredential.user);
          })
          .catch((err) => {
            console.error("Firebase Auth signInWithCredential error:", err);
          });
      }
    }, [session]);
    return null;
  }

  return (
    <SessionProvider session={pageProps.session}>
      <AuthSync />
      <AuthGuard>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </AuthGuard>
    </SessionProvider>
  );
}
