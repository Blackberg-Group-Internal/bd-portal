'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import axios from 'axios';
import { track } from '@vercel/analytics';
import MagicWandIcon from '../../../../../public/images/icons/magic-wand.svg';
import HomeIcon from '../../../../../public/images/icons/home.svg';

function ProposalGenerator() {
  const { data: session } = useSession();
  const [selectedFile, setSelectedFile] = useState(null);
  const [analysisResult, setAnalysisResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [assistantId, setAssistantId] = useState(null);
  const [threadId, setThreadId] = useState(null);

  // Handle file selection
  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  /**
   * streamAssistantRun
   *
   * Calls your /api/openai/assistant/run endpoint with the given thread and assistant IDs.
   * Reads the streaming response and appends the output text to analysisResult.
   */
  const streamAssistantRun = async (currentThreadId, currentAssistantId) => {
    const response = await fetch('/api/openai/assistant/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ threadId: currentThreadId, assistantId: currentAssistantId }),
    });
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let done = false;
    let fullText = '';

    while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
      
        const decodedChunk = decoder.decode(value, { stream: true });
        const lines = decodedChunk.split('\n').filter(line => line.trim() !== '');
      
        for (const line of lines) {
          if (line === 'data: [DONE]') {
            done = true;
            break;
          }
      
          if (line.startsWith('data:')) {
            try {
              const jsonResponse = JSON.parse(line.substring(5));
      
              // Use the correct path: jsonResponse.data.delta.content
              if (jsonResponse.data && jsonResponse.data.delta && jsonResponse.data.delta.content) {
                let newText = "";
                const content = jsonResponse.data.delta.content;
                
                if (Array.isArray(content)) {
                  for (const item of content) {
                    if (item.type === "text" && item.text && item.text.value) {
                      newText += item.text.value;
                    }
                  }
                } else if (typeof content === "string") {
                  newText = content;
                }
                
                fullText += newText;
                setAnalysisResult(prev => prev + newText);
              }
            } catch (error) {
              console.warn('Skipping invalid JSON chunk:', line);
            }
          }
        }
      }
      
      
    
    return fullText;
  };

  /**
   * sendPromptAndStream
   *
   * Sends the given userPrompt as a new message to the existing assistant thread.
   * Then calls streamAssistantRun to capture and append the streamed response.
   */
  const sendPromptAndStream = async (currentThreadId, currentAssistantId, userPrompt) => {
    // Send the prompt with the threadId so your backend knows which conversation to update.
    await axios.post('/api/openai/message', { threadId: currentThreadId, userPrompt });
    // Then, run the assistant endpoint to stream its reply.
    await streamAssistantRun(currentThreadId, currentAssistantId);
  };

  /**
   * handleGenerateClick
   *
   * Uploads the selected file, creates the assistant and thread, then runs the initial assistant.
   * After that, it chains a series of message prompts (each representing a different agent)
   * by sending them via the general message API and streaming the responses.
   */
  const handleGenerateClick = async () => {
    setLoading(true);
    setAnalysisResult(''); // Clear any previous output

    try {
      if (!selectedFile) return;

      // Track the event
      track('Proposal Generator', { file: selectedFile.name, user: session.user.id });

      // 1. Upload the file to your vector store.
      const formData = new FormData();
      formData.append('file', selectedFile);
      const uploadResponse = await axios.post('/api/openai/file', formData);
      const vectorStoreId = uploadResponse.data.vectorStoreId;

      // 2. Create the assistant.
      const assistantResponse = await axios.post('/api/openai/assistant', { vectorStoreId });
      const currentAssistantId = assistantResponse.data.assistantId;
      setAssistantId(currentAssistantId);

      // 3. Create the thread.
      const threadResponse = await axios.post('/api/openai/thread');
      const currentThreadId = threadResponse.data.threadId;
      setThreadId(currentThreadId);

      // 4. Run the initial assistant to generate a summary of the opportunity.
      await streamAssistantRun(currentThreadId, currentAssistantId);
      setLoading(false);
      setAnalysisResult((prev) => prev + "\n\n--- Summary of Opportunity Completed ---\n\n");

      // 5. Define the agent prompts (each as a new message prompt).
      // V1 - Best
    //   const agentPrompts = [
    //     {
    //       name: "Opportunity Analyzer",
    //       prompt:
    //         `
    //         You are a seasoned government contract specialist. Based on the provided RFP, produce a fully developed, detailed summary of the opportunity. Include:
    //         • A description of the issuing agency and its mission.
    //         • The project objectives, scope, and key deliverables.
    //         • Critical deadlines and budget constraints.
    //         • The evaluation criteria and mandatory compliance requirements.

    //         Write in clear, professional language that can serve as the foundation for the entire proposal. Do not include any extraneous commentary.
    //         `
    //     },
    //     {
    //       name: "Requirements Identifier",
    //       prompt:
    //         `
    //         You are an expert proposal writer with extensive experience in government contracting. Based on the opportunity summary provided, generate a fully developed description of the RFP requirements. For each requirement, include:
    //         • A detailed description of what is mandatory.
    //         • Any technical specifications or compliance measures required.
    //         • A brief explanation of why each requirement is critical.

    //         Present your response in clear paragraphs with complete sentences. Do not include any internal notes or extraneous commentary.
    //         `
    //     },
    //     {
    //       name: "Proposal Outliner",
    //       prompt:
    //         `
    //         You are a professional proposal writer experienced in government contracts. Using the RFP opportunity summary and the detailed list of requirements provided, generate a fully developed draft of the proposal. For each of the following sections, produce detailed, polished content:
            
    //         1. Executive Summary  
    //         2. Technical Approach  
    //         3. Management Plan  
    //         4. Past Performance/Experience  
    //         5. Cost Proposal  
    //         6. Compliance & Certifications  
    //         7. Innovation or Value-Added Benefits  
    //         8. Appendices (if applicable)

    //         Ensure that every section is thorough, contains complete sentences, specific details, and reads as a cohesive document. Do not merely return an outline or bullet points—write full paragraphs for each section in a professional and persuasive tone.
    //         `
    //     },
    //     {
    //       name: "Executive Summary",
    //       prompt:
    //         `
    //         Write a complete Executive Summary for a government proposal. In this section, describe:
    //         • Our organization’s background, key strengths, and unique value proposition.
    //         • How our approach aligns with the RFP’s objectives.
    //         • The strategic benefits and outcomes our proposal will deliver.

    //         Produce a polished, fully developed paragraph (or two) in formal, persuasive language with no extraneous commentary.

    //         `
    //     },
    //     {
    //       name: "Technical Approach",
    //       prompt:
    //         `
    //         Develop a fully detailed Technical Approach section for the proposal. Your response should include:
    //         • A description of the methodology, technologies, and processes we will use.
    //         • How each component addresses the RFP’s technical requirements.
    //         • Key project phases, milestones, and quality assurance measures.

    //         Write in clear, technical, and professional language that leaves no ambiguity about our proposed solution.

    //         `
    //     },
    //     {
    //       name: "Management Plan",
    //       prompt:
    //         `
    //         Outline a complete Management Plan for the proposal. Include:
    //         • A full description of the project organization and team roles.
    //         • Detailed responsibilities for each role and timelines for key milestones.
    //         • A discussion of risk management and communication strategies.

    //         Provide a thorough, cohesive narrative that demonstrates our ability to manage and execute the project successfully.
    //         `
    //     },
    //     {
    //       name: "Past Performance",
    //       prompt:
    //         `
    //         Write a fully developed Past Performance section. Describe 2–3 key projects that illustrate our successful track record with similar government contracts. For each project, include:
    //         • The project name and scope.
    //         • A detailed description of the work performed and specific outcomes achieved (using quantifiable metrics if available).
    //         • How these projects demonstrate our ability to meet the RFP requirements.

    //         Write in clear, factual, and persuasive language suitable for a final proposal.
    //         `
    //     },
    //     {
    //       name: "Cost Proposal",
    //       prompt:
    //         `
    //         Prepare a comprehensive Cost Proposal section. Your response should include:
    //         • A clear description of our overall pricing strategy and structure.
    //         • A detailed breakdown of costs by major phases or deliverables.
    //         • Explanations for the cost estimates that align with the RFP budget and pricing guidelines.

    //         Present the information in a professional and transparent manner suitable for submission, without internal commentary.
    //         `
    //     },
    //     {
    //       name: "Compliance",
    //       prompt:
    //         `Review the RFP requirements and list the key compliance and regulatory mandates that our proposal fulfills. Include any relevant certifications (e.g., SDVOSB, WOSB) and regulatory standards. Return your response as a short list or paragraph with no internal notes or extraneous commentary.
    //         `
    //     },
    //     {
    //       name: "Review & QA",
    //       prompt:
    //         "Review the entire proposal draft for clarity, consistency, and full adherence to the RFP requirements. Provide a summary of actionable recommendations for improving the proposal's quality, formatted as a list of bullet points. Focus solely on actionable feedback, excluding internal process commentary."
    //     },
    //     {
    //       name: "Final Compilation",
    //       prompt:
    //         `Compile all the sections of the proposal into a single, polished final proposal document. Ensure that the final document is cohesive, well-structured, and written in formal, persuasive language. The final document should be complete and detailed enough for submission to the issuing agency, with no extraneous notes or internal commentary.`
    //     }
    //   ];

    const agentPrompts = [
            {
            name: "Opportunity Analyzer",
            prompt: `
        You are a seasoned government contract specialist. Analyze the provided RFP and produce a fully developed, detailed narrative summary of the opportunity. Your response should adapt to the RFP’s instructions: if a narrative description is expected, write in full paragraphs; if a structured summary is required, use clear bullet points. Include:
        • A description of the issuing agency and its mission.
        • The project’s overall objectives, scope, and key deliverables.
        • Critical deadlines, budget constraints, and evaluation criteria.
        • Any special submission instructions or formatting requirements mentioned in the RFP.
        
        Return only the essential facts in a style that reflects the RFP’s guidelines, with no extraneous commentary.
        `
            },
            {
            name: "Requirements Identifier",
            prompt: `
        You are an expert proposal writer with extensive experience in government contracting. Based on the provided opportunity summary and RFP content, generate a fully developed narrative description of the requirements. Adapt your output based on what the RFP requests:
        • If detailed narrative is required, explain each requirement in full paragraphs.
        • If a structured format is requested, present clear bullet points.
        Include:
        • A detailed explanation of each mandatory requirement (cover letter, table of contents, qualifications, technical specifications, cost proposal, etc.).
        • Specific compliance measures.
        • A brief rationale for why each requirement is critical.
        
        Do not include extraneous commentary or internal notes.
        `
            },
            {
            name: "Proposal Outliner",
            prompt: `
        You are a professional proposal writer experienced in government contracts. Using the RFP opportunity summary and the detailed requirements provided, produce a fully developed draft of the proposal that adapts to the submission instructions in the RFP. Your response should include comprehensive narrative for the following sections:
        1. Cover Letter/Introduction  
        2. Executive Summary  
        3. Technical Approach  
        4. Management Plan  
        5. Past Performance/Experience  
        6. Cost Proposal  
        7. Compliance & Certifications  
        8. Innovation or Value-Added Benefits  
        9. Appendices (if applicable)
        
        For each section, provide detailed, polished content in full paragraphs if a narrative is expected, or a structured format if specified by the RFP. Do not simply return an outline or bullet points—ensure the output is written as a cohesive, complete proposal draft.
        `
            },
            {
            name: "Executive Summary",
            prompt: `
        Write a complete Executive Summary for the government proposal. Adapt your style based on the RFP instructions:
        • If a narrative is required, produce one or two fully developed paragraphs.
        • If a structured format is needed, present key points in a clear list.
        Include:
        • Our organization’s background, key strengths, and unique value proposition.
        • How our approach aligns with the RFP’s objectives.
        • The strategic benefits and outcomes that our proposal will deliver.
        
        Return only the polished, persuasive narrative suitable for inclusion in the final proposal.
        `
            },
            {
                name: "Technical Approach",
                prompt: `
              You are an expert technical proposal writer with extensive experience in responding to government RFPs. Develop a comprehensive Technical Approach section that clearly demonstrates our ability to meet the RFP’s technical requirements. Your response must combine narrative explanations with structured bullet points. Include the following elements:
              
              • An explanation of our overall methodology for executing the project—detailing our approach to design, development, and deployment, and justifying our technical choices.
              • A description of the key technologies, platforms, and tools we plan to use (e.g., content management systems, web frameworks, APIs, interactive components) and how each directly addresses the technical requirements.
              
              For the project phases (Discovery, Design, Development, Testing, and Launch), for each phase provide:
                 1. A concise narrative overview that describes the purpose, scope, and objectives of the phase.
                 2. A detailed, structured breakdown using bullet points that includes:
                    - Key milestones.
                    - Specific deliverables.
                    - Timeline estimates (e.g., Weeks 1-2).
                    - Quality assurance activities and/or risk mitigation steps, if applicable.
              
              Also include sections for:
              • Quality Assurance: Describe our testing protocols, performance standards, and security measures in both narrative and bullet-point formats where relevant.
              • Risk Management: Provide a narrative explanation of our risk management strategy and include a bullet list of key risks with their mitigation strategies.
              
              Your output should be a well-organized document that combines narrative paragraphs with bullet-point lists to clearly and thoroughly present all technical aspects of the proposal, without extraneous commentary.
              `
              },                                      
            {
            name: "Management Plan",
            prompt: `
        Outline a complete Management Plan for the proposal. Adapt your response based on the RFP’s submission guidelines:
        • If a narrative approach is expected, provide detailed paragraphs.
        • If a structured format is required, use a clear outline or table.
        Include:
        • A full description of our project organization and team roles.
        • Detailed responsibilities for each role and timelines for key milestones. Do not return in table format.
        • A discussion of risk management and communication strategies.
        
        Return a cohesive narrative that demonstrates our ability to manage and execute the project successfully. 
        `
            },
            {
            name: "Past Performance",
            prompt: `
        Compose a fully developed Past Performance section for the proposal. Your response should adapt to the style requested in the RFP:
        • If a narrative is expected, provide comprehensive paragraphs for each project.
        • If a structured format is requested, use a clear table or bullet list.
        Include for 2–3 key projects:
        • The project name and scope.
        • A detailed description of the work performed and quantifiable outcomes.
        • An explanation of how these projects demonstrate our ability to meet the RFP’s requirements.
        
        Return your response in clear and persuasive language with no extraneous commentary.
        `
            },
            {
            name: "Cost Proposal",
            prompt: `
        Prepare a detailed Cost Proposal section for the proposal. Your response should adapt to the RFP’s instructions:
        • If a narrative is required, write a detailed paragraph explaining our overall pricing strategy and cost breakdown.
        • If a structured format is preferred, present the costs in a clear table or bullet list.
        Include:
        • An overall description of the pricing structure.
        • A detailed breakdown of costs by major phases or deliverables.
        • Justifications for each cost that align with the RFP’s budget and pricing guidelines.
        
        Return your response in professional, transparent language without internal commentary. Do not return in table format.
        `
            },
            {
            name: "Compliance & Certifications",
            prompt: `
        Draft a comprehensive Compliance & Certifications section for the proposal. Adapt your style according to the RFP’s instructions:
        • If a narrative description is required, write clear paragraphs.
        • If a structured format is needed, use a bullet list or table.
        Include:
        • A detailed explanation of how our proposal meets all mandatory regulatory and compliance requirements.
        • A listing of relevant certifications (e.g., SDVOSB, WOSB) and how they pertain to the RFP.
        
        Return your response in clear, concise language with no extraneous commentary.
        `
            },
            {
            name: "Review & QA",
            prompt: `
        Review the complete proposal draft for clarity, consistency, and adherence to the RFP requirements. Provide a concise, actionable list of recommendations for improvement. Ensure your feedback is focused only on specific, actionable items, and do not include any internal process commentary.
        `
            },
            {
            name: "Final Compilation",
            prompt: `
        Compile all sections of the proposal—including Cover Letter/Introduction, Executive Summary, Technical Approach, Management Plan, Past Performance, Cost Proposal, Compliance & Certifications, and any additional sections required by the RFP—into a single, cohesive final proposal document. Ensure that the final document is fully polished, consistent, and written in the style requested in the RFP (narrative or structured, as needed). Do not include any extraneous internal notes or commentary.
        `
            }
        ];
      

      // 6. Loop over each agent prompt, sending it as a new message and then streaming the response.
      for (const agent of agentPrompts) {
        setAnalysisResult((prev) => prev + `\n\n--- ${agent.name} In Progress ---\n\n`);
        await sendPromptAndStream(currentThreadId, currentAssistantId, agent.prompt);
        setAnalysisResult((prev) => prev + `\n\n--- ${agent.name} Completed ---\n\n`);
      }
    } catch (error) {
      console.error('Error generating proposal:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="px-4 px-lg-5 pt-5 pb-6 mb-8">
      <div className="container">
        {/* Breadcrumbs */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="breadcrumbs d-flex align-items-center">
              <Link href="/home">
                <HomeIcon />
              </Link>
              <span> / </span>
              <span>Proposal Generator</span>
            </div>
          </div>
          <div className="col-12">
            <h1 className="fw-bold mb-4">Proposal Generator</h1>
          </div>
        </div>

        {/* Main Content */}
        <div className="row">
          {/* File Upload & Action */}
          <div className="col-12 col-md-6">
            <div className="card rounded shadow-sm bg-white py-3">
              <div className="card-body">
                <p className="card-text">
                  Upload an RFP document to generate a detailed proposal.
                </p>
                <input
                  type="file"
                  className="form-control my-3"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.txt"
                />
                <button
                  className="btn btn-primary"
                  onClick={handleGenerateClick}
                  disabled={!selectedFile || loading}
                >
                  Generate Proposal
                  <MagicWandIcon className="ms-2" />
                </button>
              </div>
            </div>
          </div>

          {/* Output */}
          <div className="col-12 col-md-6">
            <div className="card rounded shadow-sm bg-white py-3">
              <div className="card-body">
                <p className="card-text fw-bold">Output</p>
                {loading ? (
                  <div className="d-flex align-items-center justify-content-center py-5">
                    <div className="spinner-border"></div>
                  </div>
                ) : (
                  <div>
                    <ReactMarkdown>{analysisResult}</ReactMarkdown>
                  </div>
                )}
                <button
                  className="btn btn-outline-secondary mt-3"
                  onClick={() =>
                    navigator.clipboard.writeText(analysisResult).catch((err) =>
                      console.error('Error copying output:', err)
                    )
                  }
                >
                  Copy Output
                  <MagicWandIcon className="ms-2" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ProposalGenerator;