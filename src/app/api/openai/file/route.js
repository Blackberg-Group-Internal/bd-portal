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
    console.log('OpenAI requrest: ', req);
    const formData = await req.formData();
    const file = formData.get('file');
    console.log('OpenAI requrest file: ', file);

    if (!file) {
      throw new Error('No file uploaded');
    }

    // Handle file upload
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const tempDir = os.tmpdir();
    const tempFilePath = path.join(tempDir, file.name);
    fs.writeFileSync(tempFilePath, buffer);

    console.log('OpenAI temp file path: ', tempFilePath);

    // Create OpenAI file
    const fileStream = fs.createReadStream(tempFilePath);
    const fileResponse = await openai.files.create({
      file: fileStream,
      purpose: 'assistants',
    });
    fs.unlinkSync(tempFilePath);

    console.log('OpenAI temp file stream: ', fileStream);

    // Create vector store
    const vectorStoreResponse = await openai.beta.vectorStores.create({
      name: 'Knowledge Base Test',
    });

    console.log('OpenAI vector store response: ', vectorStoreResponse);

    // Add file to vector store
    await openai.beta.vectorStores.fileBatches.createAndPoll(vectorStoreResponse.id, {
      file_ids: [fileResponse.id],
    });

    console.log('OpenAI vector store file: ', vectorStoreResponse.id);

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
