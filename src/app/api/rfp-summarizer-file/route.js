import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import os from 'os';

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
        // Get form data from the request
        const formData = await req.formData();
        const file = formData.get('file');

        if (!file) {
          throw new Error('No file uploaded');
        }

        // Read the file into a Buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Write the buffer to a temporary file
        const tempDir = os.tmpdir();
        const tempFilePath = path.join(tempDir, file.name);
        fs.writeFileSync(tempFilePath, buffer);

        // Create a ReadStream from the temporary file
        const fileStream = fs.createReadStream(tempFilePath);

        // Upload the file to OpenAI
        const response = await openai.files.create({
          file: fileStream,
          purpose: 'assistants',
        });

        // Clean up the temporary file
        fs.unlinkSync(tempFilePath);

        console.log('File Upload Response', response);

        const fileId = response.id;
        console.log('File ID:', fileId);

        // Create a vector store for the knowledge base
        const vectorStoreResponse = await openai.beta.vectorStores.create({
          name: 'Knowledge Base Test',
        });

        console.log('Vector Store Response:', vectorStoreResponse);

        const vectorStoreId = vectorStoreResponse.id;
        console.log('Vector Store ID:', vectorStoreId);

        // Add the file to the vector store
        await openai.beta.vectorStores.fileBatches.createAndPoll(vectorStoreId, {
          file_ids: [fileId],
        });

        // Create an assistant using the file in the vector store
        const assistantResponse = await openai.beta.assistants.create({
          model: 'gpt-4-turbo-preview',
          instructions:
            'You are an expert in government contracts and procurement processes. Your role is to extract the most relevant details from a government contract opportunity and provide a structured assessment.',
          tools: [{ type: 'file_search' }],
          tool_resources: {
            file_search: {
              vector_store_ids: [vectorStoreId],
            },
          },
        });

        console.log('Assistant Response:', assistantResponse);

        const assistantId = assistantResponse.id;

        const userPrompt = `
You are an expert in government contracts and procurement processes. Your role is to extract the most relevant details from a government contract opportunity and provide a structured assessment based on the company's expertise in **Strategy, Communications, Organizational Effectiveness, and Operations**.

You are given the content of a Request for Proposal (RFP) document. Your task is to summarize the RFP by focusing on the following key areas:

Summary: Provide a summary of the essential purpose of the RFP, including the services requested, the main objectives, and the outcomes expected.

Scope of Work: Identify and list the main responsibilities and tasks required of the contractor. Highlight any specific deliverables mentioned.

Important Dates: Include all critical dates such as the proposal submission deadline, project start date, and any other key milestones mentioned.
        `;

        // Create a new thread
        const threadResponse = await openai.beta.threads.create();
        console.log('Thread Response:', threadResponse);

        // Add the user's message to the thread
        const messageResponse = await openai.beta.threads.messages.create(threadResponse.id, {
          role: 'user',
          content: userPrompt,
        });

        console.log('Message Response:', messageResponse);

        // Run the assistant and get a streaming response
        const aiStream = await openai.beta.threads.runs.stream(threadResponse.id, {
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
