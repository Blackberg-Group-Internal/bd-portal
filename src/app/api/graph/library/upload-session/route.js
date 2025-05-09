import { getToken } from 'next-auth/jwt';
import { createUploadSession } from '@/app/lib/microsoft/graphHelper';
import { NextResponse } from 'next/server';

const secret = process.env.NEXTAUTH_SECRET;

export async function POST(req) {
  try {
    const token = await getToken({ req, secret });

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userAccessToken = token.accessToken;

    const { folderPath, fileName } = await req.json(); 

    if (!folderPath || !fileName) {
      return NextResponse.json({ error: 'Missing folderPath or fileName' }, { status: 400 });
    }

    const uploadUrl = await createUploadSession(folderPath, fileName, userAccessToken);

    return NextResponse.json({ success: true, uploadUrl });
  } catch (error) {
    console.error('Error creating upload session:', error);
    return NextResponse.json({ error: 'Failed to create upload session' }, { status: 500 });
  }
}