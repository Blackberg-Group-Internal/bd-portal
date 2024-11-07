import { uploadFileToSharePoint } from '@/app/lib/microsoft/graphHelper';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const formData = await req.formData();
    const folderPath = formData.get('folderPath');
    const files = formData.getAll('files');

    const filesBuffer = await Promise.all(
      files.map(async (file) => {
        const arrayBuffer = await file.arrayBuffer();
        return Buffer.from(arrayBuffer);
      })
    );

    const response = await uploadFileToSharePoint(folderPath, files, filesBuffer);

    return NextResponse.json({ success: true, data: response });
  } catch (error) {
    console.error('Error uploading file to SharePoint:', error);
    return NextResponse.json({ error: 'File upload failed' }, { status: 500 });
  }
}
