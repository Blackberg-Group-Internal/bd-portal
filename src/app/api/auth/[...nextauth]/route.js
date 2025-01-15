import { fetchEmployeeHygraph } from '@/app/lib/hygraph/employees';
import NextAuth from 'next-auth';
import AzureADProvider from 'next-auth/providers/azure-ad';
import { track } from '@vercel/analytics/server';

export const authOptions = {
  providers: [
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET,
      tenantId: process.env.AZURE_AD_TENANT_ID,
      authorization: {
        params: {
          scope: 'openid email profile User.Read Files.ReadWrite.All Sites.Manage.All offline_access',
        },
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
      if (account && user) {
        token.accessToken = account.access_token;
        token.accessTokenExpires = account.expires_at * 1000;
        token.refreshToken = account.refresh_token;
        token.user = user;
      }

      if (Date.now() >= token.accessTokenExpires) {
        token = await refreshAccessToken(token);
      }

      return token;
    },
    async session({ session, token }) {
      session.user = token.user;
      session.accessToken = token.accessToken;
      session.error = token.error;
      console.log('Session user: ', session.user);
      track('Login', { user: session.user.id, name: session.user.name });

      // try {
      // const firstName = session.user.name.split(' ')[0];
      // const lastName = session.user.name.split(' ')[1];

      // const hygraphUser = await fetchEmployeeHygraph(firstName, lastName);

      //   if (hygraphUser && hygraphUser[0]?.image?.url) {
      //     session.user.hygraphImage = hygraphUser[0].image.url; 
      //   }
      // } catch (error) {
      //   console.error("Error fetching route Hygraph user data:", error);
      // }

      return session;
    },
  },
  pages: {
    signIn: '/login',
    signOut: '/login',
    error: '/auth/error',
  },
};

export async function POST(req, res) {
  return NextAuth(authOptions)(req, res);
}

export async function GET(req, res) {
  return NextAuth(authOptions)(req, res);
}

async function refreshAccessToken(token) {
  try {
    const url =
      `https://login.microsoftonline.com/${process.env.AZURE_AD_TENANT_ID}/oauth2/v2.0/token`;
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.AZURE_AD_CLIENT_ID,
        client_secret: process.env.AZURE_AD_CLIENT_SECRET,
        grant_type: 'refresh_token',
        refresh_token: token.refreshToken,
        scope: 'openid email profile User.Read Files.ReadWrite.All Sites.Manage.All offline_access',
      }),
      method: 'POST',
    });

    const refreshedTokens = await response.json();

    if (!response.ok) {
      throw refreshedTokens;
    }

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      accessTokenExpires: Date.now() + refreshedTokens.expires_in * 1000,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken, 
    };
  } catch (error) {
    console.error('Error refreshing access token:', error);
    return {
      ...token,
      error: 'RefreshAccessTokenError',
    };
  }
}
