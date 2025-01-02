'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import AiIcon from '../../../../public/images/icons/ai.svg';
import SendIcon from '../../../../public/images/icons/send.svg';
import CloseIcon from '../../../../public/images/icons/close.svg';
import TargetIcon from '../../../../public/images/icons/target.svg';
import AlertIcon from '../../../../public/images/icons/alert.svg';
import AlignIcon from '../../../../public/images/icons/align.svg';
import UniqueIcon from '../../../../public/images/icons/lightbulb.svg';
import ExpandIcon from '../../../../public/images/icons/plus.svg';
import ReactMarkdown from 'react-markdown';

const ChatBot = ({ threadId, assistantId }) => {
  const { data: session } = useSession();
  const [chatOpen, setChatOpen] = useState(true);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatBodyRef = useRef(null);
  const lastMessageRef = useRef(null);
  const [currentMessage, setCurrentMessage] = useState('');
  const [userScrolled, setUserScrolled] = useState(false);
  const [userProfilePhoto, setUserProfilePhoto] = useState(null);
  const chatContainerRef = useRef(null); 

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setUserProfilePhoto(localStorage.getItem('userProfilePhoto'));
    }
  }, []);
  
  useEffect(() => {
    if (chatOpen && chatBodyRef.current) {
      setTimeout(() => {
        chatBodyRef.current.scrollTo({
          top: chatBodyRef.current.scrollHeight + 50,
          behavior: 'smooth',
        });
      }, 100);
    }
  }, [chatOpen]);

  useEffect(() => {
    const storedMessages = localStorage.getItem('chatMessages-' + threadId);
    if (storedMessages) {
      setMessages(JSON.parse(storedMessages));
    }
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('chatMessages-' + threadId, JSON.stringify(messages));
    }
  }, [messages]);


  const toggleChat = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.classList.toggle('chat-open'); // Toggle the 'chat-open' class
    }
  };

  const handleSendMessage = async (prompt, showInChat = true) => {
    const messageContent = prompt || input;
    if (!messageContent.trim()) return;
  
    if (showInChat) {
      const userMessage = { role: 'user', content: messageContent };
      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);
    }
    
    setInput('');
    setLoading(true);
    setCurrentMessage('');
  
    if (chatBodyRef.current && showInChat) {
      setTimeout(() => {
        chatBodyRef.current.scrollTo({
          top: chatBodyRef.current.scrollHeight,
          behavior: 'smooth',
        });
      }, 100);
    }
  
    try {
      // Add message to thread using the new API
      await fetch('/api/openai/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          threadId,
          userPrompt: 'answers going forward no longer have to be returned in JSON. here is the next message: ' + messageContent,
        }),
      });
  
      // Run assistant and get streaming response
      const response = await fetch('/api/openai/assistant/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ threadId, assistantId }),
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
          const lines = chunk.split('\n').filter((line) => line.trim() !== '');
  
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
                      }
                    }
                    setCurrentMessage(fullMessage);
                    setMessages((prevMessages) => {
                      const lastMessage = prevMessages[prevMessages.length - 1];
                      if (lastMessage && lastMessage.role === 'assistant') {
                        return [
                          ...prevMessages.slice(0, -1),
                          { role: 'assistant', content: fullMessage },
                        ];
                      } else {
                        return [...prevMessages, { role: 'assistant', content: fullMessage }];
                      }
                    });
                  }
                }
  
                if (parsedEvent?.event === 'thread.message.completed') {
                  setLoading(false);
                }
  
              } catch (err) {
                console.error('Error parsing JSON:', err);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const handleScroll = () => {
    const { scrollTop, scrollHeight, clientHeight } = chatBodyRef.current;
    if (scrollHeight - scrollTop !== clientHeight) {
      setUserScrolled(true);
    } else {
      setUserScrolled(false);
    }
  };

  const prompts = {
    strategy: `
    Your task is to develop a Positioning Strategy for the provided RFP, focusing on how Blackberg Group can uniquely meet the client's needs. Analyze the RFP's objectives, requirements, and evaluation criteria to identify key areas where Blackberg Group's services, expertise, and key processes offer exceptional value.

    Instructions:

    Analyze the RFP:

    - Identify the client's primary goals, challenges, and priorities as stated in the RFP.
    - Understand the evaluation criteria to determine what the client values most (e.g., technical expertise, innovative solutions, past performance).
    
    Highlight Blackberg Group's Strengths:

    - Map Blackberg Group's services (Strategy, Operations, Communications, Organizational Effectiveness) to the client's needs.
    - Emphasize key processes and methodologies that align with the RFP requirements (e.g., Technology-Driven Analysis, Change Management Toolkit, AI Integration).
    
    Differentiate from Competitors:

    - Identify unique selling points such as being a Service-Disabled Veteran-Owned Small Business (SDVOSB) and a Woman-Owned Small Business (WOSB).
    - Highlight innovative approaches, proprietary tools, or exceptional past performance.
    
    Strategic Messaging:

    - Craft messaging that resonates with the client's mission and values.
    - Emphasize commitment to public service and enhancing operational excellence.
    
    Recommendations:

    - Suggest strategic approaches to address the client's needs effectively.
    - Propose value-added services that exceed the RFP requirements.
    
    Presentation:

    Organize the information logically, using headings and bullet points for clarity.
    Be concise, persuasive, and focused on the client's perspective.
    `,
    requirements: `
    Your task is to identify and interpret the Unique Requirements outlined in the provided RFP that are critical for proposal development. Focus on requirements that are unusual, highly specific, or that may present challenges or special considerations for contractors. Provide insights on how Blackberg Group can meet or exceed these requirements using our services, key processes, and expertise.

    Instructions:

    Review the RFP Thoroughly:

    - Identify all unique or uncommon requirements, specifications, or stipulations.
    - Look for special compliance standards, certifications, or experience levels that are not commonly requested.
    - Note any bespoke technical requirements, innovative solutions, or cutting-edge technologies specified.
    
    Interpret the Requirements:

    - Explain the implications of each unique requirement.
    - Assess how these requirements may impact the proposal strategy, resource allocation, or project execution.
    
    Align with Blackberg Group's Capabilities:

    - Map each unique requirement to relevant services and key processes offered by Blackberg Group.
    - Highlight how our expertise can meet or exceed these requirements.
    - Emphasize any proprietary methodologies, tools, or experiences that provide an advantage.
    
    Identify Potential Challenges:

    - Discuss any potential difficulties in meeting these unique requirements.
    - Suggest mitigation strategies leveraging Blackberg Group's strengths.
    
    Value Proposition:

    - Articulate how meeting these unique requirements adds value to the client.
    - Demonstrate our commitment to delivering high-quality, tailored solutions.
    
    Recommendations:

    - Provide actionable steps for addressing each unique requirement in the proposal.
    - Suggest ways to showcase our capabilities effectively.
    
    Presentation:

    Organize the information clearly, using headings and bullet points.
    Be concise, ensuring each point is directly relevant to the unique requirements.

    `,
    capabilities: `
    You are tasked with mapping organizational capabilities to client requirements in government RFPs. Your task is to Align Blackberg Group's Capabilities with the specific requirements and objectives outlined in the provided RFP. Provide a detailed analysis that demonstrates how Blackberg Group's services, key processes, and expertise fulfill the client's needs.

    Instructions:

    Review RFP Requirements:

    - List the key requirements, tasks, and deliverables specified in the RFP.
    - Note any technical specifications, compliance standards, or specialized skills required.
    
    Map Services to Requirements:

    - For each requirement, identify the relevant Blackberg Group service area (Strategy, Operations, Communications, Organizational Effectiveness).
    - Explain how our key processes and methodologies address the requirement (e.g., using our Change Management Toolkit for organizational transitions).
    
    Demonstrate Expertise:

    - Provide examples of past projects or case studies where Blackberg Group successfully delivered similar solutions.
    - Highlight any relevant certifications, awards, or recognitions.
    
    Value Addition:

    - Identify areas where Blackberg Group can exceed expectations or offer innovative solutions.
    - Mention capabilities in emerging technologies like AI Integration or Digital Services that could benefit the client.
    
    Presentation:

    - Use a clear format, such as a table or bullet points, to show the alignment between requirements and capabilities.
    - Ensure each point is concise and directly relevant to the RFP.
    `,
    risks: `
    Your task is to Identify Potential Risks associated with the provided RFP from the perspective of Blackberg Group as a potential contractor. Analyze the RFP's scope, requirements, timelines, and other relevant factors to determine possible challenges and propose mitigation strategies.

    Instructions:

    Risk Identification:

    - Examine the RFP for factors that could pose risks (e.g., aggressive timelines, complex technical requirements, regulatory compliance).
    - Consider internal risks (e.g., resource limitations) and external risks (e.g., market volatility).
    
    Risk Analysis:

    - Assess the likelihood of each identified risk occurring.
    - Evaluate the impact each risk could have on project success.
    
    Mitigation Strategies:

    - For each risk, propose practical strategies to prevent or minimize its effect.
    - Highlight how Blackberg Group's expertise and key processes enable effective risk management (e.g., using our Project Management Solution Group to monitor progress).
    
    Contingency Planning:

    - Suggest contingency plans for high-impact risks.
    - Emphasize flexibility and adaptability in approach.
    
    Compliance and Assurance:

    - Address any compliance-related risks with regulations or standards.
    - Demonstrate Blackberg Group's commitment to quality and adherence to best practices.
    
    Presentation:

    - Organize the information in a risk matrix or a table for clarity.
    - Be thorough yet concise, focusing on the most critical risks.
    `
  };
  
  // Function to handle predefined prompt clicks
  const handlePredefinedPromptClick = (key) => {
    if (prompts[key]) {
      handleSendMessage(prompts[key], false); // Pass false to avoid showing it in the chat
    }
  };
  

  return (
    <>
        <div className="chat-window chat-window--rfp card shadow-sm mb-2" ref={chatContainerRef}>
          <div className="card-header d-flex justify-content-center align-items-center p-3 bg-primary text-white border-bottom-0 pointer" onClick={toggleChat}>
            <AiIcon className="icon icon-white me-2" />
            <p className="mb-0 fw-bold">RFP Chat Assistant</p>
            <button className="btn btn-text p-0 position-absolute end-0 me-3 pointer"  
              onClick={(e) => {
                e.stopPropagation();
                toggleChat();
              }}>
              <CloseIcon className="icon icon-white" />
            </button>
          </div>
          <div className="card-body chat-body" ref={chatBodyRef} onScroll={handleScroll}>
            {messages.length === 0 && (
              <div className="predefined-prompts d-flex flex-column align-items-center gap-2">
 
                  <button
                    className="btn btn--white text-dark w-100"
                    onClick={() => handlePredefinedPromptClick("strategy")}
                  >
                    <TargetIcon className="icon me-2" />
                    Positioning Strategy
                  </button>
                  <button
                    className="btn btn--white text-dark w-100"
                    onClick={() => handlePredefinedPromptClick("requirements")}
                  >
                    <UniqueIcon className="icon me-2" />
                    Unique Requirements
                  </button>
                  <button
                    className="btn btn--white text-dark w-100"
                    onClick={() => handlePredefinedPromptClick("capabilities")}
                  >
                    <AlignIcon className="icon me-2" />
                    Align Capabilities
                  </button>
                  <button
                    className="btn btn--white text-dark w-100"
                    onClick={() => handlePredefinedPromptClick("risks")}
                  >
                    <AlertIcon className="icon me-2" />
                    Identify Risks
                  </button>

              </div>
            )}
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`d-flex flex-row ${msg.role}-row ${
                  msg.role === 'user' ? 'justify-content-end' : 'justify-content-start'
                } mb-4`}
                ref={index === messages.length - 1 ? lastMessageRef : null}
              >
                {msg.role === 'assistant' && (
                  <div className="sphere-container">
                    <div className="sphere"></div>
                  </div>
                )}
                <div
                  className={`msg-container p-2 rounded ${
                    msg.role === 'user' ? 'me-2 bg-body-tertiary' : 'ms-2'
                  }`}
                >
                  {msg.role === 'assistant' ? (
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  ) : (
                    <p className="small mb-0">{msg.content}</p>
                  )}
                </div>
                {msg.role === 'user' && session && session.user && (
                  <img
                    src={userProfilePhoto}
                    alt={session.user.name}
                    style={{ width: '40px', height: '100%' }}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="card-footer">
            <div className="d-flex form-outline py-2">
              <input
                className="form-control bg-white"
                type="text"
                value={input}
                onKeyDown={handleKeyPress}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask anything about this RFP..."
              />
              <button className="btn btn-text p-0 ms-2" onClick={handleSendMessage} disabled={loading}>
                <SendIcon />
              </button>
            </div>
          </div>
        </div>
    </>
  );
};

export default ChatBot;