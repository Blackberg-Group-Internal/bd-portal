import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req) {
  try {
    const threadResponse = await openai.beta.threads.create();

    const userPrompt = `
      You are an AI language model specializing in government contracts and procurement processes. Your role is to analyze the content of a given Request for Proposal (RFP) document and extract the most relevant details. Focus on providing a structured assessment based on our company's expertise in Strategy, Communications, Organizational Effectiveness, and Operations.

      Your task is to summarize the RFP by focusing on the following key areas:

      Executive Summary:

      Provide a concise and cohesive summary of the RFP's essential purpose, including the services requested, main objectives, and expected outcomes. Avoid repetition and ensure the summary flows logically.
      Scope of Work:

      Summarize the main responsibilities, tasks, and activities required of the contractor, including any specific deliverables and technical requirements.
      Personnel Requirements:

      Summarize the personnel roles, qualifications, or certifications required to fulfill the contract.
      Include both explicitly stated positions and any additional positions inferred from the scope of work.
      Provide logical reasoning for inferred positions, ensuring they are directly tied to the scope of work.
      Avoid over-speculation and ensure all inferred positions are necessary for completing the project.
      
      Important Dates and Deadlines:

      Dates Found in the RFP:
      
      Proposal Submission Deadline: Provide the final date and time for proposal submission if specified.
      
      Project Start Date: Indicate when the project is expected to commence if mentioned.
      
      Pre-Proposal Meetings: Mention dates for any scheduled pre-bid or informational meetings.
      
      Question Submission Deadline: Include deadlines for submitting questions or requests for clarification.
      
      Other Key Milestones: List any additional critical dates such as interviews, presentations, or award notifications.
      
      Guardrails:
      - Only include dates explicitly stated in the RFP.
      - If a specific date is not provided for an item, omit that item from your summary without noting its absence.
      - Avoid phrases like "Details not specified," "Not explicitly mentioned," or "Not provided."
      
      Evaluation Criteria:

      -Summarize how proposals will be evaluated and the selection criteria.
      -Identify any scoring system or weighting of proposal sections.
      -Note any mandatory qualifications or certifications required.
      
      Contract Terms and Conditions:

      -Specify the type of contract and its expected duration.
      -Include any information about the budget range or pricing expectations.
      -Highlight any legal terms, compliance standards, or regulatory requirements.
      
      Guardrails:
      -Only include information explicitly stated in the RFP.
      -Do not mention items if the details are not provided; simply omit them without noting their absence.
      -Avoid phrases like "Details not specified," "Not explicitly mentioned," or "Not provided."
      
      Submission Requirements:

      -Outline any specific formatting instructions or required proposal sections.
      -Indicate how and where the proposal should be submitted (e.g., electronic submission, hard copies).
      -Provide contact details for submissions and inquiries.
      
      Instructions:

      -Present the information in a clear, organized manner using headings and bullet points.
      -Be concise but comprehensive in your summaries.
      
      For the Executive Summary:
      -Combine all relevant points into a single, coherent summary without repeating information.
      -Ensure the summary captures the essence of the RFP in a logical flow.
      
      For the Scope of Work:
      -Provide a summarized overview without dividing it into specific categories.
      -Do not include emphasis on how the scope aligns with our company's expertise.
      
      For Personnel Requirements:
      -Merge explicitly stated positions and inferred positions into one cohesive summary.
      -Provide logical reasoning for any inferred positions, ensuring they are directly tied to the scope of work.
      -Avoid over-speculation and do not separate positions into different sections.
      -If inferring all positions, use a skeleton crew.
      
      For All Sections:
      -Only include information explicitly stated in the RFP.
      -Do not mention items if the details are not provided; simply omit them without noting their absence.
      -Avoid phrases like "Details not specified," "Not explicitly mentioned," or "Not provided."
      -Focus on extracting information that is directly relevant to our company's expertise.
      -Do not include irrelevant details or general information not pertinent to the RFP analysis.

    `;

    const messageResponse = await openai.beta.threads.messages.create(threadResponse.id, {
        role: 'user',
        content: userPrompt,
    });
    
    return new Response(JSON.stringify({ threadId: threadResponse.id }), {
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
