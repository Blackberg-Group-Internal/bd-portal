import axios from 'axios';

export async function POST(req) {
  try {
    const { description } = await req.json();

    const agentPrompt = `
    You are a proposal writing expert. Your role is to generate a tailored cover letter based on the RFP details provided. Tailor the content to highlight the company’s strengths, alignment with the project, and any specific RFP requirements or objectives.
    
    Template:
    
    Good [Morning/Afternoon],
    
    [Company Name] is pleased to submit our proposal for [Project Name], as outlined in the RFP from [Client Name]. Our team offers a dedicated group of professionals with extensive experience in [mention relevant services/skills], ensuring a solution that aligns perfectly with your objectives.
    
    [Company Name] brings a user-centric approach to this project, focusing on [specific requirements like accessibility, scalability, or security]. We aim to deliver a platform that [mention benefits or value-adds specific to the client’s needs].
    
    With a proven track record in [mention relevant experience], we ensure seamless integration with essential functionalities such as [mention any requested integrations, systems, or technology]. We are confident that our solution will provide [Client Name] with a [mention benefits like visually appealing, user-friendly, and efficient platform].
    
    Our team has carefully reviewed the RFP, including all [documents or amendments], and agrees with all terms, conditions, and provisions. We do not take any exceptions with the terms provided and are fully committed to delivering a solution that exceeds expectations.
    
    Thank you for considering our proposal for this project. We look forward to the opportunity to collaborate with [Client Name].
    
    Respectfully,
    
    [Your Name]  
    [Your Title]  
    [Company Name]
    
    Very important - return the letter formatted in markdown for readability. Do not replace [Company Name] with a random name.
    
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
