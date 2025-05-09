'use client';

import React, { useContext, useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import MagicWandIcon from '../../../../../public/images/icons/magic-wand.svg';
import SummaryIcon from '../../../../../public/images/icons/summary.svg';
import ReactMarkdown from 'react-markdown';
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
import { format, isValid } from 'date-fns'; 
import { useToast } from '@/app/context/ToastContext';
import gsap from 'gsap';
import Link from 'next/link';
import HomeIcon from '../../../../../public/images/icons/home.svg';
import ChevronIcon from '../../../../../public/images/icons/chevron.svg';
import AddOpportunityButton from '@/app/components/dev/AddOpportunityButton';

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
  const [matchScore, setMatchScore] = useState(null);
  const [matchScoreLoading, setMatchScoreLoading] = useState(true);
  const [analysisLoading, setAnalysisLoading] = useState(true);
  const graphFile = useRef(null);
  const { openModal } = useContext(FileViewerContext);
  const searchParams = useSearchParams();
  const slug = searchParams.get('slug');
  const router = useRouter();
  const { addToast } = useToast();
  
  

  const formatModifiedDate = (dateString) => {
    try {
      const date = new Date(dateString);
      if (!isValid(date)) {
        throw new Error('Invalid date');
      }
      return format(date, 'MMM d, yyyy');
    } catch (error) {
      console.warn('Invalid date provided:', dateString);
      return 'N/A';
    }
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const cardsContainer1Ref = useRef(null);
  const cardsContainer2Ref = useRef(null);

// 2) Animate on mount/updates
useEffect(() => {
  // Only run GSAP if we're not loading and we have details or cards to animate
  if (!loading && cardsContainer1Ref.current) {
    // Animate all `.card` elements inside the container
    gsap.from(cardsContainer1Ref.current.querySelectorAll('.tile-animate'), {
      y: 20,        // move 20px up
      opacity: 0,   // start at 0 opacity
      duration: 0.6,
      stagger: 0.1, // delay each card slightly
      ease: 'power2.out'
    });
  }
}, [loading]); 

useEffect(() => {
  // Only run GSAP if we're not loading and we have details or cards to animate
  if (!loading && cardsContainer2Ref.current) {
    // Animate all `.card` elements inside the container
    gsap.from(cardsContainer2Ref.current.querySelectorAll('.tile-animate'), {
      y: 20,        // move 20px up
      opacity: 0,   // start at 0 opacity
      duration: 0.6,
      stagger: 0.1, // delay each card slightly
      ease: 'power2.out'
    });
  }
}, [rfpDetails]); 

  const handleGenerateClick = async () => {
    setLoading(true);
    setAnalysisResult('');
    setShowUpload(false);
  
    try {
      if (selectedFile) {
        track('RFP Summarizer', { file: selectedFile.name, user: session.user.id });


        // Anaylze with API while assistant loads
        // const response = await fetch('/api/rfp-analyzer', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({ description: sanitizedRfpText }),
        // });

        // const fileReader = new FileReader();

        // fileReader.onload = async (e) => {
        //   const fileContent = e.target.result;

        //   // 2. Sanitize or preprocess text as needed
        //   const sanitizedRfpText = fileContent?.toString() ?? '';

        //   // 3. POST the text to your /api/rfp-analyzer endpoint
        //   const analyzeResponse = await fetch('/api/rfp-analyzer', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify({ description: sanitizedRfpText }),
        //   });

        //   if (!analyzeResponse.ok) {
        //     throw new Error('Error analyzing RFP text');
        //   }
          
        //   // Optionally, grab the response data
        //   const result = await analyzeResponse.json();
        //   console.log('RFP Analyzer response:', result);
        // };

        //fileReader.readAsText(selectedFile);

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
                    //getMatchScore(rfpThreadIdRef.current, rfpAssistantIdRef.current, fullMessage);
                    getAnalysis(rfpThreadIdRef.current, rfpAssistantIdRef.current);
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
            setMatchScore(response.data.matchScore);
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
            setAnalysisLoading(false);
            setMatchScoreLoading(false);
          }
        } catch (error) {
          console.error('Error fetching existing summary:', error);
        } finally {
          setLoading(false);
          setAnalysisLoading(false);
          setMatchScoreLoading(false);
        }
      } else {
        setLoading(false); 
      }
    };
  
    fetchExistingSummary();
  }, [slug]);

  // 1. Extract the quick info only, leaving out the match score logic
