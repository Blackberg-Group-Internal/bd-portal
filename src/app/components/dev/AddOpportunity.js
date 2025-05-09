'use client';

import React, { useState, useEffect } from 'react';
import { Modal, Form, Button } from 'react-bootstrap';
import axios from 'axios';
import { useToast } from '@/app/context/ToastContext';

const PRIORITY_OPTIONS = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const STAGE_OPTIONS = ['CAPTURE', 'PROPOSAL', 'SUBMITTED', 'WON', 'LOST', 'NO_BID'];
const STATUS_OPTIONS = ['NOT_STARTED', 'WORKING_ON_IT', 'SUPPORT_NEEDED', 'SUBMITTED'];
const BRANCH_OPTIONS = ['LOCAL', 'STATE', 'INTERNATIONAL', 'FEDERAL', 'COMMERCIAL', 'NONPROFIT'];
const DEPARTMENT_OPTIONS = ['COMMUNICATIONS', 'CREATIVE', 'EVENTS', 'WEB', 'PROJECT_MANAGEMENT'];

const AddOpportunity = ({ show, handleClose, onOpportunityAdded, users = [], initialData = {} }) => {
  const [form, setForm] = useState({
    userId: '',
    title: '',
    filename: '',
    threadId: '',
    assistantId: '',
    summary: '',
    deadline: '',
    naics: '',
    matchScore: 0,
    documentLink: '',
    likes: 0,
    dislikes: 0,
    slug: '',
    issuingOrganization: '',
    state: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    requirements: '',
    tags: [],
    lead: [],
    support: [],
    reviewer: [],
    priority: 'LOW',
    questionsDue: '',
    stage: 'CAPTURE',
    status: 'NOT_STARTED',
    note: '',
    sourceLink: '',
    branch: 'FEDERAL',
    notary: false,
    awardDate: '',
    department: [],
  });

  const { addToast } = useToast();

  const handleChange = (e) => {
    const { name, value, type, checked, multiple, options } = e.target;
    if (multiple) {
      const selected = Array.from(options).filter(o => o.selected).map(o => o.value);
      setForm(prev => ({ ...prev, [name]: selected }));
    } else if (type === 'checkbox') {
      setForm(prev => ({ ...prev, [name]: checked }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async () => {
    if (!form.title) {
      //alert('Required fields: userId, title, threadId, assistantId');
      return;
    }

    try {
      
      const payload = {
        ...form,
        matchScore: form.matchScore ? parseInt(form.matchScore, 10) : 0,
        likes: form.likes ? parseInt(form.likes, 10) : 0,
        dislikes: form.dislikes ? parseInt(form.dislikes, 10) : 0,
      };

      const response = await axios.post('/api/opportunity', payload);
      if (response.status === 201) {
        addToast('The Opportunity was added to the Watchlist', 'success');
        if (onOpportunityAdded) onOpportunityAdded(response.data);
        handleClose();
      } else {
        throw new Error('Error creating opportunity');
      }
    } catch (err) {
      console.error(err);
      addToast('Failed to create opportunity.', 'danger');
    }
  };

  useEffect(() => {
    if (show && initialData) {
      setForm(prev => ({
        ...prev,
        title: initialData.title || prev.title,
        issuingOrganization: initialData.issuingOrganization || prev.issuingOrganization,
        state: initialData.state || prev.state,
        rfpNumber: initialData.rfpNumber || prev.rfpNumber,
        deadline: initialData.deadline || prev.deadline,
        deadlineTime: initialData.deadlineTime || prev.deadlineTime,
        contactName: initialData.contactName || prev.contactName,
        contactEmail: initialData.contactEmail || prev.contactEmail,
        contactPhone: initialData.contactPhone || prev.contactPhone,
        typeOfContract: initialData.typeOfContract || prev.typeOfContract,
        naics: initialData.naics || prev.naics,
        branch: initialData.branch || prev.branch,
        questionsDue: initialData.questionsDue || prev.questionsDue,
        awardDate: initialData.awardDate || prev.awardDate,
        notary: typeof initialData.notary === 'boolean' ? initialData.notary : prev.notary,
      }));
    }
  }, [show, initialData]);  

  // useEffect(() => {
  //   if (!show) {
  //     setForm(prev => ({
  //       ...prev,
  //       ...Object.fromEntries(
  //         Object.keys(prev).map(key => [
  //           key,
  //           Array.isArray(prev[key]) ? [] : typeof prev[key] === 'boolean' ? false : '',
  //         ])
  //       ),
  //     }));
  //   }
  // }, [show]);

  return (
    <Modal show={show} onHide={handleClose} className="dialog-fw">
      <Modal.Header closeButton>
        <Modal.Title>Add Opportunity</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <div className="row">
            {/* Column 1 */}
            <div className="col-lg-4">
              <h6 className="mb-3">Basic Details</h6>
              {['userId', 'title', 'threadId', 'assistantId', 'slug', 'sourceLink'].map(field => (
                <Form.Group className="mb-3" key={field}>
                  <Form.Label className="text-capitalize">{field}</Form.Label>
                  <Form.Control type="text" name={field} value={form[field]} onChange={handleChange} />
                </Form.Group>
              ))}

              <Form.Group className="mb-3">
                <Form.Label>Summary</Form.Label>
                <Form.Control as="textarea" rows={3} name="summary" value={form.summary} onChange={handleChange} />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Requirements</Form.Label>
                <Form.Control as="textarea" rows={3} name="requirements" value={form.requirements} onChange={handleChange} />
              </Form.Group>
            </div>

            {/* Column 2 */}
            <div className="col-lg-4">
              <h6 className="mb-3">Dates & Contact Info</h6>
              {[
                { label: 'Deadline', name: 'deadline' },
                { label: 'Questions Due', name: 'questionsDue' },
                { label: 'Award Date', name: 'awardDate' }
              ].map(item => (
                <Form.Group className="mb-3" key={item.name}>
                  <Form.Label>{item.label}</Form.Label>
                  <Form.Control type="date" name={item.name} value={form[item.name]} onChange={handleChange} />
                </Form.Group>
              ))}

              <Form.Group className="mb-3">
                <Form.Label>Issuing Organization</Form.Label>
                <Form.Control type="text" name="issuingOrganization" value={form.issuingOrganization} onChange={handleChange} />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Contact Name</Form.Label>
                <Form.Control type="text" name="contactName" value={form.contactName} onChange={handleChange} />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Contact Email</Form.Label>
                <Form.Control type="text" name="contactEmail" value={form.contactEmail} onChange={handleChange} />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Contact Phone</Form.Label>
                <Form.Control type="text" name="contactPhone" value={form.contactPhone} onChange={handleChange} />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>State</Form.Label>
                <Form.Control type="text" name="state" value={form.state} onChange={handleChange} />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>NAICS</Form.Label>
                <Form.Control type="text" name="naics" value={form.naics} onChange={handleChange} />
              </Form.Group>
            </div>

            {/* Column 3 */}
            <div className="col-lg-4">
              <h6 className="mb-3">Classification & Team</h6>
              <Form.Group className="mb-3">
                <Form.Label>Tags (comma separated)</Form.Label>
                <Form.Control
                  type="text"
                  name="tags"
                  value={form.tags.join(', ')}
                  onChange={(e) => setForm(prev => ({ ...prev, tags: e.target.value.split(',').map(t => t.trim()) }))}
                />
              </Form.Group>

              {[
                { label: 'Priority', name: 'priority', options: PRIORITY_OPTIONS },
                { label: 'Stage', name: 'stage', options: STAGE_OPTIONS },
                { label: 'Status', name: 'status', options: STATUS_OPTIONS },
                { label: 'Branch', name: 'branch', options: BRANCH_OPTIONS },
              ].map(item => (
                <Form.Group className="mb-3" key={item.name}>
                  <Form.Label>{item.label}</Form.Label>
                  <Form.Select name={item.name} value={form[item.name]} onChange={handleChange}>
                    {item.options.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              ))}

              <Form.Group className="mb-3">
                <Form.Label>Department</Form.Label>
                <Form.Select multiple name="department" value={form.department} onChange={handleChange}>
                  {DEPARTMENT_OPTIONS.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </Form.Select>
              </Form.Group>

              {['lead', 'support', 'reviewer'].map(role => (
                <Form.Group className="mb-3" key={role}>
                  <Form.Label className="text-capitalize">{role}</Form.Label>
                  <Form.Select multiple name={role} value={form[role]} onChange={handleChange}>
                    {users.map(user => (
                      <option key={user.id} value={user.id}>{user.name}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              ))}

              <Form.Group className="mb-3">
                <Form.Check
                  type="checkbox"
                  name="notary"
                  label="Requires Notary"
                  checked={form.notary}
                  onChange={handleChange}
                />
              </Form.Group>
            </div>
          </div>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>Cancel</Button>
        <Button variant="primary" onClick={handleSubmit}>Add Opportunity</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AddOpportunity;