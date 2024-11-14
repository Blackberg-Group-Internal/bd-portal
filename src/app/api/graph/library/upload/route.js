import { uploadFileToSharePoint } from '@/app/lib/microsoft/graphHelper';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';  // Assuming you use NextAuth.js for authentication
import { authOptions } from '@/app/api/auth/[...nextauth]/route'; // Import auth options for session
import { getToken } from 'next-auth/jwt';

const secret = process.env.NEXTAUTH_SECRET;

export async function POST(req) {
  try {
    const token = await getToken({ req, secret });

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userAccessToken = token.accessToken;

    const formData = await req.formData();
    const folderPath = formData.get('folderPath');
    const files = formData.getAll('files');

    const filesBuffer = await Promise.all(
      files.map(async (file) => {
        const arrayBuffer = await file.arrayBuffer();
        return Buffer.from(arrayBuffer);
      })
    );

    const response = await uploadFileToSharePoint(folderPath, files, filesBuffer, userAccessToken);

    return NextResponse.json({ success: true, data: response });
  } catch (error) {
    console.error('Error uploading file to SharePoint:', error);
    return NextResponse.json({ error: 'File upload failed' }, { status: 500 });
  }
}
