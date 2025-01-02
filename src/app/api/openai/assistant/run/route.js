import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req) {
  const headers = new Headers({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const { threadId, assistantId } = await req.json();
        const aiStream = await openai.beta.threads.runs.stream(threadId, {
          assistant_id: assistantId,
        });

        for await (const event of aiStream) {
          const serializedEvent = `data: ${JSON.stringify(event)}\n\n`;
          controller.enqueue(encoder.encode(serializedEvent));
        }

        controller.close();
      } catch (error) {
        console.error('Error:', error);
        const errorMessage =
          error.response?.data?.error?.message || error.message || 'Unknown error occurred';
        controller.enqueue(encoder.encode(`data: Error: ${errorMessage}\n\n`));
        controller.close();
      }
    },
  });

  return new Response(stream, { headers });
}
