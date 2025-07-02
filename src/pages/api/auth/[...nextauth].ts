import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import type { Session, User, Account } from 'next-auth';
import type { AdapterUser } from 'next-auth/adapters';
import type { JWT } from 'next-auth/jwt';

interface CustomSession extends Session {
  idToken?: string;
}

export default NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "openid email profile",
          prompt: "select_account",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async redirect({ baseUrl }: { baseUrl: string }) {
      return baseUrl + '/';
    },
    async signIn({ user }: { user: User | AdapterUser }) {
      const allowedEmail = process.env.ALLOWED_EMAIL;
      if (user.email === allowedEmail) {
        return true;
      }
      return false;
    },
    async session({ session, token }: { session: Session; token: JWT; user: AdapterUser }) {
      (session as CustomSession).idToken = token.id_token as string | undefined;
      return session;
    },
    async jwt({ token, account }: { token: JWT; account: Account | null }) {
      if (account?.id_token) {
        token.id_token = account.id_token;
      }
      return token;
    },
  },
}); 