const getMatchScore = async (threadId, assistantId, analysisResult) => {
  try {
    const userPrompt = `
      Now perform an analysis to generate a Match Score. 
    
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

      Do NOT include any other text or fields. 
      Return the JSON in the exact structure:

      {
        "matchScore": "",
      }
    `;

    // 1. Send prompt to your backend route
    await axios.post('/api/openai/message', { threadId, userPrompt });

    // 2. Then run the assistant endpoint
    const response = await fetch('/api/openai/assistant/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ threadId, assistantId }),
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

              if (parsedEvent?.event === 'thread.message.delta') {
                const contentDelta = parsedEvent.data?.delta?.content;

                if (Array.isArray(contentDelta)) {
                  for (const content of contentDelta) {
                    if (content.type === 'text' && content.text?.value) {
                      fullMessage += content.text.value;
                    }
                  }
                }
              }

              if (parsedEvent?.event === 'thread.message.completed') {
                // Clean up the JSON string
                const cleanedString = fullMessage.replace(/```json|```/g, '').trim();

                try {
                  parsedJson = JSON.parse(cleanedString);
                  console.log('Technical Info JSON:', parsedJson);
                  setMatchScore(parsedJson.matchScore);
                  setMatchScoreLoading(false);
                  getAnalysis(rfpThreadIdRef.current, rfpAssistantIdRef.current, analysisResult, parsedJson.matchScore);
                  // Example: do something with parsedJson here...
                  // Possibly store in database or merge it into your app state.

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
  } catch (error) {
    console.error('Error getting technical info:', error);
  }
};

  const getAnalysis = async (threadId, assistantId) => {
    try {
      const userPrompt = `
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
          "notary": false
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
                      setAnalysisLoading(false);
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
        matchScore: parseInt(matchScore, 10),
        issuingOrganization: parsedJson.issuingOrganization,
        state: parsedJson.state,
        contactName: parsedJson.contactName,
        contactEmail: parsedJson.contactEmail,
        contactPhone: parsedJson.contactPhone,
        requirements: parsedJson.requirements,
        documentLink: graphFile.current.id,
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

  const handleOpportunityAdded = (newOpportunity) => {
    //setOpportunities(prev => [newOpportunity, ...prev]);
    //todo
  };

  

  return (
    <>
      <section className="px-4 px-lg-5 pt-5 pb-6 mb-8">
        <div className="container position-relative">
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
                  <span className="text-nowrap d-block text-truncate">RFP Summarizer</span>
                </Link>
              </div>
              </div>
            <div className="col-12">
              <h1 className="fw-bold-500 mb-4">RFP Summarizer</h1>
            </div>
          </div>

            {loading ? (
              <div className="sphere-container sphere-fullscreen d-flex align-items-center justify-content-center w-100 py-5 mt-5">
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
            <div className="sphere-container sphere-fullscreen d-flex align-items-center justify-content-center w-100 h-100 py-5 mt-5">
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
                      <ReactMarkdown>{analysisResult}</ReactMarkdown>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-12 col-md-6 col-xl-4 mb-4 mt-4 mt-md-0" ref={cardsContainer1Ref}>

              <div className="col-12 d-flex flex-column gap-2">
              <div className="d-flex flex-column">
                      <AddOpportunityButton
                          onOpportunityAdded={handleOpportunityAdded}
                          initialData={rfpDetails} 
                        />
                    </div>
                <div className="d-flex gap-2">
             
                <div className="card  card-tool card-tool--no-hover rounded shadow-sm bg-white py-3 pointer w-50 tile-animate">
                  <div className="card-body text-left d-flex flex-column flex-sm-row py-0 align-items-start">
                    <div className="tool-icon rounded-3 me-1 align-self-start p-2">
                      <PerformanceIcon />
                    </div>
                    <div className="d-flex flex-column">
                    <span className="card-title small m-0">Match Rating</span>
                      {matchScoreLoading ? (
                        <div className="sphere-container sphere-small d-flex align-items-center w-100 p-0 m-0">
                          <div className="sphere sphere-animate"></div>
                        </div>
                      ) : (
                        <span className="card-text fw-bold m-0 lh-1 h4">{matchScore}</span>
                      )}
                   </div>
                  </div>
                </div>
              

 
                <div className="card  card-tool card-tool--no-hover rounded shadow-sm bg-white py-3 pointer w-50 tile-animate">
                  <div className="card-body text-left d-flex flex-column flex-sm-row py-0 align-items-start">
                    <div className="tool-icon rounded-3 me-1 align-self-start p-2">
                      <CountdownIcon />
                    </div>
                    <div className="d-flex flex-column">
                      <span className="card-title small m-0 ps-1">Days Left</span>
                      {analysisLoading ? (
                          <div className="sphere-container sphere-small d-flex align-items-center w-100 p-0 m-0">
                            <div className="sphere sphere-animate"></div>
                          </div>
                      ) : (
                        (countdown !== null && countdown !== undefined) && (
                          <span className="card-text fw-bold m-0 lh-1 h4 ps-1">{countdown}</span>
                        )
                      )}
                    </div>
                  </div>
                </div>
                </div>

                  {/* {!loading && rfpDetails && ( */}
                  <div class="tile-animate">
                    <FeedbackButtonsRfp
                    rfpSummaryId={rfpDetails?.id || null}
                    initialLikes={rfpDetails?.likes || 0}
                    initialDislikes={rfpDetails?.dislikes || 0}
                  />
                  </div>
               {/* )}  */}

              {rfpThreadId && rfpAssistantId &&  (
                <div class="tile-animate">
                  <ChatBot threadId={rfpThreadId} assistantId={rfpAssistantId} />
                </div>
              )}
                
          
                </div>


              {!loading && rfpDetails && (
                <>
            <div className="col-12 d-flex flex-column gap-2" ref={cardsContainer2Ref}>


              {rfpDetails.deadline && (
                <div className="card  card-tool card-tool--no-hover rounded shadow-sm bg-white py-3 pointer w-100 tile-animate">
                  <div className="card-body text-left d-flex flex-column flex-sm-row py-0">
                    <div className="tool-icon rounded-3 me-1 align-self-start p-2">
                      <CalendarIcon />
                    </div>
                    <div className="d-flex flex-column">
                    <span className="card-title small m-0 ps-1">Deadline</span>
                    <span className="card-text fw-bold m-0 lh-1 ps-1">{formatModifiedDate(rfpDetails.deadline)} <span className="fst-italic">{rfpDetails.deadlineTime}</span></span>
                    </div>
                  </div>
                </div>
                )}
             

              
                  <div class="d-flex gap-2">
                {rfpDetails.naics && (
                <div className="card  card-tool card-tool--no-hover rounded shadow-sm bg-white py-3 pointer mb-2 w-50 tile-animate">
                  <div className="card-body text-left d-flex flex-column flex-sm-row py-0">
                    <div className="tool-icon rounded-3 me-1 align-self-start p-2">
                      <NaicsIcon />
                    </div>
                    <div className="d-flex flex-column">
                    <span className="card-title small m-0 ps-1">NAICS</span>
                    <span className="card-text fw-bold m-0 lh-1 ps-1">{rfpDetails.naics}</span>
                    </div>
                  </div>
                </div>
                )}

                {graphFile && (
                <button onClick={() => showModal(graphFile.current)} className="btn btn--white text-dark mb-2 w-50 pointer tile-animate">View RFP</button>
                )}
                </div>
                </div>

                {rfpDetails.title && (
                <div className="card  card-tool card-tool--no-hover rounded shadow-sm bg-white py-3 pointer mb-2 tile-animate">
                  <div className="card-body text-left d-flex flex-column flex-sm-row py-0">
                    <div className="tool-icon rounded-3 me-1 align-self-start p-2">
                      <FilesIcon />
                    </div>
                    <div className="d-flex flex-column justify-content-center">
                    <span className="card-text fw-bold m-0 lh-1 ps-1">{rfpDetails.title}</span>
                    {rfpDetails.rfpNumber && (
                        <span className="small">{rfpDetails.rfpNumber}</span>
                      )}
                    </div>
                  </div>
                </div>
                )}
          

                {rfpDetails.issuingOrganization && (
                <div className="card  card-tool card-tool--no-hover rounded shadow-sm bg-white py-3 pointer mb-2 tile-animate">
                <div className="card-body text-left d-flex flex-column flex-sm-row py-0">
                  <div className="tool-icon rounded-3 me-1 align-self-start p-2">
                    <BuildingIcon />
                  </div>
                  <div className="d-flex flex-column">
                  <span className="card-title small m-0 ps-1">Issuing Organization</span>
                  <span className="card-text fw-bold m-0 lh-1 ps-1">{rfpDetails.issuingOrganization} 
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
                <div className="card  card-tool card-tool--no-hover rounded shadow-sm bg-white py-3 pointer mb-2 tile-animate">
                  <div className="card-body text-left d-flex flex-column flex-sm-row py-0">
                    <div className="tool-icon rounded-3 me-1 align-self-start p-2">
                      <TilesIcon />
                    </div>
                    <div className="d-flex flex-column">
                    <span className="card-title small m-0 ps-1">Type</span>
                    <span className="card-text fw-bold m-0 lh-1 ps-1">{rfpDetails.typeOfContract}</span>
                    </div>
                  </div>
                </div>
                )}


                {rfpDetails.contactName && (
                <div className="card  card-tool card-tool--no-hover rounded shadow-sm bg-white py-3 pointer mb-2 tile-animate">
                  <div className="card-body text-left d-flex flex-column flex-sm-row py-0">
                    <div className="tool-icon rounded-3 me-1 align-self-start p-2">
                      <OrgIcon />
                    </div>
                    <div className="d-flex flex-column text-truncate">
                    <span className="card-title small m-0 ps-1">Contact</span>
                      {rfpDetails.contactName && (
                        <span className="card-text fw-bold m-0 lh-1 d-block text-truncate ps-1">{rfpDetails.contactName}</span>
                      )}
                      {rfpDetails.contactEmail && (
                        <span className="d-block text-truncate ps-1">{rfpDetails.contactEmail}</span>
                      )}
                      {rfpDetails.contactPhone && (
                        <span className="d-block text-truncate ps-1">{rfpDetails.contactPhone}</span>
                      )}
                    </div>
                  </div>
                </div>
                )}

              {rfpDetails.keyDates && rfpDetails.keyDates.length > 0 && (
                <div className="card  card-tool card-tool--no-hover rounded shadow-sm bg-white py-3 pointer mb-2 tile-animate">
                  <div className="card-body text-left d-flex flex-column flex-sm-row py-0">
                    <div className="tool-icon rounded-3 me-1 align-self-start p-2">
                      <CalendarIcon />
                    </div>
                    <div className="d-flex flex-column">
                    <span className="card-title small m-0 ps-1">Key Dates</span>
                    {rfpDetails.keyDates.map((date, index) => (
                      <span className="card-text fw-bold m-0 lh-1 ps-1" key={index}>{date}</span>
                    ))}
                    </div>
                  </div>
                </div>
                )}

              {rfpDetails.requirements && (
                <div className="card  card-tool card-tool--no-hover rounded shadow-sm bg-white py-3 pointer mb-2 tile-animate">
                  <div className="card-body text-left d-flex flex-column flex-sm-row py-0">
                    <div className="tool-icon rounded-3 me-1 align-self-start p-2">
                      <ListIcon />
                    </div>
                    <div className="d-flex flex-column">
                    <span className="card-title small m-0 ps-1">Requirements</span>
                    <div className="card-text m-0 ps-1"><ReactMarkdown>{rfpDetails.requirements}</ReactMarkdown></div>
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
