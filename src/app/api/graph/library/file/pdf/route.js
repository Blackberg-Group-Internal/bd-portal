import { convertFileToPDF } from '@/app/lib/microsoft/graphHelper';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const fileId = searchParams.get('fileId');
    if (!fileId) {
        return new Response(JSON.stringify({ error: 'Missing parameters' }), { status: 400 });
    }

    try {
        const pdfStream = await convertFileToPDF(fileId);
        return new Response(pdfStream, {
            status: 200,
            headers: { 'Content-Type': 'application/pdf' }
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}
