import { getFileDownloadUrl } from '@/app/lib/microsoft/graphHelper';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const fileId = searchParams.get('fileId');

  if (!fileId) {
    return new Response(
      JSON.stringify({ error: 'Missing fileId' }),
      { status: 400 }
    );
  }

  try {
    const fileDownloadUrl = await getFileDownloadUrl(fileId);
    return new Response(JSON.stringify({ downloadUrl: fileDownloadUrl }), {
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
