import { getDocumentLibraryContents } from '@/app/lib/microsoft/graphHelper';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const libraryId = searchParams.get('libraryId') || 'b!xE8fh30nt0SHdnWdXFHEKTzU3LKnVJJAsgMV8Ij6KKRtXG_wHCViQoQJbMU201re';  // Modify accordingly
    
    const libraryContents = await getDocumentLibraryContents(libraryId);

    return new Response(JSON.stringify(libraryContents), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}
