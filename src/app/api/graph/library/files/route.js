import { getDocumentLibraryAllFiles, getRecentFiles } from '@/app/lib/microsoft/graphHelper';

export async function GET(request) {
  try {
    const { headers } = request;

    const recentFiles = await getDocumentLibraryAllFiles();

    return new Response(JSON.stringify(recentFiles), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}
