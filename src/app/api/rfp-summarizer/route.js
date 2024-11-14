import axios from 'axios';

export async function POST(req) {
  try {
    const { description } = await req.json();

    const agentPrompt = `
    You are an expert in government contracts and procurement processes. Your role is to extract the most relevant details from a government contract opportunity and provide a structured assessment based on the company's expertise in **Strategy, Communications, Organizational Effectiveness, and Operations**.

    You are given the content of a Request for Proposal (RFP) document. Your task is to summarize the RFP by focusing on the following key areas:

    Summary: Provide a summary of the essential purpose of the RFP, including the services requested, the main objectives, and the outcomes expected.
    
    Scope of Work: Identify and list the main responsibilities and tasks required of the contractor. Highlight any specific deliverables mentioned.
    
    Important Dates: Include all critical dates such as the proposal submission deadline, project start date, and any other key milestones mentioned. 

    RFP Details:  
    ${description}
    `;

    const response = await axios({
      method: 'post',
      url: 'https://api.openai.com/v1/chat/completions',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      data: {
        model: 'gpt-4',
        messages: [{ role: 'system', content: agentPrompt }],
        stream: true, 
        max_tokens: 3000,
      },
      responseType: 'stream',
    });

    return new Response(response.data, {
      status: 200,
      headers: { 'Content-Type': 'text/event-stream' },
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
