import { addFolder } from '@/app/lib/microsoft/graphHelper';
import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

const secret = process.env.NEXTAUTH_SECRET;

export async function POST(req) {
  try {
    const { folderName, parentFolderId } = await req.json();

    const token = await getToken({ req, secret });

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userAccessToken = token.accessToken;

    console.log('API parent folder id: ' + parentFolderId);

    if (!folderName) {
      return NextResponse.json(
        { error: 'Folder name and parent folder ID are required.' },
        { status: 400 }
      );
    }

    const folderData = await addFolder(folderName, parentFolderId, userAccessToken);
    return NextResponse.json(folderData, { status: 201 });

  } catch (error) {
    console.error('Error creating folder:', error.message);
    return NextResponse.json(
      { error: 'Failed to create folder.' },
      { status: 500 }
    );
  }
}
3