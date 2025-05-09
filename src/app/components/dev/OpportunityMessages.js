'use client';

import { useEffect, useState } from 'react';

const OpportunityMessages = ({ opportunityId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [employee, setEmployee] = useState(null);

  useEffect(() => {
    // Get employee from localStorage
    const stored = localStorage.getItem('employee');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setEmployee(parsed);
      } catch (e) {
        console.error('Failed to parse employee from localStorage');
      }
    }
  }, []);

  useEffect(() => {
    const fetchMessages = async () => {
      const res = await fetch(`/api/opportunity/messages?opportunityId=${opportunityId}`);
      const data = await res.json();
      if (res.ok) setMessages(data);
    };

    fetchMessages();
  }, [opportunityId]);

  const handleSubmit = async () => {
    if (!newMessage.trim() || !employee) return;

    setLoading(true);
    const res = await fetch('/api/opportunity/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ opportunityId, employeeId: employee.id, message: newMessage }),
    });

    if (res.ok) {
      const { message } = await res.json();
      // Attach employee info so initials render instantly
      setMessages((prev) => [
        { ...message, employee, createdAt: new Date().toISOString() },
        ...prev,
      ]);
      setNewMessage('');
    }

    setLoading(false);
  };

  return (
    <div className="card mt-4">
      <div className="card-header fw-bold">Status Updates</div>
      <div className="card-body" style={{ maxHeight: '300px', overflowY: 'auto' }}>
        {messages.length === 0 && <p className="text-muted">No updates yet.</p>}
        {messages.map((msg) => (
          <div key={msg.id || msg.createdAt} className="mb-3 d-flex">
            <div className="fw-bold bg-light py-2 px-3 me-2 rounded-4">
              {msg.employee?.firstName?.charAt(0)}
              {msg.employee?.lastName?.charAt(0)}
            </div>
            <div className="d-flex flex-column">
              <div>{msg.message}</div>
              <small className="text-muted">  {new Date(msg.createdAt).toLocaleString([], { year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</small>
            </div>
          </div>
        ))}
      </div>
      <div className="card-footer d-flex">
        <input
          type="text"
          className="form-control me-2"
          placeholder="Add an update..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        />
        <button
          className="btn btn-primary"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? 'Sending...' : 'Send'}
        </button>
      </div>
    </div>
  );
};

export default OpportunityMessages;