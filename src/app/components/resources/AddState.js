'use client';

import React, { useState, useEffect } from 'react';
import { Modal, Form, Button } from 'react-bootstrap';
import axios from 'axios';
import { useToast } from '@/app/context/ToastContext';

const STATES = [
  { name: "Alabama", code: "AL" },
  { name: "Alaska", code: "AK" },
  { name: "Arizona", code: "AZ" },
  { name: "Arkansas", code: "AR" },
  { name: "California", code: "CA" },
  { name: "Colorado", code: "CO" },
  { name: "Connecticut", code: "CT" },
  { name: "Delaware", code: "DE" },
  { name: "Florida", code: "FL" },
  { name: "Georgia", code: "GA" },
  { name: "Hawaii", code: "HI" },
  { name: "Idaho", code: "ID" },
  { name: "Illinois", code: "IL" },
  { name: "Indiana", code: "IN" },
  { name: "Iowa", code: "IA" },
  { name: "Kansas", code: "KS" },
  { name: "Kentucky", code: "KY" },
  { name: "Louisiana", code: "LA" },
  { name: "Maine", code: "ME" },
  { name: "Maryland", code: "MD" },
  { name: "Massachusetts", code: "MA" },
  { name: "Michigan", code: "MI" },
  { name: "Minnesota", code: "MN" },
  { name: "Mississippi", code: "MS" },
  { name: "Missouri", code: "MO" },
  { name: "Montana", code: "MT" },
  { name: "Nebraska", code: "NE" },
  { name: "Nevada", code: "NV" },
  { name: "New Hampshire", code: "NH" },
  { name: "New Jersey", code: "NJ" },
  { name: "New Mexico", code: "NM" },
  { name: "New York", code: "NY" },
  { name: "North Carolina", code: "NC" },
  { name: "North Dakota", code: "ND" },
  { name: "Ohio", code: "OH" },
  { name: "Oklahoma", code: "OK" },
  { name: "Oregon", code: "OR" },
  { name: "Pennsylvania", code: "PA" },
  { name: "Rhode Island", code: "RI" },
  { name: "South Carolina", code: "SC" },
  { name: "South Dakota", code: "SD" },
  { name: "Tennessee", code: "TN" },
  { name: "Texas", code: "TX" },
  { name: "Utah", code: "UT" },
  { name: "Vermont", code: "VT" },
  { name: "Virginia", code: "VA" },
  { name: "Washington", code: "WA" },
  { name: "West Virginia", code: "WV" },
  { name: "Wisconsin", code: "WI" },
  { name: "Wyoming", code: "WY" },
];

const AddState = ({ show, handleClose, onStateAdded }) => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [businessLicense, setBusinessLicense] = useState('');
  const [bidWebsite, setBidWebsite] = useState('');
  const [creating, setCreating] = useState(false);
  const { addToast } = useToast();

  const handleCreateState = async () => {
    if (!code.trim() || !name.trim()) {
      alert('State Name and Code cannot be empty');
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

  const handleStateSelection = (e) => {
    const selectedName = e.target.value;
    setName(selectedName);

    const selectedState = STATES.find(state => state.name === selectedName);
    if (selectedState) {
      setCode(selectedState.code);
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
        <Form.Group controlId="stateName" className="mb-3">
          <Form.Label>State Name</Form.Label>
          <Form.Select value={name} onChange={handleStateSelection}>
            <option value="">Select a state</option>
            {STATES.map((state) => (
              <option key={state.code} value={state.name}>
                {state.name}
              </option>
            ))}
          </Form.Select>
        </Form.Group>
        <Form.Group controlId="stateCode" className="mb-3 d-none">
          <Form.Label>State Code</Form.Label>
          <Form.Control type="text" value={code} readOnly />
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