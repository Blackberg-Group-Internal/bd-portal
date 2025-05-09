import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req) {
  try {
    const { threadId, assistantId } = await req.json();

    const run = await openai.beta.threads.runs.create(threadId, {
      assistant_id: assistantId,
    });

    return new Response(
      JSON.stringify({
        success: true,
        runId: run.id,
        status: run.status,
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);

    return new Response(
      JSON.stringify({
        error: error.message || 'Unknown error occurred',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
