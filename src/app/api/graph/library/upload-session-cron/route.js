import { getToken } from 'next-auth/jwt';
import { createUploadSessionCron } from '@/app/lib/microsoft/graphHelper';
import { getSystemAccessToken } from '@/app/lib/microsoft/getSystemAccessToken';
import { NextResponse } from 'next/server';

const secret = process.env.NEXTAUTH_SECRET;

export async function POST(req) {
  try {

    const { folderPath, fileName } = await req.json(); 

    if (!folderPath || !fileName) {
      return NextResponse.json({ error: 'Missing folderPath or fileName' }, { status: 400 });
    }

    const uploadUrl = await createUploadSessionCron(folderPath, fileName);

    return NextResponse.json({ success: true, uploadUrl });
  } catch (error) {
    console.error('Error creating upload session:', error);
    return NextResponse.json({ error: 'Failed to create upload session' }, { status: 500 });
  }
}