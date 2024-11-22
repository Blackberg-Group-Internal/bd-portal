import axios from 'axios';

export async function POST(req) {
  try {
    const { description } = await req.json();

    const agentPrompt = `
    You are an expert in government contracts and procurement processes. Your role is to extract the most relevant details from a government contract opportunity and provide a structured assessment based on the company's expertise in **Strategy, Communications, Organizational Effectiveness, and Operations**.

    Your analysis should include the following:

    ### 1. **Scope of Analysis**:
       - Extract key information and output the result in the following JSON format:
         - "NAICS": "Relevant NAICS code(s) that align with the opportunity - only the code(s) never the description"
         - "Total Match Score": "Calculated match score and round it up to a whole number."
         - "Match Summary": "Summarize why this contract is a good fit for the company, using specific headlines for different relevant areas like skills, services, and expertise. Present this summary in a natural and concise language."
         - "Risk Analysis": "Identify potential risks or concerns the company may face, providing a natural language explanation of risks, timelines, resource challenges, or compliance. Include appropriate section headings."

    ### 2. **Match Score Calculation**:
       - Score the opportunity based on the relevance of the required skills in the following areas: 
         **Strategic Planning, Strategic Implementation, Factor Analysis, Integrated Marketing, Creative Studio, Event Management, Web Design and Development, Change Management, Talent Management, Digital Services, Program & Project Management, Business Process Engineering, AI and Data Science**.
       - For each relevant area, assign **25 points** if the opportunity requires skills in any of these areas, with a maximum total score of 100 points.
       - Additionally, assign **100 points** for NAICS code relevance if the code matches any of these: **5415, 541490, 541430, 541511, 541613, 519130, 519190, 541810**.
       - The **Total Match Score** is the average of the **Skills Match Score** and the **NAICS Code Relevance Score** - it should NEVER be more than 100.

    ### 3. **Match Summary**:
       - Provide a detailed explanation of why this contract is a good fit for the company. Break down the summary into specific categories based on relevant skills, services, or other areas of expertise. Provide a natural language explanation of why this contract is a good fit for the company. Use specific headlines like "Relevant Skills," "Services Alignment," or "Strategic Fit" to break down different areas where the company excels in relation to the opportunity. Keep the summary clear, concise, and relevant to the company's expertise.

    ### 4. **Risk Analysis**:
       - Identify any potential risks or challenges, including concerns related to scope, timeline, resource availability, compliance, or complexity. Use specific headlines for each category of risk. Provide a natural language analysis of potential risks or challenges, including issues like timeline constraints, resource allocation, scope complexity, or compliance. Use specific section headings to structure the risks, and ensure that the explanations are clear, practical, and actionable.
    
    ### Output the following structured JSON with no additional text or explanation. Ensure it is properlly formated JSON that can be parsed - do not wrap the JSON in markdown.

    It should be one single JSON Object. 

    {
      "NAICS": "",
      "Total Match Score": "",
      "Match Summary": "",
      "Risk Analysis": ""
    }

    Opportunity Details:
    ${description}
    `;


    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4', 
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

    console.error('Error:', errorMessage);

    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
