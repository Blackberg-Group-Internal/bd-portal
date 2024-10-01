import axios from 'axios';

export async function POST(request) {
  try {
    const { title, description } = await request.json();

    // Create a prompt for ChatGPT based on the title and description
    const prompt = `Analyze the following RFP title and description and provide a summary:
    Title: ${title}
    Description: ${description}`;

    // Make a request to the ChatGPT API
    const chatGptResponse = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an AI that analyzes and summarizes RFPs.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, 
          'Content-Type': 'application/json'
        },
      }
    );

    const aiSummary = chatGptResponse.data.choices[0].message.content;

    // Return the AI analysis
    return new Response(JSON.stringify({ aiSummary }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error processing ChatGPT request:', error);
    return new Response(JSON.stringify({ error: 'Failed to process AI analysis' }), { status: 500 });
  }
}
