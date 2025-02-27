import axios from 'axios';

export async function POST(req) {
  try {
    const { description } = await req.json();

    const agentPrompt = `
        Generate a playlist of 10 songs based on the user's description. The playlist should match the user's specified mood, genre, tempo, era, or any additional preferences they provide. Each song should be well-known and fit the given theme.

        **Do not include any explicit songs or songs.** The playlist should be family-friendly and suitable for all audiences.

        Strictly return the result as a JSON array with each song having the properties: "title" (song name) and "artist" (artist name). Do not include any explanations, formatting, or additional text—only valid JSON.

        User Input: ${description}
    `;

    const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4-turbo', 
          messages: [
            { role: 'system', content: agentPrompt },
          ],
          max_tokens: 3000
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',   
          },
          timeout: 30000 
        },
      );
  
      console.log('Analyze AI Response: ', response.data);
      console.log('Analyze AI Response: ', response.data.choices[0]);
  
      let content = response.data.choices[0].message.content;
  
      if (content.startsWith('```json') && content.endsWith('```')) {
        content = content.slice(7, -3);
      }
  
      return new Response(JSON.stringify({ analysis: JSON.parse(content) }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
  } catch (error) {
    console.log('Analyze error: ', error);
    const errorMessage = error.response
      ? `OpenAI API Error: ${error.response.data.error.message}`
      : 'Unknown error communicating with OpenAI API';

    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
