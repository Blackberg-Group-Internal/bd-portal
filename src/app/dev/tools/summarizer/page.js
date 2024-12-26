'use client';

//export const dynamic = 'force-dynamic';

import React, { useContext, useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import MagicWandIcon from '../../../../../public/images/icons/magic-wand.svg';
import SummaryIcon from '../../../../../public/images/icons/summary.svg';
import dynamic from 'next/dynamic';

const ReactMarkdown = dynamic(() => import('react-markdown'), { ssr: false });

// import ReactMarkdown from 'react-markdown';
import ChatBot from '@/app/components/dev/ChatRfp';
import FeedbackButtonsRfp from '@/app/components/dev/FeedbackButtonsRfp';
import { track } from '@vercel/analytics';
import axios from 'axios';
import { useOpportunity } from '@/app/context/OpportunityContext';
import CalendarIcon from '../../../../../public/images/icons/calendar.svg';
import { FileViewerContext } from '@/app/layout';
import PerformanceIcon from '../../../../../public/images/icons/performance.svg';
import BuildingIcon from '../../../../../public/images/icons/building.svg';
import PassportIcon from '../../../../../public/images/icons/passport.svg';
import TilesIcon from '../../../../../public/images/icons/tiles.svg';
import OrgIcon from '../../../../../public/images/icons/org.svg';
import NaicsIcon from '../../../../../public/images/icons/naics.svg';
import ListIcon from '../../../../../public/images/icons/list.svg';
import FilesIcon from '../../../../../public/images/icons/files.svg';
import CountdownIcon from '../../../../../public/images/icons/hourglass.svg';
import { useRouter, usePathname } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import { format } from 'date-fns'; 
import { useToast } from '@/app/context/ToastContext';

function RfpSummarizer() {
  const { data: session, status } = useSession();
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analysisResult, setAnalysisResult] = useState('');
  const [showUpload, setShowUpload] = useState(true);
  const rfpThreadIdRef = useRef(null);
  const rfpAssistantIdRef = useRef(null);
  const { selectedOpportunity } = useOpportunity();
  const [rfpThreadId, setRfpThreadId] = useState(null);  // For rendering ChatBot
  const [rfpAssistantId, setRfpAssistantId] = useState(null);
  const [rfpDetails, setRfpDetails] = useState(null);
  const [countdown, setCountdown] = useState(null);
  const graphFile = useRef(null);
  const { openModal } = useContext(FileViewerContext);
  //const searchParams = useSearchParams();
  //const slug = searchParams.get('slug');
  const router = useRouter();
  const { addToast } = useToast();
  const [slug, setSlug] = useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      setSlug(params.get('slug'));
    }
  }, []);

  const formatModifiedDate = (dateString) => {
    const date = new Date(dateString);
    return format(date, 'MMM d, yyyy');
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleGenerateClick = async () => {
    setLoading(true);
    setAnalysisResult('');
    setShowUpload(false);
  
    try {
      if (selectedFile) {
        if (typeof window !== 'undefined') {
          track('RFP Summarizer', { file: selectedFile.name, user: session.user.id });
        }
        startGraphUpload();
        const formData = new FormData();
        formData.append('file', selectedFile);

        // Upload file and create vector store
        const uploadResponse = await axios.post('/api/openai/file', formData);
        const vectorStoreId = uploadResponse.data.vectorStoreId;

        // Create assistant
        const assistantResponse = await axios.post('/api/openai/assistant', { vectorStoreId });
        const newAssistantId = assistantResponse.data.assistantId;
        rfpAssistantIdRef.current = newAssistantId;
        setRfpAssistantId(newAssistantId);

        // Create thread
        const threadResponse = await axios.post('/api/openai/thread');
        const newThreadId = threadResponse.data.threadId;
        rfpThreadIdRef.current = newThreadId;
        setRfpThreadId(newThreadId);

        // Run assistant and get streaming response
        const response = await fetch('/api/openai/assistant/run', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ threadId: newThreadId, assistantId: newAssistantId }),
        });

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let done = false;
        let fullMessage = '';

        while (!done) {
          const { value, done: readerDone } = await reader.read();
          done = readerDone;

          if (value) {
            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n').filter(line => line.trim() !== '');

            for (const line of lines) {
              if (line.startsWith('data:')) {
                const jsonResponse = line.substring(5).trim();

                try {
                  const parsedEvent = JSON.parse(jsonResponse);

                  // Check for 'thread.message.delta' event
                  if (parsedEvent?.event === 'thread.message.delta') {
                    const contentDelta = parsedEvent.data?.delta?.content;

                    if (Array.isArray(contentDelta)) {
                      for (const content of contentDelta) {
                        if (content.type === 'text' && content.text?.value) {
                          let tempMessage = content.text.value.replace(/【\d+:\d+†source】/g, '');

                          fullMessage += tempMessage;
                          setLoading(false);
                        }
                      }
                      setAnalysisResult(fullMessage);
                    }
                  }

                  // Capture threadId and assistantId for chat bot use
                  if (parsedEvent?.data?.threadId) {
                   // setThreadId(parsedEvent.data.threadId);
                  }
                  if (parsedEvent?.data?.assistantId) {
                    //setAssistantId(parsedEvent.data.assistantId);
                  }

                  if (parsedEvent?.event === 'thread.message.completed') {
                    setLoading(false);
                    getAnalysis(rfpThreadIdRef.current, rfpAssistantIdRef.current, fullMessage);
                  }

                } catch (err) {
                  console.error('Error parsing JSON:', err);
                }
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error generating summary:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check if a slug is present in the URL and retrieve existing summary
    const fetchExistingSummary = async () => {
      if (slug) {
        try {
          const response = await axios.get(`/api/rfp-summary?slug=${slug}`);
          if (response.status === 200 && response.data) {

            setAnalysisResult(response.data.summary);
            setRfpThreadId(response.data.threadId);
            setRfpAssistantId(response.data.assistantId);
            setRfpDetails(response.data);
            graphFile.current = response.data.documentLink;
            if (response.data.deadline) {
              const currentDate = new Date();
              const deadlineDate = new Date(response.data.deadline);
              const timeDifference = deadlineDate - currentDate;
              const daysUntilDeadline = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));
              //parsedJson.countdown = daysUntilDeadline > 0 ? daysUntilDeadline : 0; // Set to 0 if deadline is past
              setCountdown(daysUntilDeadline > 0 ? daysUntilDeadline : 0);
            }
            setShowUpload(false);
            setLoading(false);
          }
        } catch (error) {
          console.error('Error fetching existing summary:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false); 
      }
    };
  
    fetchExistingSummary();
  }, [slug]);
  

  const getAnalysis = async (threadId, assistantId, analysisResult) => {
    try {
  

      const userPrompt = `
      Now, analyze the provided RFP document and extract key details to provide a structured assessment.

      Important Instructions:
      -Output only properly formatted JSON. No additional text, explanation, or comments should be included.
      -Your response must be strictly valid JSON, with the fields provided below.
      -Do not include any human-readable language outside the JSON.
      -For fields where information is missing or not explicitly stated in the RFP, infer the most likely value based on context. Ensure all inferences are logical and justifiable.
      
      Data Extraction and Inference Requirements:
      Extract the following information from the provided RFP document and return the data in JSON format:

      RFP Title: Provide the title of the RFP document. If not explicitly stated, infer a suitable title based on the content.

      Issuing Organization: Name of the entity issuing the RFP. If not explicitly stated, infer based on available information.

      State: Location of the issuing organization. If not specified, infer from addresses, contact details, or contextual clues.

      RFP Number: Unique identifier or reference number for the RFP. If not provided, generate a plausible identifier based on the document.

      Deadline: Due date for proposal submissions. If not stated, return "N/A".

      Deadline Time: Time with time zone. If not provided, return "N/A".

      Contact Information: Provide the contact name, email, and phone number. If some details are missing, return "N/A".

      Type of Contract: Specify the type of contract being offered (e.g., Fixed Price, Time and Materials). If not stated, infer based on the nature of the work described.

      Key Dates: List important dates such as pre-bid meetings, question submission deadlines, and award announcements. If dates are missing, return "N/A".

      NAICS: Extract the relevant NAICS code that aligns with the opportunity. If not present, determine the best fitting code based on the nature of the opportunity. Only provide the code, not the description. Do not leave empty.

      Match Score: Calculate a match score from 1 to 100, where 100 indicates the highest level of alignment between the RFP and our company's capabilities. Use the following formula:

      Match Score Calculation:

      Identify Relevant Service Areas:

      Compare the RFP's requirements and scope of work with our company's service offerings, which include:

      Strategy:

      - Strategic Awareness
      - Strategic Planning
      - Strategic Implementation

      Operations:

      - Project Management
      - Business Process Engineering
      - AI Integration

      Communications:

      - Integrated Marketing
      - Creative Studio (Graphic Design, Web Design, Videography, Photography)
      - Event Management
      - Web Design and Development
      - Product Consulting
      - UI/UX Design
      - Web Development

      Organizational Effectiveness:

      - Change Management
      - Talent Management
      - Digital Services

      Company Credentials:

      - Service-Disabled Veteran-Owned Small Business (SDVOSB)
      - Woman-Owned Small Business (WOSB)

      Assign Points:

      Main Service Areas (Maximum 40 points):

      10 points for each main service area (Strategy, Operations, Communications, Organizational Effectiveness) that is highly relevant to the RFP requirements.
      
      Sub-Service Areas (Maximum 40 points):

      5 points for each relevant sub-service area that matches the RFP requirements.
      
      Company Credentials (Maximum 20 points):

      10 points if the RFP specifies or prefers a Service-Disabled Veteran-Owned Small Business (SDVOSB).
      10 points if the RFP specifies or prefers a Woman-Owned Small Business (WOSB).
      
      Calculate Total Points:

      Sum the points from the steps above.
      The maximum possible score is 100 points.
      Ensure Score is Between 1 and 100:

      If the calculated score exceeds 100, cap it at 100.
      If no matches are found, assign a minimum score of 1.

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

      Your output should follow this format exactly:

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
        "keyDates": [],
        "naics": "",
        "matchScore": 0,
      }
      `;

      await axios.post('/api/openai/message', { threadId: threadId, userPrompt });


       // Run assistant and get streaming response
       const response = await fetch('/api/openai/assistant/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ threadId: threadId, assistantId: assistantId }),
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let fullMessage = '';
      let parsedJson;

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;

        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n').filter(line => line.trim() !== '');

          for (const line of lines) {
            if (line.startsWith('data:')) {
              const jsonResponse = line.substring(5).trim();

              try {
                const parsedEvent = JSON.parse(jsonResponse);

                // Check for 'thread.message.delta' event
                if (parsedEvent?.event === 'thread.message.delta') {
                  const contentDelta = parsedEvent.data?.delta?.content;

                  if (Array.isArray(contentDelta)) {
                    for (const content of contentDelta) {
                      if (content.type === 'text' && content.text?.value) {
                        fullMessage += content.text.value;
                       // setLoading(false);
                      }
                    }
                    //setAnalysisResult(fullMessage);
                  }
                }

                // Capture threadId and assistantId for chat bot use
                if (parsedEvent?.data?.threadId) {
                 // setThreadId(parsedEvent.data.threadId);
                }
                if (parsedEvent?.data?.assistantId) {
                  //setAssistantId(parsedEvent.data.assistantId);
                }

                if (parsedEvent?.event === 'thread.message.completed') {
                  console.log('Analysis Part 2: ', fullMessage);

                  const cleanedString = fullMessage.replace(/```json|```/g, '').trim();

                    // Step 2: Parse the cleaned string to JSON
                    try {
                      parsedJson = JSON.parse(cleanedString);
                      console.log(parsedJson);
                        // Generate a slug from the RFP title and date-time
                      parsedJson.slug = generateSlug(parsedJson.title);
                      
                      const url = new URL(window.location);
                      url.searchParams.set('slug', parsedJson.slug);
                      window.history.replaceState({}, '', url);

                      if (parsedJson.deadline) {
                        const currentDate = new Date();
                        const deadlineDate = new Date(parsedJson.deadline);
                        const timeDifference = deadlineDate - currentDate;
                        const daysUntilDeadline = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));
                        //parsedJson.countdown = daysUntilDeadline > 0 ? daysUntilDeadline : 0; // Set to 0 if deadline is past
                        setCountdown(daysUntilDeadline > 0 ? daysUntilDeadline : 0);
                      }

                      setRfpDetails(parsedJson);
                      //rfpDetails = parsedJson;
                      setLoading(false);
                      // You can now access properties like parsedJson.NAICS, parsedJson["Match Score"], parsedJson.Deadline
                    } catch (error) {
                      console.error('Failed to parse JSON:', error);
                    }
                }

              } catch (err) {
                console.error('Error parsing JSON:', err);
              }
            }
          }
        }
      }
      

      // const analysisData = response.data.analysis;
      const parsedDeadline = new Date(Date.parse(parsedJson.deadline)); // Convert to Date object

      // Store the data in the database using the new API
      await axios.post('/api/rfp-summary', {
        title: parsedJson.title,
        userId: session.user.id,
        deadline: new Date().toISOString(),
        filename: selectedFile.name,
        threadId: threadId,
        assistantId: assistantId,
        summary: analysisResult,
        deadline: parsedDeadline,
        naics: parsedJson.naics,
        matchScore: parsedJson.matchScore,
        issuingOrganization: parsedJson.issuingOrganization,
        state: parsedJson.state,
        contactName: parsedJson.contactName,
        contactEmail: parsedJson.contactEmail,
        contactPhone: parsedJson.contactPhone,
        requirements: parsedJson.requirements,
        documentLink: graphFile.current['@content.downloadUrl'],
        slug: parsedJson.slug
      });

      // setAnalysis(analysisData);
    } catch (error) {
      console.error('Error getting analysis:', error);
    }
  };


  const startGraphUpload = async () => {
    if (!selectedFile) {
      return;
    }
  
    const folderPath = "01MODA5PEAQM27K7MQNBAIKWTAK64JRUJS";
  
    //setUploading(true);
  
    try {
        // Create upload session URL via API
        const response = await axios.post('/api/graph/library/upload-session', {
          folderPath,
          fileName: selectedFile.name,
        }, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
  
        if (response.status !== 200 || !response.data.uploadUrl) {
          throw new Error('Failed to create upload session.');
        }
  
        const uploadUrl = response.data.uploadUrl;
  
        const chunkSize = 5 * 1024 * 1024; 
        let start = 0;
        let end = Math.min(chunkSize, selectedFile.size) - 1;
        let totalUploaded = 0;
  
        while (start < selectedFile.size) {
          const chunk = selectedFile.slice(start, end + 1);
          const contentLength = end - start + 1;
  
          const fileResponse = await axios.put(uploadUrl, chunk, {
            headers: {
              Authorization: `Bearer ${session.accessToken}`,
              'Content-Length': contentLength,
              'Content-Range': `bytes ${start}-${end}/${selectedFile.size}`,
            },
            onUploadProgress: (progressEvent) => {
              const uploadedBytes = progressEvent.loaded;
              totalUploaded += uploadedBytes;
  
              const progressValue = Math.min((totalUploaded / selectedFile.size) * 100, 99);
 
            },
          });
  
          console.log('File Response: ', fileResponse);
          graphFile.current = fileResponse.data;
          //setGraphFile(fileResponse.data);
          start = end + 1;
          end = Math.min(start + chunkSize - 1, selectedFile.size - 1);
        }
      
  
    } catch (error) {
      console.error('Error uploading files:', error);
    } finally {
    }
  };

  const showModal = (file) => {
    openModal(file);
  };

  const generateSlug = (title) => {
    const shortenedTitle = title.substring(0, 24);
    const formattedTitle = shortenedTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-'); 
    const formattedDate = new Date().toISOString().replace(/[:.]/g, '-');
    return `${formattedTitle}-${formattedDate}`;
  };
  

  return (
    <>
      <section className="px-4 px-lg-5 pt-5 pb-6 mb-8">
        <div className="container position-relative">
          <div className="row">
            <div className="col-12">
              <h1 className="fw-bold-500 mb-4">RFP Summarizer</h1>
            </div>
          </div>

            {loading ? (
              <div className="sphere-container d-flex align-items-center justify-content-center w-100 py-5">
                <div className="sphere sphere-animate"></div>
              </div>
            ) : showUpload ? (
            <div className="row">
              <div className="col-12 col-md-6">
                <div className="card card-tool card-tool--no-hover rounded shadow-sm bg-white py-3 pointer">
                  <div className="card-body text-left d-flex flex-column">
                  <div className="tool-icon rounded-3 mb-2 align-self-start p-2">
                        <SummaryIcon />
                    </div>
                    <p className="card-text mb-0">
                      Upload an RFP document to get a concise summary of key points like deadlines, required documents, and evaluation criteria.
                    </p>
                    <input
                      type="file"
                      className="form-control my-3"
                      onChange={handleFileChange}
                      accept=".pdf,.doc,.docx,.txt"
                    />
                    <button
                      className="btn btn-primary d-flex align-items-center align-self-start ms-auto"
                      onClick={handleGenerateClick}
                      disabled={!selectedFile}
                    >
                      Get Summary
                      <MagicWandIcon className="ms-2 icon icon-white" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : loading ? (
            <div className="sphere-container d-flex align-items-center justify-content-center w-100 py-5">
              <div className="sphere sphere-animate"></div>
            </div>
          ) : (
            <div className="row">
              <div className="col-12 col-md-6 col-xl-8">
                <div className="card card-tool card-tool--no-hover rounded shadow-sm bg-white py-3 pointer">
                  <div className="card-body text-left d-flex flex-column">
                  <div className="tool-icon rounded-3 mb-2 align-self-start p-2">
                        <SummaryIcon />
                    </div>
                    <div className="mt-4">
                      {typeof window !== 'undefined' && <ReactMarkdown>{analysisResult}</ReactMarkdown>}
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-12 col-md-6 col-xl-4 mb-4 mt-4 mt-md-0">

              {!loading && rfpDetails && (
                    <FeedbackButtonsRfp
                    rfpSummaryId={rfpDetails.id}
                    initialLikes={rfpDetails.likes || 0}
                    initialDislikes={rfpDetails.dislikes || 0}
                  />
              )}

              {!loading && rfpThreadId && rfpAssistantId && rfpDetails &&  (
                  <ChatBot threadId={rfpThreadId} assistantId={rfpAssistantId} />
              )}
                

              {!loading && rfpDetails && (
                <>
              <div className="col-12 d-flex gap-2">
              {rfpDetails.matchScore && (
                <div className="card  card-tool card-tool--no-hover rounded shadow-sm bg-white py-3 pointer mb-2 w-50">
                  <div className="card-body text-left d-flex flex-column flex-sm-row py-0 align-items-start">
                    <div className="tool-icon rounded-3 me-1 align-self-start p-2">
                      <PerformanceIcon />
                    </div>
                    <div className="d-flex flex-column">
                    <span className="card-title small m-0">Match Score</span>
                    <span className="card-text fw-bold m-0 lh-1 h4">{rfpDetails.matchScore}</span>
                    </div>
                  </div>
                </div>
                )}

                {countdown !== null && countdown !== undefined && (
                <div className="card  card-tool card-tool--no-hover rounded shadow-sm bg-white py-3 pointer mb-2 w-50">
                  <div className="card-body text-left d-flex flex-column flex-sm-row py-0 align-items-start">
                    <div className="tool-icon rounded-3 me-1 align-self-start p-2">
                      <CountdownIcon />
                    </div>
                    <div className="d-flex flex-column">
                    <span className="card-title small m-0">Days Left</span>
                    <span className="card-text fw-bold m-0 lh-1 h4">{countdown}</span>
                    </div>
                  </div>
                </div>
                )}
                </div>

                <div className="col-12 d-flex gap-2">
                  
                {rfpDetails.naics && (
                <div className="card  card-tool card-tool--no-hover rounded shadow-sm bg-white py-3 pointer mb-2 w-50">
                  <div className="card-body text-left d-flex flex-column flex-sm-row py-0">
                    <div className="tool-icon rounded-3 me-1 align-self-start p-2">
                      <NaicsIcon />
                    </div>
                    <div className="d-flex flex-column">
                    <span className="card-title small m-0">NAICS</span>
                    <span className="card-text fw-bold m-0 lh-1">{rfpDetails.naics}</span>
                    </div>
                  </div>
                </div>
                )}

                {graphFile && (
                <button onClick={() => showModal(graphFile.current)} className="btn btn--white text-dark mb-2 w-50 pointer">View RFP</button>
                )}
                </div>

                {rfpDetails.title && (
                <div className="card  card-tool card-tool--no-hover rounded shadow-sm bg-white py-3 pointer mb-2">
                  <div className="card-body text-left d-flex flex-column flex-sm-row py-0">
                    <div className="tool-icon rounded-3 me-1 align-self-start p-2">
                      <FilesIcon />
                    </div>
                    <div className="d-flex flex-column justify-content-center">
                    <span className="card-text fw-bold m-0 lh-1">{rfpDetails.title}</span>
                    {rfpDetails.rfpNumber && (
                        <span className="small">{rfpDetails.rfpNumber}</span>
                      )}
                    </div>
                  </div>
                </div>
                )}
           
                {rfpDetails.deadline && (
                <div className="card  card-tool card-tool--no-hover rounded shadow-sm bg-white py-3 pointer mb-2">
                  <div className="card-body text-left d-flex flex-column flex-sm-row py-0">
                    <div className="tool-icon rounded-3 me-1 align-self-start p-2">
                      <CalendarIcon />
                    </div>
                    <div className="d-flex flex-column">
                    <span className="card-title small m-0">Deadline</span>
                    <span className="card-text fw-bold m-0 lh-1">{formatModifiedDate(rfpDetails.deadline)} <span className="fst-italic">{rfpDetails.deadlineTime}</span></span>
                    </div>
                  </div>
                </div>
                )}

                {rfpDetails.issuingOrganization && (
                <div className="card  card-tool card-tool--no-hover rounded shadow-sm bg-white py-3 pointer mb-2">
                <div className="card-body text-left d-flex flex-column flex-sm-row py-0">
                  <div className="tool-icon rounded-3 me-1 align-self-start p-2">
                    <BuildingIcon />
                  </div>
                  <div className="d-flex flex-column">
                  <span className="card-title small m-0">Issuing Organization</span>
                  <span className="card-text fw-bold m-0 lh-1">{rfpDetails.issuingOrganization} 
                    {/* {rfpDetails.state && (
                      <span>| <span className="fst-italic">{rfpDetails.state}</span></span>
                    )} */}
                  </span>
                  {/* {rfpDetails.State && (
                    <span>{rfpDetails.State}</span>
                  )} */}
                  </div>
                </div>
                </div>
                )}


              {rfpDetails.typeOfContract && (
                <div className="card  card-tool card-tool--no-hover rounded shadow-sm bg-white py-3 pointer mb-2">
                  <div className="card-body text-left d-flex flex-column flex-sm-row py-0">
                    <div className="tool-icon rounded-3 me-1 align-self-start p-2">
                      <TilesIcon />
                    </div>
                    <div className="d-flex flex-column">
                    <span className="card-title small m-0">Type</span>
                    <span className="card-text fw-bold m-0 lh-1">{rfpDetails.typeOfContract}</span>
                    </div>
                  </div>
                </div>
                )}


                {rfpDetails.contactName && (
                <div className="card  card-tool card-tool--no-hover rounded shadow-sm bg-white py-3 pointer mb-2">
                  <div className="card-body text-left d-flex flex-column flex-sm-row py-0">
                    <div className="tool-icon rounded-3 me-1 align-self-start p-2">
                      <OrgIcon />
                    </div>
                    <div className="d-flex flex-column text-truncate">
                    <span className="card-title small m-0">Contact</span>
                      {rfpDetails.contactName && (
                        <span className="card-text fw-bold m-0 lh-1 d-block text-truncate">{rfpDetails.contactName}</span>
                      )}
                      {rfpDetails.contactEmail && (
                        <span className="d-block text-truncate">{rfpDetails.contactEmail}</span>
                      )}
                      {rfpDetails.contactPhone && (
                        <span className="d-block text-truncate">{rfpDetails.contactPhone}</span>
                      )}
                    </div>
                  </div>
                </div>
                )}

              {rfpDetails.keyDates && rfpDetails.keyDates.length > 0 && (
                <div className="card  card-tool card-tool--no-hover rounded shadow-sm bg-white py-3 pointer mb-2">
                  <div className="card-body text-left d-flex flex-column flex-sm-row py-0">
                    <div className="tool-icon rounded-3 me-1 align-self-start p-2">
                      <CalendarIcon />
                    </div>
                    <div className="d-flex flex-column">
                    <span className="card-title small m-0">Key Dates</span>
                    {rfpDetails.keyDates.map((date, index) => (
                      <span className="card-text fw-bold m-0 lh-1" key={index}>{date}</span>
                    ))}
                    </div>
                  </div>
                </div>
                )}

              {rfpDetails.requirements && (
                <div className="card  card-tool card-tool--no-hover rounded shadow-sm bg-white py-3 pointer mb-2">
                  <div className="card-body text-left d-flex flex-column flex-sm-row py-0">
                    <div className="tool-icon rounded-3 me-1 align-self-start p-2">
                      <ListIcon />
                    </div>
                    <div className="d-flex flex-column">
                    <span className="card-title small m-0">Requirements</span>
                    {typeof window !== 'undefined' && 
                    <div className="card-text m-0"><ReactMarkdown>{rfpDetails.requirements}</ReactMarkdown></div>
                    } 
                    </div>
                  </div>
                </div>
                )}
              
                </>
              )}
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

export default RfpSummarizer;
