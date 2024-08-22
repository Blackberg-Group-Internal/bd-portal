import NextAuth from 'next-auth';
import AzureADProvider from 'next-auth/providers/azure-ad';

export const authOptions = {
  providers: [
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET,
      tenantId: process.env.AZURE_AD_TENANT_ID,
      authorization: {
        params: { scope: 'openid email profile User.Read offline_access' },
      },
      httpOptions: { timeout: 10000 },
      debug: true,
    }),
  ],
  session: {
    strategy: "jwt", 
  },
  callbacks: {
    async jwt({ token, user, account }) {
      console.log("JWT Callback - Account:", account);
      console.log("JWT Callback - User:", user);
      console.log("JWT Callback - Token before:", token);

      if (account && user) {
        token.accessToken = account.id_token;
        token.accessTokenExpires = account.expires_at * 1000;
        token.refreshToken = account.refresh_token;
        token.user = user;
      } else if (Date.now() >= token.accessTokenExpires) {
        console.log("JWT Callback - Access token expired");
        token.error = 'AccessTokenExpired';
      }

      console.log("JWT Callback - Token after:", token);
      return token;
    },
    async session({ session, token }) {
      console.log("Session Callback - Session before:", session);
      console.log("Session Callback - Token:", token);

      session.user = token.user;
      session.accessToken = token.accessToken;
      session.error = token.error;

      console.log("Session Callback - Session after:", session);
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
  },
};

export async function POST(req, res) {
  return NextAuth(authOptions)(req, res);
}

export async function GET(req, res) {
  return NextAuth(authOptions)(req, res);
}
