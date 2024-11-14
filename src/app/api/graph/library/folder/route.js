import { getFolderContents } from '@/app/lib/microsoft/graphHelper';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const folderId = searchParams.get('folderId');

  if (!folderId) {
    return new Response(
      JSON.stringify({ error: 'Missing folderId' }),
      { status: 400 }
    );
  }

  try {
    const folderContents = await getFolderContents(folderId);
    return new Response(JSON.stringify(folderContents), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
