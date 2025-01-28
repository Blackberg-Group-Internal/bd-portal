'use client';

import React, { useState, useEffect } from 'react';
import { Modal, Form, Button } from 'react-bootstrap';
import axios from 'axios';
import { useToast } from '@/app/context/ToastContext';

const AddCode = ({ show, handleClose, onCodeAdded }) => {
  const [code, setCode] = useState('');
  const [title, setTitle] = useState('');
  const [type, setType] = useState('NAICS'); 
  const [creating, setCreating] = useState(false);
  const { addToast } = useToast();

  const handleCreateCode = async () => {
    if (!code.trim() || !title.trim()) {
      alert('Code and Title cannot be empty');
      return;
    }

    setCreating(true);

    try {
      const endpoint = type === "NAICS" ? "/api/naics" : type === "SINs" ? "/api/sin" : "/api/pscs";
      const response = await axios.post(endpoint, {
        code,
        title,
      });

      if (response.status === 201) {
        addToast('Code created successfully.', 'success');
        if (onCodeAdded) {
          onCodeAdded(response.data, type); // Notify parent of the new code
        }
        handleClose();
      } else {
        throw new Error('Error creating code');
      }
    } catch (error) {
      console.error('Error creating code:', error);
      addToast('Failed to create code.', 'danger');
    } finally {
      setCreating(false);
    }
  };

  useEffect(() => {
    if (!show) {
      setCode('');
      setTitle('');
      setType('NAICS');
    }
  }, [show]);

  return (
    <Modal show={show} onHide={handleClose} centered className="add-code text-figtree">
      <Modal.Header className="d-flex flex-column align-items-start p-4 pb-1 border-0">
        <div className="d-flex justify-content-between align-items-center w-100 mb-2">
          <Modal.Title className="fw-bold-600 h5">Add New Code</Modal.Title>
          <button className="btn-close p-0" onClick={handleClose} aria-label="Close"></button>
        </div>
        <span className="small">Create a new code for the collection.</span>
      </Modal.Header>
      <Modal.Body className="px-4">
        <Form.Group controlId="codeType" className="mb-3">
          <Form.Label>Type</Form.Label>
          <Form.Select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="NAICS">NAICS</option>
            <option value="SINs">SINs</option>
            <option value="PSCs">PSCs</option>
          </Form.Select>
        </Form.Group>
        <Form.Group controlId="code" className="mb-3">
          <Form.Label>Code</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
        </Form.Group>
        <Form.Group controlId="title">
          <Form.Label>Title</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </Form.Group>
      </Modal.Body>
      <Modal.Footer className="d-flex pt-0 px-4 pb-4 gap border-0">
        <Button className="btn btn--white text-dark" onClick={handleClose}>
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleCreateCode}
          disabled={creating || !code.trim() || !title.trim()}
        >
          {creating ? 'Creating...' : 'Create Code'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AddCode;
