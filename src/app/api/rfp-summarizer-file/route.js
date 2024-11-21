import { NextResponse } from 'next/server';
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
        const formData = await req.formData();
        const file = formData.get('file');

        if (!file) {
          throw new Error('No file uploaded');
        }

        const arrayBuffer = await file.arrayBuffer();
        const blob = new Blob([arrayBuffer], { type: file.type });

        // Prepare FormData to handle file upload
        const uploadFormData = new FormData();
        uploadFormData.append('file', blob, file.name);
        uploadFormData.append('purpose', 'assistants');

        // Upload the file to OpenAI
        const response = await openai.files.create({
          file: file,
          purpose: "assistants",
        });

        console.log('File Upload Response', response);

        const fileId = response.id;

        console.log('File ID: ' + fileId);

        // Create a vector store for the knowledge base
        const vectorStoreResponse = await openai.beta.vectorStores.create({
          name: "Knowledge Base Test",
        });

        console.log('Vector Store response: ', vectorStoreResponse);

        const vectorStoreId = vectorStoreResponse.id;

        console.log('Vector Store ID: ' + vectorStoreId);

        // Add the file to the vector store
        await openai.beta.vectorStores.fileBatches.createAndPoll(vectorStoreId, {
          file_ids: [fileId],
        });

        // Create an assistant using the file in the vector store
        const assistantResponse = await openai.beta.assistants.create({
          model: 'gpt-4-turbo',
          instructions: "You are an expert in government contracts and procurement processes. Your role is to extract the most relevant details from a government contract opportunity and provide a structured assessment",
          tools: [{ type: "file_search" }],
          tool_resources: {
            file_search: {
              vector_store_ids: [vectorStoreId],
            },
          },
        });

        console.log('Assistant Response: ', assistantResponse);

        const assistantId = assistantResponse.id;

        const userPrompt = `
    You are an expert in government contracts and procurement processes. Your role is to extract the most relevant details from a government contract opportunity and provide a structured assessment based on the company's expertise in **Strategy, Communications, Organizational Effectiveness, and Operations**.

    You are given the content of a Request for Proposal (RFP) document. Your task is to summarize the RFP by focusing on the following key areas:

    Summary: Provide a summary of the essential purpose of the RFP, including the services requested, the main objectives, and the outcomes expected.
    
    Scope of Work: Identify and list the main responsibilities and tasks required of the contractor. Highlight any specific deliverables mentioned.
    
    Important Dates: Include all critical dates such as the proposal submission deadline, project start date, and any other key milestones mentioned. 
    `;

        const threadResponse = await openai.beta.threads.create();
        console.log('Thread', threadResponse);

        const messageResponse = await openai.beta.threads.messages.create(threadResponse.id, {
          role: "user",
          content: userPrompt,
        });

        console.log('Message Response: ', messageResponse);

        const runResponse = await openai.beta.threads.runs.create(threadResponse.id, {
          assistant_id: assistantId,
          stream: true,
        });

        console.log('run response', runResponse);

        return new Response(
            new ReadableStream({
              async start(controller) {
                // Get a stream reader from the OpenAI response
                const reader = runResponse.body.getReader();
                const decoder = new TextDecoder();
                let done = false;
      
                // Read the stream in chunks
                while (!done) {
                  const { value, done: readerDone } = await reader.read();
                  done = readerDone;
      
                  if (value) {
                    const chunk = decoder.decode(value);
                    controller.enqueue(`data: ${chunk}\n\n`);
                  }
                }
      
                // Close the stream
                controller.close();
              },
            }),
            {
              headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
              },
            }
          );

      } catch (error) {
        console.error('Error: ', error);
        const errorMessage = error.response?.data?.error?.message || error.message || 'Unknown error occurred';
        controller.enqueue(encoder.encode(`data: Error: ${errorMessage}\n\n`));
        controller.close();
      }
    },
  });

  return new Response(stream, { headers });
}
