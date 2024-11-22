import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req) {
  // Set up the response headers for Server-Sent Events (SSE)
  const headers = new Headers({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });

  const encoder = new TextEncoder();

  // Create a ReadableStream to send data progressively to the client
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const { threadId, assistantId, userMessage } = await req.json();

        // Create a new message in the thread
        const messageResponse = await openai.beta.threads.messages.create(threadId, {
          role: "user",
          content: userMessage,
        });

        console.log('Message Response: ', messageResponse);

        // Start a new run for the assistant to respond
        const aiStream = await openai.beta.threads.runs.stream(threadId, {
          assistant_id: assistantId,
        });

        // Stream the events from OpenAI to the client
        for await (const event of aiStream) {
          // Serialize the event data and send it to the client
          const serializedEvent = `data: ${JSON.stringify(event)}\n\n`;
          console.log('Event:', event);
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
