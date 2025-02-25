'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import axios from 'axios';
import { track } from '@vercel/analytics';
import MagicWandIcon from '../../../../../public/images/icons/magic-wand.svg';
import HomeIcon from '../../../../../public/images/icons/home.svg';
import ChevronIcon from '../../../../../public/images/icons/chevron.svg';

function ProposalGenerator() {
  const { data: session } = useSession();
  const [selectedFile, setSelectedFile] = useState(null);
  const [analysisResult, setAnalysisResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [assistantId, setAssistantId] = useState(null);
  const [threadId, setThreadId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [allAgentsDone, setAllAgentsDone] = useState(false);
  const [customInstructions, setCustomInstructions] = useState('');
  const [strategyMethods, setStrategyMethods] = useState('');
  const [toolsSoftware, setToolsSoftware] = useState('');

  // NEW: Holds each agent's final response, which we display in the accordion
  const [agentResponses, setAgentResponses] = useState([]);

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
  const streamAssistantRun = async (currentThreadId, currentAssistantId, agentName) => {
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
      
      if (value) {
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

                 // NEW: Update this agent's content in real-time
                setAgentResponses(prev =>
                  prev.map(a =>
                    a.name === agentName
                      ? { ...a, content: a.content + newText }
                      : a
                  )
                );
              }
            } catch (error) {
              console.warn('Skipping invalid JSON chunk:', line);
            }
          }
        }
      }
    }

    setAgentResponses(prev =>
      prev.map(a =>
        a.name === agentName
          ? { ...a, isStreaming: false }
          : a
      )
    );
    
    return fullText;
  };

  /**
   * sendPromptAndStream
   *
   * Sends the given userPrompt as a new message to the existing assistant thread.
   * Then calls streamAssistantRun to capture and append the streamed response.
   */
  const sendPromptAndStream = async (currentThreadId, currentAssistantId, userPrompt, agentName) => {
    // Send the prompt with the threadId so your backend knows which conversation to update.
    await axios.post('/api/openai/message', { threadId: currentThreadId, userPrompt });
    // Then, run the assistant endpoint to stream its reply.
    const finalText = await streamAssistantRun(currentThreadId, currentAssistantId, agentName);
    return finalText;
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
    setAgentResponses([]); // Clear any previous agent responses

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
      const threadResponse = await axios.post('/api/openai/thread-new');
      const currentThreadId = threadResponse.data.threadId;
      setThreadId(currentThreadId);

      // 4. Run the initial assistant to generate a summary of the opportunity.
      //await streamAssistantRun(currentThreadId, currentAssistantId);
      setLoading(false);
      //setAnalysisResult((prev) => prev + "\n\n--- Summary of Opportunity Completed ---\n\n");

      const agentPrompts = [
      //   {
      //     name: "Opportunity Summary",
      //     prompt: `
      // You are a seasoned government contract specialist. Carefully read the provided RFP and produce a detailed, well-structured **summary** of the opportunity. Follow any formatting instructions specified in the RFP (e.g., narrative paragraphs or bullet points). Include:
      // • A description of the issuing agency and its mission.
      // • The project’s overall objectives, scope, and key deliverables.
      // • Any critical deadlines, budget constraints, and evaluation criteria.
      // • Special submission instructions or formatting requirements mentioned in the RFP.
      
      // Return only the essential facts with no extraneous commentary. Make sure the content is polished and consistent with the RFP’s style.
      //     `
      //   },
        {
          name: "Requirements Analysis",
          prompt: `
        Disregard any previous summaries or narratives. **Read the entire RFP from scratch** and identify every mandatory requirement in detail. Then, organize these requirements into logical groupings or categories, such as:
        
        - Administrative or Submission Requirements (e.g., cover letter, deadlines, format)
        - Technical / Scope of Work Items (e.g., CMS recommendation, SEO, calendar functionality, branding / design elements)
        - Maintenance / Support Provisions
        - Compliance / Certifications (e.g., ADA, security)
        - Cost / Budget Requirements
        - Any other relevant category indicated by the RFP
        
        For **each** requirement within its category:
        • Provide a **concise title** (e.g., “Cover Letter,” “CMS Recommendation,” “Accessibility and SEO”).
        • Write a **short rationale** (1–2 sentences) explaining why this requirement is critical.
        • If the RFP states any **specific instructions** or **parameters** for the requirement, include them here (e.g., required file format, page limits, deadlines).
        
        Return only this organized requirements analysis, with no references to prior prompts or extra commentary. Ensure the grouping is clear and logical, reflecting how the RFP naturally sections its requirements.
        `
        },          
        {
          name: "Proposal Outline",
          prompt: `
        You are tasked with creating a complete proposal draft that reflects both:
        1) The full contents of the RFP.
        2) The mandatory requirements and structure identified in the previous requirements analysis.

        ### Incorporate these Custom Inputs
        - **Overall Items**: ${customInstructions}
        - **Strategy & Methods**: ${strategyMethods}
        - **Tools & Software**: ${toolsSoftware}
        
        **Incorporate every requirement** noted in the requirements analysis (cover letter, key sections, certifications, formatting instructions, etc.) and present them in the style or order the RFP prescribes. At a minimum, be sure to include the following sections:
        
        1. Cover Letter
        2. Executive Summary  
        3. Technical Approach  
        4. Management Plan  
        5. Past Performance/Experience  
        6. Cost Proposal  
        7. Compliance & Certifications  
        8. Innovation or Value-Added Benefits  
        9. Appendices (if applicable)
        
        If the requirements analysis or RFP indicates additional or differently named sections, integrate them accordingly. The final product should be:
        
        - **Polished:** Provide complete paragraphs or bullet points where necessary, with no placeholders or extra notes.  
        - **Aligned with the RFP:** Follow any specific style (narrative vs. structured) and formatting instructions.  
        - **Comprehensive:** Address every mandatory requirement and objective identified in the RFP and the prior requirements analysis.
        
        Return only the cohesive proposal draft, ensuring each section clearly meets the stated requirements.

          `
        },        
        {
          name: "Proposal Graphics",
          prompt: `
        You are a specialized proposal content creator. Provide text for two distinct visual elements with these **exact structures**:
        
        ---
        
        ## 1. Callout Boxes
        - Generate **5–10** callout boxes.
        - Each callout box must have:
          1. A **short, punchy title** (e.g., "Accessibility & Compliance Tools").
          2. **3–4 bullet points**. 
             - Each bullet point must begin with a **1–3 word subheading** followed by a brief explanation (1–2 lines).
        
        ### Example Format
        
        **Callout Box Title**  
        - Subheading 1: brief description (1–2 lines)
        - Subheading 2: brief description (1–2 lines)
        - Subheading 3: brief description (1–2 lines)
        
        ---
        
        ## 2. Arrow/Process Graphics
        - Provide **3–5** **distinct** arrow/process graphics.
        - For each arrow/process graphic:
          1. Give it a **short overall title**
          2. Within that graphic, include **3–5 steps**.
            - Each step should have a **short title** (e.g., "Step 1: Research Phase").
            - Under that step title, list **2–3 bullet points**, each bullet point being **2–3 words only**—no sentences.
        
        ### Example Format
        
          **Workflow 1: Discovery to Launch**  
          **Step 1: Research Phase**  
          - Bullet point
          - Bullet point
          
          **Step 2: Planning Phase**  
          - Bullet point
          - Bullet point

          and so on.
        
        ---
        
        ### Additional Instructions
        - Write everything in plain text with no code blocks.
        - Do not use placeholders like "[Company Name]."
        - Provide a **variety** of content that can be inserted into different designs.
        - Return only the final text, strictly following the structures outlined above (titles + bullet points of specified lengths).
        
        Now, produce the requested **callout boxes** and **arrow/process steps** in these precise formats.
        `
        },          
        {
          name: "Cover Letter",
          prompt: `
        You are a proposal writing expert. Your role is to generate a **tailored cover letter** based on the RFP details provided, ensuring it aligns with the rest of the proposal. **Present your final output as Markdown text, but do not enclose it in any code blocks (no <code> or triple-backtick fences).** Also, do not use the word "markdown" anywhere in the letter itself.
        
        Keep the placeholders ([Company Name], [Project Name], [Client Name]) exactly as they are—do not replace them with actual or random names.
        
        Adapt the following template to highlight:
        - The company’s strengths and expertise.
        - Alignment with the specific requirements or objectives in the RFP.
        - Any essential details that demonstrate our understanding and commitment to the project.
        
        **Reference Template**:
        
        [Company Name] is pleased to submit our proposal for [Project Name], as outlined in the RFP from [Client Name]. Our team offers a dedicated group of professionals with extensive experience in [mention relevant services/skills], ensuring a solution that aligns perfectly with your objectives.
        
        [Company Name] brings a user-centric approach to this project, focusing on [specific requirements like accessibility, scalability, or security]. We aim to deliver a platform that [mention benefits or value-adds specific to the client's needs].
        
        With a proven track record in [mention relevant experience], we ensure seamless integration with essential functionalities such as [mention any requested integrations, systems, or technology]. We are confident that our solution will provide [Client Name] with a [mention benefits like visually appealing, user-friendly, and efficient platform].
        
        Our team has carefully reviewed the RFP, including all [documents or amendments], and agrees with all terms, conditions, and provisions. We do not take any exceptions with the terms provided and are fully committed to delivering a solution that exceeds expectations.
        
        Thank you for considering our proposal for this project. We look forward to the opportunity to collaborate with [Client Name].
        
        Respectfully,
        
        [Your Name]  
        [Your Title]  
        [Company Name]
        
        End of Template
        
        **Output Requirements**:
        - Write the final letter in paragraphs with possible headings or bullet points if appropriate.
        - Do not wrap your final text in code fences or <code> tags.
        - Do not remove or alter the placeholders ([Company Name], etc.).
        - Return only the finalized cover letter text, suitably formatted for readability.
        `
        },    
        {
          name: "Executive Summary",
          prompt: `
      Write a persuasive **Executive Summary** for the government proposal. Use a style consistent with the RFP (narrative paragraphs or a concise list). Address:
      • Our organization’s background, strengths, and unique value proposition.
      • How we align with the RFP’s objectives.
      • The strategic benefits and outcomes we will deliver.
      
      Return only the final text of the Executive Summary, polished and ready to be included in the proposal.
          `
        },
        {
          name: "Technical Approach",
          prompt: `
        Develop a **Technical Approach** section that thoroughly addresses the project’s objectives, scope, and key deliverables as described in the RFP. Incorporate any mandatory requirements you have identified. Structure your response as follows:
        
        1. **Overall Methodology**
           - Provide a detailed explanation (3–4 paragraphs) of how our technical strategy achieves each major objective.
           - Reference specific milestones, performance metrics, or success factors that will guide and measure our progress.
        
        2. **Scope Items & Deliverables**
          - For **each** item listed under “Technical / Scope of Work” in the previous requirements analysis, use the **exact item name** and address it in turn.
          - For **each** item, write at least one robust paragraph describing the relevant technologies, processes, and methodologies.
          - Clearly link each scope item to the RFP’s stated objectives or constraints, explaining how we ensure compliance and quality outcomes.
          - Include a brief rationale for each scope item that aligns with the project’s broader goals (no item renaming or omission).
        
        3. **Phased Plan**
           - Divide the project into phases (Discovery, Design, Development, Testing, Launch).
           - For **each phase**:
             - Provide a thorough narrative of at least 4–5 sentences describing its purpose, scope, expected outcomes, and how it integrates with the overall project plan.
             - **Follow** with a bullet list of 5 or more key tasks, sub-deliverables, or milestones.  
               - **Each bullet item** should be written as a **mini-paragraph** of **2–3 sentences**, providing sufficient detail (e.g., rationale, benefits, or implementation steps).
        
        4. **Quality Assurance & Risk Management**
           - Offer a substantial overview (at least 2–3 paragraphs) of how we will maintain quality throughout the project. Include testing protocols (functional, usability, performance) and security measures (SSL, audits).
           - Provide a detailed risk management narrative, including potential budget or timeline constraints, stakeholder dependencies, etc.
           - List any common risks as bullet items, **each** containing 2–3 sentences explaining the risk and its mitigation strategy.
        
        5. **Relevant Experience & Compliance**
           - Highlight any past performance or specialized expertise that bolsters our credibility (1–2 paragraphs minimum).
           - Show how we meet any specific compliance or certification requirements stated in the RFP (ADA standards, security certifications, etc.), addressing each point thoroughly.
        
        ### Additional Instructions
        - Use **Markdown headings** (##, ###) for organization.
        - **Write in cohesive paragraphs** for narratives, and use **mini-paragraph bullet points** where specified.
        - The final output should be **polished, comprehensive, and ready** to include in the proposal, with **no extraneous commentary** or placeholders.
        - **Strive for in-depth clarity** in each section—avoid high-level statements without detail or justification.
        
        Now, produce a **professional, final-draft Technical Approach** section that meets these guidelines.
        `
        },         
        {
          name: "Management Plan",
          prompt: `
      Provide a complete **Management Plan** for this project, in the style the RFP requests. Address:
      • Project organization and key team roles.
      • Responsibilities and timelines for each role (avoid using tables; detailed paragraphs or bullet points are acceptable).
      • Communication strategies and risk management approaches that align with the RFP requirements.
      
      Ensure the Management Plan is clearly written, showing our capability to manage and execute successfully. Return only the final, polished text.
          `
        },
        {
          name: "Past Performance",
          prompt: `
      Compose a **Past Performance** section. Follow the RFP’s style (narrative or structured). For 2–3 relevant projects, include:
      • Project name and scope.
      • Detailed description of work performed and quantifiable results.
      • Explanation of how these past projects demonstrate our ability to meet this RFP’s requirements.
      
      Return a concise yet persuasive Past Performance section with no extraneous notes.
          `
        },
        {
          name: "Cost Proposal",
          prompt: `
        Prepare a **Cost Proposal** that provides a clear, high-level breakdown of the project’s total costs, ensuring the **final cost exceeds $100,000**. Follow these guidelines:
        
        1. **High-Level Breakdown (No Hourly Rates)**
           - Present the costs by major project phases (e.g., Discovery, Design, Development, Testing, Launch) or by categories (e.g., Project Management, Web Development, QA, Overhead).
           - Offer just enough detail to show how each segment of work contributes to the overall cost, **but do not** disclose hourly rates or specific hour counts.
        
        2. **Justifications and Alignment**
           - Briefly justify each cost category based on the RFP’s objectives and scope (e.g., complexity of development, need for specialized roles or integrations).
           - Reference any relevant RFP budget considerations or constraints, but avoid mentioning an internal minimum or hidden calculations.
        
        3. **Professional Tone & Format**
           - Do **not** use a table.
           - If the RFP prefers bullets, list each cost category in bullets; if it prefers narrative, use paragraphs.
           - Make sure the proposal is polished, consistent, and transparent—yet does not reveal internal cost formulas or minimum thresholds.
        
        4. **Conclusive Total**
           - Summarize the final cost, clearly stating that it accounts for all required activities and contingencies.
           - Ensure the total **exceeds $100,000**, but omit any reference to why or how it was calculated at that threshold.
        
        Return only the final text, with no placeholders or internal commentary. Demonstrate that we understand the scope and have budgeted accordingly, while maintaining a professional and client-facing approach.
          `
        },
        {
          name: "Compliance And Certifications",
          prompt: `
      Draft a **Compliance & Certifications** section. Use the style the RFP requests (narrative or bullet points). Include:
      • How we meet all mandatory regulatory/compliance requirements.
      • Any relevant business or technical certifications (e.g., SDVOSB, WOSB) that apply to the RFP.
      
      Return only the final text, clearly addressing compliance without extra commentary.
          `
        },
      //   {
      //     name: "ReviewAndQA",
      //     prompt: `
      // Review the entire proposal (all sections generated so far) for clarity, consistency, and conformity to the RFP. Provide a concise, actionable list of recommended changes or improvements. Focus on specific enhancements only (e.g., clarifying language, reinforcing compliance). Do not include internal process commentary or placeholders.
      //     `
      //   },
        // {
        //   name: "Final Compilation",
        //   prompt: `
        // You have the entire proposal text from each previously generated section. Your task is to **combine them into a single, cohesive final proposal**—without removing or summarizing text. Specifically:
        
        // 1. **Retain Full Sections**  
        //    - Keep each proposal section (Cover Letter, Executive Summary, Technical Approach, etc.) in its entirety.
        //    - Do not shorten or condense content.
        
        // 3. **Maintain Consistency**  
        //    - Verify that the final proposal is consistent in tone, style, and formatting.
        //    - Ensure it adheres to all RFP requirements and captures every mandatory detail.
        
        // 4. **Final Output**  
        //    - Return only the fully updated, submission-ready proposal, including all sections in their full form.
        //    - No placeholders or extraneous commentary—just the final text ready for client submission.
        
        // Begin your response by compiling each section as it was originally written preserving its length and detail.
        //   `
        // }      
      ];

      // 6. Loop over each agent prompt, sending it as a new message and then streaming the response.
      for (const agent of agentPrompts) {

        setAgentResponses(prev => [
          ...prev,
          { name: agent.name, content: '', isStreaming: true }
        ]);

        
        setAnalysisResult((prev) => prev + `\n\n--- ${agent.name} In Progress ---\n\n`);
        const agentOutput = await sendPromptAndStream(
          currentThreadId,
          currentAssistantId,
          agent.prompt,
          agent.name
        );
        setAnalysisResult((prev) => prev + `\n\n--- ${agent.name} Completed ---\n\n`);

        // NEW: Add this agent's final text as soon as it's available
        //setAgentResponses((prev) => [...prev, { name: agent.name, content: agentOutput }]);
      }
      setAllAgentsDone(true);
    } catch (error) {
      console.error('Error generating proposal:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyModalContent = () => {
       // Decide which agents' content you want to copy (must match the ones you show in the modal).
       const relevantAgentNames = ["Cover Letter", "Executive Summary", "Technical Approach", "Management Plan", "Past Performance", "Cost Proposal", "Compliance And Certifications"];
    
       // Build one big string of content. You can add headings or just join.
       const textToCopy = agentResponses
         .filter((agent) => relevantAgentNames.includes(agent.name))
         .map((agent) => `## ${agent.name}\n\n${agent.content}`)
         .join("\n\n");
    
       // Write to clipboard
       navigator.clipboard
         .writeText(textToCopy)
         .then(() => console.log("Copied modal content!"))
         .catch((err) => console.error("Error copying modal content:", err));
     };

  return (
    <section className="px-4 px-lg-5 pt-5 pb-6 mb-8">
      <div className="container">
        {/* Breadcrumbs */}
        <div className="row">
          <div className="col-12 mb-4">
              <div className="breadcrumbs d-flex align-items-center text-figtree">
                <Link href="/dam"><HomeIcon /></Link>
                <ChevronIcon />
                <Link href="/dev/" className="text-decoration-none overflow-hidden">
                  <span className="text-nowrap d-block text-truncate">SamSmart</span>
                </Link>
                <ChevronIcon />
                <Link href="/dev/tools" className="text-decoration-none overflow-hidden">
                  <span className="text-nowrap d-block text-truncate">Tools</span>
                </Link>
                <ChevronIcon />
                <Link href="/dev/tools/summarizer" className="text-decoration-none overflow-hidden">
                  <span className="text-nowrap d-block text-truncate">Proposal Generator</span>
                </Link>
              </div>
              </div>
            <div className="col-12 col-md-12 mx-auto">
              <h1 className="fw-bold-500 mb-4">Proposal Generator</h1>
            </div>
          </div>

        {/* Main Content */}
        <div className="row">
          {loading && !analysisResult && (
            <div className="sphere-container sphere-fullscreen d-flex align-items-center justify-content-center w-100 py-5 mt-5">
            <div className="sphere sphere-animate"></div>
          </div>
          )}
          {/* File Upload & Action */}
          {!analysisResult && !loading && (
          <div className="col-12 col-md-12 mx-auto">
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
              <div class="proposal-advanced-settings col-12 col-md-4 d-none">
              <hr />
                <div className="form-control d-flex flex-column">
                  <label>Custom Instructions</label>
                <textarea      
                  type="text"
                  placeholder="Enter specifics for this opportunity..."
                  value={customInstructions}
                  onChange={(e) => setCustomInstructions(e.target.value)} />
                </div>
                <div className="form-control d-flex flex-column">
                  <label>Custom Instructions</label>
                <textarea      
                  type="text"
                  placeholder="Enter Strategy & Methods..."
                  value={strategyMethods}
                  onChange={(e) => setStrategyMethods(e.target.value)} />
                </div>
                <div className="form-control d-flex flex-column">
                  <label>Tools & Software</label>
                <textarea      
                  type="text"
                  placeholder="Enter Tools & Software..."
                  value={toolsSoftware}
                  onChange={(e) => setToolsSoftware(e.target.value)} />
                </div>
              </div>
            </div>
          </div>
          )}
          {/* Output */}
          {analysisResult && (
          <div className="col-12 col-md-12 mx-auto">
            <div className="card rounded shadow-sm bg-white py-3">
              <div className="card-body">
                <p className="card-text fw-bold">Output</p>

                {loading && (
                  <div className="d-flex align-items-center justify-content-center py-3">
                    <div className="spinner-border" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                )}

                {/* NEW: Accordion to display each agent's response immediately */}
                <div className="accordion" id="agentAccordion">
                  {agentResponses.map((agent, idx) => (
                    <div className="accordion-item" key={idx}>
                      <h2 className="accordion-header" id={`heading-${idx}`}>
                        <button
                          className="accordion-button collapsed"
                          type="button"
                          data-bs-toggle="collapse"
                          data-bs-target={`#collapse-${idx}`}
                          aria-expanded="false"
                          aria-controls={`collapse-${idx}`}
                        >
                          {/* If this agent is still streaming, show a small spinner before the name */}
                          {agent.isStreaming && (
                            <span
                              className="spinner-border spinner-border-sm me-2"
                              role="status"
                              aria-hidden="true"
                            />
                          )}
                          {agent.name}
                        </button>
                      </h2>
                      <div
                        id={`collapse-${idx}`}
                        className="accordion-collapse collapse"
                        aria-labelledby={`heading-${idx}`}
                        data-bs-parent="#agentAccordion"
                      >
                        <div className="accordion-body">
                          <ReactMarkdown>{agent.content}</ReactMarkdown>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {allAgentsDone && (
                  <button
                    className="btn btn-secondary mt-3"
                    // Click to open the modal
                    onClick={() => setShowModal(true)}
                  >
                    View Proposal
                  </button>
                )}
              </div>
            </div>
          </div>
          )}
        </div>
        {/* Bootstrap Modal */}
          <div
            className={`modal fade ${showModal ? 'show d-block' : ''}`}
            tabIndex="-1"
            style={{ background: showModal ? 'rgba(0,0,0,0.5)' : 'transparent' }}
          >
            <div className="modal-dialog modal-xl">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Final Proposal</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowModal(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  {agentResponses
                    // Adjust the filter list to match the agent "name" you want to display
                    .filter((agent) =>
                      ["Cover Letter", "Executive Summary", "Technical Approach", "Management Plan", "Past Performance", "Cost Proposal", "Compliance And Certifications"]
                        .includes(agent.name)
                    )
                    .map((agent) => (
                      <div key={agent.name} style={{ marginBottom: "2rem" }}>
                        <ReactMarkdown>{agent.content}</ReactMarkdown>
                      </div>
                    ))}
                </div>
                <div className="modal-footer">
                <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleCopyModalContent}
                  >
                    Copy Proposal
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowModal(false)}
                  >
                    Close
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