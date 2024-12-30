'use client';

import React, { useState, useEffect } from 'react';
import { Modal, Form, Button } from 'react-bootstrap';
import axios from 'axios';
import { useToast } from '@/app/context/ToastContext';

const AddState = ({ show, handleClose, onStateAdded }) => {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [businessLicense, setBusinessLicense] = useState('');
  const [bidWebsite, setBidWebsite] = useState('');
  const [creating, setCreating] = useState(false);
  const { addToast } = useToast();

  const handleCreateState = async () => {
    if (!code.trim() || !name.trim()) {
      alert('State Code and Name cannot be empty');
      return;
    }

    setCreating(true);

    try {
      const response = await axios.post('/api/states', {
        code,
        name,
        businessLicense,
        bidWebsite,
      });

      if (response.status === 201) {
        addToast('State added successfully.', 'success');
        if (onStateAdded) {
          onStateAdded(response.data);
        }
        handleClose();
      } else {
        throw new Error('Error adding state');
      }
    } catch (error) {
      console.error('Error adding state:', error);
      addToast('Failed to add state.', 'danger');
    } finally {
      setCreating(false);
    }
  };

  useEffect(() => {
    if (!show) {
      setCode('');
      setName('');
      setBusinessLicense('');
      setBidWebsite('');
    }
  }, [show]);

  return (
    <Modal show={show} onHide={handleClose} centered className="add-state text-figtree">
      <Modal.Header className="d-flex flex-column align-items-start p-4 pb-1 border-0">
        <div className="d-flex justify-content-between align-items-center w-100 mb-2">
          <Modal.Title className="fw-bold-600 h5">Add New State</Modal.Title>
          <button className="btn-close p-0" onClick={handleClose} aria-label="Close"></button>
        </div>
        <span className="small">Add a new state to the registry.</span>
      </Modal.Header>
      <Modal.Body className="px-4">
        <Form.Group controlId="stateCode" className="mb-3">
          <Form.Label>State Code</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter state code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
        </Form.Group>
        <Form.Group controlId="stateName" className="mb-3">
          <Form.Label>State Name</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter state name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Form.Group>
        <Form.Group controlId="businessLicense" className="mb-3">
          <Form.Label>Business License Number</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter business license number"
            value={businessLicense}
            onChange={(e) => setBusinessLicense(e.target.value)}
          />
        </Form.Group>
        <Form.Group controlId="bidWebsite" className="mb-3">
          <Form.Label>Bid Website</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter bid website URL"
            value={bidWebsite}
            onChange={(e) => setBidWebsite(e.target.value)}
          />
        </Form.Group>
      </Modal.Body>
      <Modal.Footer className="d-flex pt-0 px-4 pb-4 gap border-0">
        <Button className="btn btn--white text-dark" onClick={handleClose}>
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleCreateState}
          disabled={creating || !code.trim() || !name.trim()}
        >
          {creating ? 'Creating...' : 'Add State'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AddState;