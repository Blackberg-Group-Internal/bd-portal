import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import JSZip from 'jszip';
import FormData from 'form-data';

const prisma = new PrismaClient();

export async function GET() {
  processCronJob(); // Fire and forget
  return new Response(JSON.stringify({ success: true, message: 'Cron job started' }), { status: 202 });
}

async function processCronJob() {
  console.log('✅ Cron job started at', new Date().toISOString());

  try {
    const useMockData = false;
    let data = [];

    const hardcodedData = [
                //       {
                //   "rfpmart_rfp_id": "WD-14521",
                //   "rfpmart_title": "USA (Washington, DC) - SharePoint Online Administrator Services",
                //   "rfpmart_budget": "",
                //   "rfpmart_budget_2": "Looking for Proposal",
                //   "rfpmart_scope_1": "Government Authority located in Washington, DC; USA based organization looking for expert vendor for SharePoint online administrator services.",
                //   "rfpmart_scope_2": "(1) Vendor needs to provide SharePoint online administrator services.- Administer and support the SharePoint online platform and the organization’s intranet, including installation, configuration, and maintenance.- Develop and customize SharePoint sites and pages to meet the organization’s needs.- Create templates that allow for easier site and page creation by users and more uniformity across all sites and pages.- Design, develop, and implement solutions using Power Apps to enhance user experience and streamline operations.- Manage continuous improvement and changes affecting SharePoint online, Microsoft teams, and other Microsoft 365 services, including typical system administrative activities such as site creation, site administration, and issue resolution.- Use Sharegate for SharePoint online and teams for migration, management, and reporting of SharePoint online content, ensuring data integrity and compliance.- Conduct training sessions for users on SharePoint Online usage and best practices.- Create and manage workflows using Microsoft power automate to automate business processes.(2) This is not RFP; this is job posting.",
                //   "rfpmart_rfp_eligibility": "Onshore (USA Only);",
                //   "rfpmart_rfp_performance": "Performance of the work will be Onsite.",
                //   "rfpmart_link": "https://rfpmart.com/933188-usa-washington-dc-sharepoint-online-administrator-services-rfp.html",
                //   "rfpmart_rfp_doc_link": "https://files.rfpmart.com/document/web-design-and-development-rfp/WD-14521_2025_04_01_09_53_40_EQIg2_1aVNr_Ax9Bs.zip",
                //   "rfpmart_rfp_pub_url": "",
                //   "rfpmart_rfp_date": "2025-04-01",
                //   "rfpmart_rfp_update_date": "2025-04-01",
                //   "rfpmart_rfp_deadline": "2025-04-15",
                //   "rfpmart_preproposal_date": "0000-00-00",
                //   "rfpmart_question_answer_date": "0000-00-00",
                //   "rfpmart_country": "2",
                //   "rfpmart_state": "57",
                //   "rfpmart_category": "1"
                // },
                // {
                //   "rfpmart_rfp_id": "WD-14522",
                //   "rfpmart_title": "USA (Washington, DC) - Data and Website Coordinator Services",
                //   "rfpmart_budget": "",
                //   "rfpmart_budget_2": "Looking for Proposal",
                //   "rfpmart_scope_1": "Government Authority located in Washington, DC; USA based organization looking for expert vendor for data and website coordinator services.",
                //   "rfpmart_scope_2": "(1) Vendor needs to provide data and website coordinator services.1. Website management:- Design new web pages, modify existing content, and troubleshoot site issues.- Embed forms and apps from other systems.- Support members and staff in general maintenance of member and public websites.- Respond to time-sensitive requests from staff to make edits and updates to both the member and public websites.- Support search engine optimization on websites.2. Data and association management system support:- Troubleshoot technical issues with the association management system, including merging records, being responsive to bugs, system glitches, and other challenges as they arise.- Support the data and website senior manager, as needed, with day-to-day management of the association management system.(2) This is not RFP; this is job posting.",
                //   "rfpmart_rfp_eligibility": "Onshore (USA Only);",
                //   "rfpmart_rfp_performance": "Performance of the work will be Onsite.",
                //   "rfpmart_link": "https://rfpmart.com/933189-usa-washington-dc-data-and-website-coordinator-services-rfp.html",
                //   "rfpmart_rfp_doc_link": "https://files.rfpmart.com/document/web-design-and-development-rfp/WD-14522_2025_04_01_09_54_16_g3vFE_NGsQf_RHKZs.zip",
                //   "rfpmart_rfp_pub_url": "",
                //   "rfpmart_rfp_date": "2025-04-01",
                //   "rfpmart_rfp_update_date": "2025-04-01",
                //   "rfpmart_rfp_deadline": "2025-04-15",
                //   "rfpmart_preproposal_date": "0000-00-00",
                //   "rfpmart_question_answer_date": "0000-00-00",
                //   "rfpmart_country": "2",
                //   "rfpmart_state": "57",
                //   "rfpmart_category": "1"
                // },
                {
                  "rfpmart_rfp_id": "WD-14525",
                  "rfpmart_title": "USA (Washington, DC) - GLOBAL - Website Development and Redesign Services Using CMS",
                  "rfpmart_budget": "300,000 to 420,000 USD",
                  "rfpmart_budget_2": "300,000 to 420,000 USD",
                  "rfpmart_scope_1": "Non-Profit Organization (Foundation) located in Washington, DC; USA based organization looking for expert vendor for website development and redesign services using CMS.",
                  "rfpmart_scope_2": "(1) Vendor needs to provide website development and redesign services using content management system.- Must be responsible for building and hosting the CMS and website.- Must be responsible for hosting and maintaining the website.- Must develop a secure and user-friendly web-based interface compatible with major browsers such as Chrome, Firefox, Safari and Edge.- Provide a robust user search function for the website’s content with auto-suggestions to help users find content across site pages, events, journals, training, etc., for both visitors and logged-in users- Must develop the website with a strong focus on Site Optimization and integrated Search Engine Optimization capabilities (SEO).- Includes optimizing site speed, mobile responsiveness, and user experience, as well as implementing SEO best practices to enhance visibility and ranking on search engines- Must have robust website analytics.- User experience review and redesign: review of the existing site and an experience audit, including stakeholder interviews, usability testing, analytics review and design wireframes and prototypes for the redesigned interface.- Enhanced Website UX/UI: existing website content as the foundation for the redesigned website.- Website Integrations:- Search and User Support: implement robust search functionality for the site with auto-suggestions to help users find content across site pages, events, journals, training, etc.(2) All questions must be submitted no later than April 2, 2025.",
                  "rfpmart_rfp_eligibility": "Global World-wide",
                  "rfpmart_rfp_performance": "Performance of the work will be Offsite",
                  "rfpmart_link": "https://rfpmart.com/933210-usa-washington-dc-global-website-development-and-redesign-services-using-cms-rfp.html",
                  "rfpmart_rfp_doc_link": "https://files.rfpmart.com/document/web-design-and-development-rfp/WD-14525_2025_04_01_10_11_16_YHRv1_b0XLy_4H0vA.pdf",
                  "rfpmart_rfp_pub_url": "",
                  "rfpmart_rfp_date": "2025-04-01",
                  "rfpmart_rfp_update_date": "2025-04-01",
                  "rfpmart_rfp_deadline": "2025-05-25",
                  "rfpmart_preproposal_date": "0000-00-00",
                  "rfpmart_question_answer_date": "2025-04-02",
                  "rfpmart_country": "2",
                  "rfpmart_state": "57",
                  "rfpmart_category": "1"
                },
                {
                  "rfpmart_rfp_id": "WD-14533",
                  "rfpmart_title": "USA (New Jersey) - Website Development and Hosting Service with CMS",
                  "rfpmart_budget": "",
                  "rfpmart_budget_2": "Looking for Proposals",
                  "rfpmart_scope_1": "Government Authority located in New Jersey; USA based organization looking for expert vendor for website development and hosting service with CMS.",
                  "rfpmart_scope_2": "(1) Vendor needs to provide website development and hosting service with CMS.- Establish a modern, secure, and user-centric platform that improves public engagement, transparency, and efficiency in service delivery.- The new site must be intuitive for users, secure, scalable, and capable of integration with various agency services.- Comprehensive redesign of the agency website. This will include the ability to host up to 5 subsites and the buildout of the Tourism sub site which will have a different look and feel than the main site.- Migration of existing content to the new platform with enhancements.- Custom theme development or selection of a premium theme suited for operations.- Ensuring the website is fully responsive across devices.- Website shall be ADA and WCAG compliant- Built-in SEO features to enhance online visibility• Specific Features- Event Calendar and Registration- Business Listings- Interactive Features- Ability to add payment options and form submission at a later date- Listing Pages for Local Partnerships & Non-Profits:(2) All the questions must be submitted no later than April 9, 2025.(3) The contract period will be for one year.",
                  "rfpmart_rfp_eligibility": "Onshore (US Organization Only);",
                  "rfpmart_rfp_performance": "Performance of the work will be Offsite.",
                  "rfpmart_link": "https://rfpmart.com/933662-usa-new-jersey-website-development-and-hosting-service-with-cms-rfp.html",
                  "rfpmart_rfp_doc_link": "https://files.rfpmart.com/document/web-design-and-development-rfp/WD-14533_2025_04_02_09_04_56_77iEo_c8NQ6_MJ2jV.pdf",
                  "rfpmart_rfp_pub_url": "",
                  "rfpmart_rfp_date": "2025-04-02",
                  "rfpmart_rfp_update_date": "2025-04-02",
                  "rfpmart_rfp_deadline": "2025-05-23",
                  "rfpmart_preproposal_date": "0000-00-00",
                  "rfpmart_question_answer_date": "2025-04-09",
                  "rfpmart_country": "2",
                  "rfpmart_state": "80",
                  "rfpmart_category": "1"
                }
    ];

    if (useMockData) {
      console.log('⚙️ Using hardcoded mock data for testing');
      data = hardcodedData;
    } else {
      const today = new Date();
      const year = today.getFullYear().toString().slice(-2);
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      //const API_URL = `https://api.rfpmartllc.com/index.php?customer_id=20241119XDK2960087485&from_date=${year}-${month}-${day}&to_date=${year}-${month}-${day}`;
      const API_URL = `https://api.rfpmartllc.com/index.php?customer_id=20241119XDK2960087485&from_date=25-05-05&to_date=25-05-08`;
      console.log('API URL: ' + API_URL);
      const response = await axios.get(API_URL);
      data = response.data;

      if (!Array.isArray(data)) {
        console.error('Invalid API response format');
        return;
      }
    }

    const filteredItems = data
      .filter(item => item.rfpmart_category === '1' || item.rfpmart_category === '18')
      .map(item => {
        const titleMatch = item.rfpmart_title.match(/^[^-]*-\s*(.*)$/);
        const cleanedTitle = titleMatch ? titleMatch[1] : item.rfpmart_title;
        return {
          rfpmart_rfp_doc_link: item.rfpmart_rfp_doc_link,
          rfpmart_rfp_pub_url: item.rfpmart_rfp_pub_url,
          rfpmart_rfp_id: item.rfpmart_rfp_id,
          rfpmart_title: cleanedTitle,
        };
      });

    for (const item of filteredItems) {
      const existingOpportunity = await prisma.opportunity.findFirst({
        where: { sourceId: item.rfpmart_rfp_id },
      });

      if (existingOpportunity) {
        console.log(`Skipping duplicate opportunity with sourceId: ${item.rfpmart_rfp_id}`);
        continue;
      }

      const opportunity = await prisma.opportunity.create({
        data: {
          documentLink: item.rfpmart_rfp_doc_link,
          sourceLink: item.rfpmart_rfp_pub_url,
          title: item.rfpmart_title,
          userId: 'system-cron-user',
          filename: '',
          threadId: '',
          assistantId: '',
          summary: '',
          sourceId: item.rfpmart_rfp_id,
          slug: `${item.rfpmart_title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '').replace(/-+/g, '-').replace(/^-+|-+$/g, '')}-${item.rfpmart_rfp_id.toLowerCase()}-${Date.now()}`,
          processed: false,
          importedAt: new Date(),
        },
      });

      try {
        console.log(`🔍 Processing Opportunity ID: ${opportunity.id}`);

        // 1. Download the file
        const fileResponse = await axios.get(opportunity.documentLink, { responseType: 'arraybuffer' });
        let fileBuffer = Buffer.from(fileResponse.data);
        let fileName = `${opportunity.slug}.pdf`;

        if (opportunity.documentLink.endsWith('.zip')) {
          const zip = await JSZip.loadAsync(fileBuffer);
          const firstFileName = Object.keys(zip.files).find(name => name.match(/\.(pdf|docx?|txt)$/i));
          if (firstFileName) {
            fileBuffer = await zip.files[firstFileName].async('nodebuffer');
            fileName = firstFileName;
          } else {
            console.warn(`No supported files in ZIP for opportunity ID ${opportunity.id}`);
            continue;
          }
        }

        // 2. Upload to SharePoint
        const folderPath = '01MODA5PEAQM27K7MQNBAIKWTAK64JRUJS';
        const uploadSessionResponse = await axios.post('http://localhost:3001/api/graph/library/upload-session-cron', {
          folderPath,
          fileName,
        }, {
          headers: { 'Content-Type': 'application/json' },
        });

        if (uploadSessionResponse.status !== 200 || !uploadSessionResponse.data.uploadUrl) {
          throw new Error('Failed to create upload session.');
        }

        const uploadUrl = uploadSessionResponse.data.uploadUrl;
        const chunkSize = 5 * 1024 * 1024;
        let start = 0;
        let end = Math.min(chunkSize, fileBuffer.length) - 1;

        while (start < fileBuffer.length) {
          const chunk = fileBuffer.slice(start, end + 1);
          const contentLength = end - start + 1;

          const graphFileUpload = await axios.put(uploadUrl, chunk, {
            headers: {
              'Content-Length': contentLength,
              'Content-Range': `bytes ${start}-${end}/${fileBuffer.length}`,
            },
          });

          console.log('File Response: ', graphFileUpload);

          start = end + 1;
          end = Math.min(start + chunkSize - 1, fileBuffer.length - 1);

          await prisma.opportunity.update({
            where: { id: opportunity.id },
            data: { documentLink: graphFileUpload.data.id },
          });

        }


        // 3. Upload to OpenAI
        const formData = new FormData();
        formData.append('file', fileBuffer, fileName);

        const uploadResponse = await axios.post('https://bd.blackberggroup.com/api/openai/file', formData, {
          headers: formData.getHeaders(),
        });

        const vectorStoreId = uploadResponse.data.vectorStoreId;

        // 4. Create Assistant
        const assistantResponse = await axios.post('https://bd.blackberggroup.com/api/openai/assistant', { vectorStoreId });
        const assistantId = assistantResponse.data.assistantId;

        // 5. Create Thread
        const threadResponse = await axios.post('https://bd.blackberggroup.com/api/openai/thread');
        const threadId = threadResponse.data.threadId;

        await prisma.opportunity.update({
          where: { id: opportunity.id },
          data: { threadId: threadId, assistantId: assistantId },
        });

        // 6. Run Assistant (stream and capture full message)
        const runResponse = await axios.post('https://bd.blackberggroup.com/api/openai/assistant/run', {
          threadId,
          assistantId,
        }, {
          responseType: 'stream',
        });

        const stream = runResponse.data;
        const decoder = new TextDecoder();
        let fullMessage = '';

        await new Promise((resolve, reject) => {
          stream.on('data', (chunk) => {
            const chunkString = decoder.decode(chunk, { stream: true });
            const lines = chunkString.split('\n').filter(line => line.trim() !== '');

            for (const line of lines) {
              if (line.startsWith('data:')) {
                const jsonResponse = line.substring(5).trim();
                try {
                  const parsedEvent = JSON.parse(jsonResponse);
                  if (parsedEvent?.event === 'thread.message.delta') {
                    const contentDelta = parsedEvent.data?.delta?.content;
                    if (Array.isArray(contentDelta)) {
                      for (const content of contentDelta) {
                        if (content.type === 'text' && content.text?.value) {
                          fullMessage += content.text.value.replace(/【\d+:\d+†source】/g, '');
                        }
                      }
                    }
                  }
                } catch (err) {
                  console.error('Error parsing JSON from OpenAI stream:', err);
                }
              }
            }
          });

          stream.on('end', resolve);
          stream.on('error', reject);
        });

        // ✅ Now, AFTER the stream completes, run your follow-up processes
      await prisma.opportunity.update({
        where: { id: opportunity.id },
        data: { processed: true, summary: fullMessage },
      });

      //await waitForRunCompletion(threadId, runId);

      console.log(`✅ Opportunity summary saved for ID: ${opportunity.id}`);
      let extractDetailsAgent = `
         Analyze the provided RFP document and extract key details to provide a structured assessment.

        Important Instructions:
        - Output only properly formatted JSON. No additional text, explanation, or comments should be included.
        - Your response must be strictly valid JSON, with the fields provided below.
        - Do not include any human-readable language outside the JSON.
        - For fields where information is missing or not explicitly stated in the RFP, infer the most likely value based on context. Ensure all inferences are logical and justifiable.

        Data Extraction and Inference Requirements:
        Extract the following information from the provided RFP document and return the data in JSON format:

        - Title: Provide the title of the RFP document. If not explicitly stated, infer a suitable title based on the content.
        - Issuing Organization: Name of the entity issuing the RFP. If not explicitly stated, infer based on available information.
        - State: Location of the issuing organization. If not specified, infer from addresses, contact details, or contextual clues.
        - RFP Number: Unique identifier or reference number for the RFP. If not provided, generate a plausible identifier based on the document.
        - Deadline: Due date for proposal submissions. If not stated, return "N/A".
        - Deadline Time: Time with time zone. If not provided, return "N/A".
        - Contact Name: Name of the point of contact. If missing, return "N/A".
        - Contact Email: Email of the point of contact. If missing, return "N/A".
        - Contact Phone: Phone number of the point of contact. If missing, return "N/A".
        - Type of Contract: Specify the type of contract being offered (e.g., Fixed Price, Time and Materials). If not stated, infer based on the nature of the work described.
        - NAICS: Extract the relevant NAICS code that aligns with the opportunity. If not present, determine the best fitting code based on the nature of the opportunity. Only provide the code, not the description. Do not leave empty.
        - Branch: Identify the relevant branch (options: "LOCAL", "STATE", "INTERNATIONAL", "FEDERAL", "COMMERCIAL", "NONPROFIT").
        - Questions Due: Deadline for submitting questions, in "YYYY-MM-DD" format. If not available, return "N/A".
        - Award Date: Award announcement date, in "YYYY-MM-DD" format. If not available, return "N/A".
        - Notary: Boolean value (true/false). Indicate if a notary is required.
        - Department: Identify the relevant branch - can be multiple options (options: "COMMUNICATIONS", "CREATIVE", "EVENTS", "WEB", "PROJECT_MANAGEMENT").

        Guardrails:

        Inference Guidelines:
        - When inferring information, ensure that all inferences are logical, justifiable, and based on context provided in the RFP.
        - Avoid wild guesses; only infer when there is sufficient context to support the inference.
        - For placeholders, use reasonable and professional approximations.

        Formatting Guidelines:
        - Ensure the JSON output is properly formatted and valid.
        - Do not include any additional text outside of the JSON structure.
        - All string values should be enclosed in double quotes.
        - Use consistent date formats (e.g., "YYYY-MM-DD") and time formats (e.g., "HH:MM AM/PM Timezone").

        Data Consistency:
        - Fill all fields with either extracted data or logically inferred values.
        - Do not leave any fields empty.
        - Ensure numerical fields are integers where appropriate.

        Your output must follow this format exactly:

        {
          "title": "",
          "issuingOrganization": "",
          "state": "",
          "rfpNumber": "",
          "deadline": "",
          "deadlineTime": "",
          "contactName": "",
          "contactEmail": "",
          "contactPhone": "",
          "typeOfContract": "",
          "naics": "",
          "branch": "",
          "questionsDue": "",
          "awardDate": "",
          "notary": false,
          "department": ""
        }
      `;
      let opportunityId = opportunity.id;



      // 📝 Step 1: Analyze Opportunity
      const extractDetails = await postMessageAndRunAssistant({
        assistantId,
        threadId,
        opportunityId,
        userPrompt: extractDetailsAgent
      });
      
      const cleanedResponse = extractDetails
      .replace(/```(?:json)?/g, '')
      .trim();

      console.log('Extract Details: ', extractDetails);

      const extractDetailsResult = JSON.parse(cleanedResponse);

      await prisma.opportunity.update({
        where: { id: opportunity.id },
        data: {
          processed: true,
          title: extractDetailsResult.title || '',
          issuingOrganization: extractDetailsResult.issuingOrganization || '',
          state: extractDetailsResult.state || '',
          rfpNumber: extractDetailsResult.rfpNumber || '',
          deadline: extractDetailsResult.deadline && extractDetailsResult.deadline !== 'N/A' ? new Date(extractDetailsResult.deadline) : null,
          //deadlineTime: extractDetailsResult.deadlineTime || '',
          contactName: extractDetailsResult.contactName || '',
          contactEmail: extractDetailsResult.contactEmail || '',
          contactPhone: extractDetailsResult.contactPhone || '',
          //typeOfContract: extractDetailsResult.typeOfContract || '',
          department: { set: Array.isArray(extractDetailsResult.department) ? extractDetailsResult.department : [extractDetailsResult.department] },
          naics: extractDetailsResult.naics || '',
          branch: extractDetailsResult.branch || '',
          questionsDue: extractDetailsResult.questionsDue && extractDetailsResult.questionsDue !== 'N/A' ? new Date(extractDetailsResult.questionsDue) : null,
          awardDate: extractDetailsResult.awardDate && extractDetailsResult.awardDate !== 'N/A' ? new Date(extractDetailsResult.awardDate) : null,
          notary: extractDetailsResult.notary ?? false,
        },
      });

      const proposalOutlinePrompt = `
              1. **Read the provided RFP** carefully.
                - Identify **core sections** required in the main text
                - **Ignore** purely administrative or non-relevant references, such as attachments, exhibits, disclaimers, or forms that do **not** require a dedicated outline section.

              2. **Create a proposal outline** that:
                - Reflects **all key RFP requirements** in a logical sequence.
                - Includes **some standard proposal sections** (e.g., “Project Approach”) **if** the RFP implicitly suggests or industry norms strongly warrant them.
                - **Does not** replicate the RFP’s structure or language overly literally—only use it as a guide to ensure coverage of all RFP-mandated information.

              3. **Structure**:
                - Number each major section (e.g., 1.0, 2.0, 3.0).
                - Label subsections (e.g., 1.1, 1.2) for each distinct RFP requirement or group of requirements.
                - Keep headings **concise** and **aligned** with typical proposal language

              4. **Level of Detail**:
                - Under each section/subsection, write a **short bullet or descriptor** indicating **what belongs there** (e.g., “Describe agency’s experience in tourism industry,” “Outline key milestones and deliverables,” etc.).
                - **Do not** write full proposal content—only provide the outline structure and minimal placeholders.

              5. **Moderate Inference**:
                - If the RFP does **not** explicitly mention a common proposal section (e.g., “Project Approach”) but **implies** the need for it or it is a standard in government proposals, include it **in a reasonable position** in the outline.
                - If the RFP includes extraneous details or references to attachments/exhibits you **don’t** want as separate sections, **absorb or omit** them as appropriate—remain consistent and relevant.

              6. **Final Output**:
                - A **clean, numbered outline** that covers all mandatory RFP elements (in a **logical** sequence) and any **standard** inferred sections.
                - **No** attachments, exhibits, or administrative disclaimers as standalone sections, unless the RFP explicitly requires them.
                - **No** actual text from the RFP or any final proposal language—**only** headings and short descriptors.
                - Return the proposal outline as structured JSON, where each section has: title, description, an optional subsections array with title and description.
              `;

              const proposalOutlineResponse = await postMessageAndRunAssistant({
                assistantId,
                threadId,
                opportunityId,
                userPrompt: proposalOutlinePrompt
              });

              function formatOutline(outlineText) {
                return outlineText
                  // Add line breaks before numbers like "5.1 " but avoid double line breaks
                  .replace(/(\d+\.\d+)\s+/g, '\n$1 ')
                  .replace(/(\d+\.\d+)\s+/g, '\n$1 ')
                  // Add line breaks before main sections "5.0 "
                  .replace(/(\d+\.0)\s+/g, '\n\n$1 ')
                  .trim();
              }
              
              const cleanedOutline = formatOutline(proposalOutlineResponse);
        
              console.log('Proposal Outline Details: ', cleanedOutline);

              await prisma.opportunity.update({
                where: { id: opportunity.id },
                data: { proposalOutline: proposalOutlineResponse },
              });
        
      // // 🧩 Step 2: Extract Key Data
      // const extractKeyDataResult = await postMessageAndRunAssistant({
      //   assistantId,
      //   threadId,
      //   opportunityId: opportunity.id,
      //   messageType: 'extract-key-data',
      // });

      // // 🌟 Step 3: Calculate Match Rating
      // const matchRatingResult = await postMessageAndRunAssistant({
      //   assistantId,
      //   threadId,
      //   opportunityId: opportunity.id,
      //   messageType: 'calculate-match-rating',
      // });


        console.log(`✅ Fully processed Opportunity ID: ${opportunity.id}`);
      } catch (err) {
        console.error(`Error processing Opportunity ID ${opportunity.id}:`, err);
      }
    }

    console.log('✅ Cron job completed.');
  } catch (error) {
    console.error('Cron job error:', error);
  }
}

async function postMessageAndRunAssistant({ assistantId, threadId, opportunityId, userPrompt }) {
  try {
    // Step 1: Post message to thread
    await axios.post('https://bd.blackberggroup.com/api/openai/message', {
      threadId,
      userPrompt
    });

    console.log(`💬 Message posted for Opportunity ID: ${opportunityId}`);

    // Step 2: Run assistant (this returns a runId)
    const runResponse = await axios.post('http://localhost:3001/api/openai/assistant/run-cron', {
      threadId,
      assistantId,
    });

    console.log('Assistant run response:', runResponse.data);
    const runId = runResponse.data.runId;
    console.log(`🚀 Assistant run started: ${runId}`);

    // Step 3: Poll OpenAI for run status
    let status = 'in_progress';
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'OpenAI-Beta': 'assistants=v2', // 🚨 REQUIRED
    };
    while (status !== 'completed' && status !== 'failed' && status !== 'cancelled') {
      await new Promise(resolve => setTimeout(resolve, 1500)); // wait 1.5 sec
      const statusResponse = await axios.get(`https://api.openai.com/v1/threads/${threadId}/runs/${runId}`, {
        headers
      });
      status = statusResponse.data.status;
      console.log(`⏳ Run status: ${status}`);
    }

    if (status !== 'completed') {
      throw new Error(`Run ended with status: ${status}`);
    }

    // Step 4: Get the latest message in the thread
    const messagesResponse = await axios.get(`https://api.openai.com/v1/threads/${threadId}/messages`, {
      headers
    });

    const messages = messagesResponse.data.data;
    const lastMessage = messages.find(msg => msg.role === 'assistant');

    const fullMessage = lastMessage?.content
      .map(part => part.text.value)
      .join('\n')
      .trim();

    console.log(`📥 Assistant response: ${fullMessage}`);

    return fullMessage;

  } catch (error) {
    const errorMessage =
    error?.response?.data?.error?.message ||
    error?.response?.data?.error ||
    error?.message ||
    'Unknown error occurred';

  console.error('🚨 Error:', errorMessage);
    throw error; // Make sure errors bubble up for proper logging
  }
}


async function waitForRunCompletion(threadId, runId) {
  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  let status = 'in_progress';

  while (status === 'in_progress' || status === 'queued') {
    const runStatusResponse = await axios.get(`https://bd.blackberggroup.com/api/openai/run-status?threadId=${threadId}&runId=${runId}`);
    status = runStatusResponse.data.status;
    console.log(`Run status: ${status}`);

    if (status === 'completed' || status === 'failed' || status === 'cancelled') {
      break;
    }

    await delay(1000); // Wait 1 second before checking again
  }

  if (status !== 'completed') {
    console.warn(`Run ended with status: ${status}`);
  }

  return status;
}

