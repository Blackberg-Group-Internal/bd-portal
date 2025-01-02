'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import AiIcon from '../../../public/images/icons/ai.svg';
import SendIcon from '../../../public/images/icons/send.svg';
import CloseIcon from '../../../public/images/icons/close.svg';
import ReactMarkdown from 'react-markdown';

const ChatBot = () => {
  const { data: session } = useSession();
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatBodyRef = useRef(null);
  const lastMessageRef = useRef(null);
  const [currentMessage, setCurrentMessage] = useState(''); 
  const [userScrolled, setUserScrolled] = useState(false); 
  const [userProfilePhoto, setUserProfilePhoto] = useState(null);

  useEffect(() => {
    setUserProfilePhoto(localStorage.getItem("userProfilePhoto"));
    const storedMessages = localStorage.getItem('chatMessages');
    if (storedMessages) {
      setMessages(JSON.parse(storedMessages));
    }
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('chatMessages', JSON.stringify(messages));
    }
  }, [messages]);

  useEffect(() => {
    if (chatOpen && chatBodyRef.current) {
      setTimeout(() => {
        chatBodyRef.current.scrollTo({
          top: chatBodyRef.current.scrollHeight,
          behavior: 'smooth',
        });
      }, 100); 
    }
  }, [chatOpen]);

  const toggleChat = () => {
    setChatOpen(!chatOpen);
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);
    setCurrentMessage('');

    if (chatBodyRef.current) {
      setTimeout(() => {
        chatBodyRef.current.scrollTo({
          top: chatBodyRef.current.scrollHeight,
          behavior: 'smooth',
        });
      }, 100); 
    }

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updatedMessages }),
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let fullMessage = ''; 
      let initialChunkReceived = false;

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
            const jsonResponse = line.substring(5).trim();
            try {
              const parsedData = JSON.parse(jsonResponse);

              if (parsedData.choices && parsedData.choices[0].delta.content) {
                const newText = parsedData.choices[0].delta.content;

                await new Promise(resolve => setTimeout(resolve, 30));

                fullMessage += newText;

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

                if (!initialChunkReceived && lastMessageRef.current && !userScrolled) {
                  setTimeout(() => {
                    chatBodyRef.current.scrollTo({
                      top: chatBodyRef.current.scrollHeight,
                      behavior: 'smooth',
                    });
                  }, 100);
                  initialChunkReceived = true;
                }
              }
            } catch (err) {
              console.error('Error parsing JSON:', err);
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

  return (
    <>
      <button className="btn btn-primary btn-chat position-absolute bottom-0 end-0 mb-4 me-1 p-0 rounded-3 shadow" onClick={toggleChat}>
        <AiIcon />
      </button>

      {chatOpen && (
        <div className="chat-window card shadow mb-4">
          <div className="card-header d-flex justify-content-between align-items-center p-3 bg-primary text-white border-bottom-0">
            <AiIcon className="icon icon-white" />
            <p className="mb-0 fw-bold">AI Assistant</p>
            <button className="btn btn-text p-0" onClick={toggleChat}>
              <CloseIcon />
            </button>
          </div>
          <div className="card-body chat-body" ref={chatBodyRef} onScroll={handleScroll}>
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`d-flex flex-row ${msg.role}-row ${msg.role === 'user' ? 'justify-content-end' : 'justify-content-start'} mb-4`}
                ref={index === messages.length - 1 ? lastMessageRef : null}
              >
                {msg.role === 'assistant' && (
                  <div className="sphere-container">
                    <div className="sphere"></div>
                  </div>
                )}
                <div className={`msg-container rounded p-3 ${msg.role === 'user' ? 'me-2 bg-body-tertiary' : 'ms-2'}`}>
                  {msg.role === 'assistant' ? (
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  ) : (
                    <p className="small mb-0">{msg.content}</p>
                  )}
                </div>
                {msg.role === 'user' && session && session.user && (
                  <img src={userProfilePhoto} alt={session.user.name} style={{ width: '40px', height: '100%' }} />
                )}
              </div>
            ))}
          </div>
          <div className="card-footer">
            <div className="d-flex form-outline py-2">
              <input
                className="form-control bg-body-tertiary"
                type="text"
                value={input}
                onKeyDown={handleKeyPress}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything..."
              />
              <button className="btn btn-text p-0 ms-2" onClick={handleSendMessage}>
                <SendIcon />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBot;
