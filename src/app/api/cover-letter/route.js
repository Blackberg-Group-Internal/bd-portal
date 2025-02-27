import axios from 'axios';

export async function POST(req) {
  try {
    const { description } = await req.json();

    const agentPrompt = `
    You are a proposal writing expert. Your role is to generate a tailored cover letter based on the RFP details provided. Tailor the content to highlight the company’s strengths, alignment with the project, and any specific RFP requirements or objectives.
    
    Very important - return the letter formatted in markdown for readability. Do not replace [Company Name] with a random name. Do not return the work markdown.
    
    Template:
    
    Blackberg Group is pleased to submit our proposal for the National Forest Foundation’s website redesign and development project. Our team specializes in providing strategic branding, marketing, web design, and user engagement solutions tailored specifically for public sector organizations. We are committed to enhancing NFF’s mission by creating a dynamic digital presence that not only showcases the importance of healthy forests but also fosters deeper engagement with your community of supporters.

    We understand that the primary objective of this initiative is to communicate NFF’s impactful story effectively while encouraging visitor interaction and support. Leveraging our extensive experience with similar projects, including our work with the Department of Veterans Affairs, we take a purpose-driven approach to branding and digital engagement. Our strategy emphasizes storytelling that resonates with diverse audiences, ensuring that every visitor not only understands the significance of the NFF's mission but also feels empowered to contribute.

    At Blackberg, we prioritize accessibility and inclusivity in our designs, employing user-centered methodologies that facilitate engagement from all individuals, particularly those who may face barriers to access. Our focused and strategic marketing initiatives are designed to reach various communities, effectively promoting awareness and interaction with your invaluable programs.

    Having thoroughly reviewed the RFP and all related materials, we fully agree to all terms, conditions, and provisions set forth. Our team is dedicated to delivering a comprehensive and results-driven digital solution that meets and exceeds the expectations of the National Forest Foundation.

    Thank you for considering our proposal. We are excited about the opportunity to collaborate with NFF in crafting a modern, engaging, and effective outreach platform that supports your mission and empowers your community.

    
    Respectfully,
    
    [Your Name]  
    [Your Title]  
    [Company Name]
    
    End of Template | 

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
        model: 'gpt-4o-mini',
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
