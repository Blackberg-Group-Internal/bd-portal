import { getFileDetails, deleteFileFromFavorites } from '@/app/lib/microsoft/graphHelper';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const fileId = searchParams.get('fileId');

  if (!fileId) {
    return new Response(JSON.stringify({ error: 'Missing fileId' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const fileDetails = await getFileDetails(fileId);
    return new Response(JSON.stringify(fileDetails), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
