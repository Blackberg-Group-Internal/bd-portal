// Import necessary modules
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import os from 'os';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file) {
      throw new Error('No file uploaded');
    }

    // Handle file upload
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const tempDir = os.tmpdir();
    const tempFilePath = path.join(tempDir, file.name);
    fs.writeFileSync(tempFilePath, buffer);

    // Create OpenAI file
    const fileStream = fs.createReadStream(tempFilePath);
    const fileResponse = await openai.files.create({
      file: fileStream,
      purpose: 'assistants',
    });
    fs.unlinkSync(tempFilePath);

    // Create vector store
    const vectorStoreResponse = await openai.beta.vectorStores.create({
      name: 'Knowledge Base Test',
    });

    // Add file to vector store
    await openai.beta.vectorStores.fileBatches.createAndPoll(vectorStoreResponse.id, {
      file_ids: [fileResponse.id],
    });

    return new Response(JSON.stringify({ vectorStoreId: vectorStoreResponse.id }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    });
  }
}
