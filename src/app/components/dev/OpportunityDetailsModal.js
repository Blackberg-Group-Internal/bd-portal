'use client';

import React, { useContext, useEffect, useRef, useState } from 'react';
import { Modal, Button, Row, Col, ListGroup, Badge } from 'react-bootstrap';
import ReactMarkdown from 'react-markdown';
import CalendarIcon from '../../../../public/images/icons/calendar.svg';
import FeedbackButtonsRfp from '@/app/components/dev/FeedbackButtonsRfp';
import PerformanceIcon from '../../../../public/images/icons/performance.svg';
import BuildingIcon from '../../../../public/images/icons/building.svg';
import PassportIcon from '../../../../public/images/icons/passport.svg';
import TilesIcon from '../../../../public/images/icons/tiles.svg';
import OrgIcon from '../../../../public/images/icons/org.svg';
import NaicsIcon from '../../../../public/images/icons/naics.svg';
import QuestionIcon from '../../../../public/images/icons/annotation-question.svg';
import AwardIcon from '../../../../public/images/icons/award-01.svg';
import NotaryIcon from '../../../../public/images/icons/notary.svg';
import BudgetIcon from '../../../../public/images/icons/budget.svg';
import SubmissionIcon from '../../../../public/images/icons/submit.svg';
import DepartmentIcon from '../../../../public/images/icons/department.svg';
import RegistrationIcon from '../../../../public/images/icons/registration.svg';
import CommunicationIcon from '../../../../public/images/icons/communication.svg';
import BranchIcon from '../../../../public/images/icons/opportunities.svg';
import StatusIcon from '../../../../public/images/icons/performance.svg';
import ListIcon from '../../../../public/images/icons/list.svg';
import FilesIcon from '../../../../public/images/icons/files.svg';
import CountdownIcon from '../../../../public/images/icons/hourglass.svg';
import ChatBot from '@/app/components/dev/ChatRfp';
import { format } from 'date-fns'; 
import { FileViewerContext } from '@/app/layout';
import { useToast } from '@/app/context/ToastContext';
import BuildTeam from './BuildTeam';
import ProposalOutlineList from './ProposalOutlineList';
import OpportunityMessages from './OpportunityMessages';

const OpportunityDetailsModal = ({ show, handleClose, opportunity = [] }) => {
  const [countdown, setCountdown] = useState(null);
  const [isInWatchlist, setIsInWatchlist] = useState(opportunity.reviewStatus === "IN_REVIEW");
  const [isInPipeline, setIsInPipeline] = useState(opportunity.approved);
  const { addToast } = useToast();
  const [employeeId, setEmployeeId] = useState(null);

  useEffect(() => {
    const id = localStorage.getItem('employeeId');
    if (id) setEmployeeId(parseInt(id));
  }, []);

  if (!opportunity) return null;
    const { openModal } = useContext(FileViewerContext);


    const formatModifiedDate = (dateString) => {
      const date = new Date(dateString);
      const currentYear = new Date().getFullYear();
      return date.getFullYear() === currentYear ? format(date, 'MMM d, yyyy') : 'N/A';
    };
  

  const toggleWatchlist = async () => {
    const newStatus = isInWatchlist ? 'PENDING' : 'IN_REVIEW';

    await updateOpportunityReviewStatus(opportunity.id, newStatus);

    setIsInWatchlist(!isInWatchlist);
  };

  const togglePipeline = async () => {
    try {
      const newApprovedStatus = !isInPipeline;
      const updatedOpportunity = await updateOpportunityApprovedStatus(opportunity.id, newApprovedStatus);
      setIsInPipeline(updatedOpportunity.approved);
  
      if (newApprovedStatus) {
        addToast('Opportunity added to Pipeline.', 'success');
      } else {
        addToast('Opportunity removed from Pipeline.', 'success');
      }
  
    } catch (error) {
      console.error('Error updating pipeline status:', error);
      addToast('Failed to update Pipeline.', 'danger');
    }
  };
  

//   const getUserName = (userId) => {
//     const user = users.find(u => u.id === userId);
//     return user ? user.name : userId;
//   };

const formatText = (status) => {
  return status
    .toLowerCase()
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

  const showModal = (file) => {
    openModal(file);
  };

  const updateOpportunityReviewStatus = async (opportunityId, status) => {
    try {
      const response = await fetch('/api/opportunity/update-review-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          opportunityId,
          reviewStatus: status,
        }),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        addToast('Opportunity was not added to Watchlist.', 'danger');
        throw new Error(data.error || 'Failed to update review status');
      }
      addToast('Opportunity added to Watchlist.', 'success');
      console.log('✅ Review status updated:', data.opportunity);
      return data.opportunity;
    } catch (error) {
      console.error('Error updating review status:', error);
      throw error;
    }
  };

  const updateOpportunityApprovedStatus = async (opportunityId, approved) => {
    try {
      const response = await fetch('/api/opportunity/add-to-pipeline', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          opportunityId,
          approved: approved,
        }),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
       // addToast(`Opportunity was not ${approved ? 'added to' : 'removed from'} Pipeline.`, 'danger');
        throw new Error(data.error || 'Failed to update approved status');
      }
  
     // addToast(`Opportunity ${approved ? 'added to' : 'removed from'} Pipeline.`, 'success');
      console.log('✅ Approved status updated:', data.opportunity);
      return data.opportunity;
    } catch (error) {
      console.error('Error updating approved status:', error);
      throw error;
    }
  };
  
  

  const formatList = (list) => list && list.length > 0 ? list.join(', ') : 'N/A';

  return (
    <Modal show={show} onHide={handleClose} className="dialog-fw">
      <Modal.Header closeButton className="">
        <Modal.Title className="d-flex align-items-center w-100">{opportunity.title}               <div className="d-flex gap-3 ms-4">
                <button 
                  onClick={toggleWatchlist} 
                  className="btn btn--white border-0 text-dark mb-0 py-0 px-0 w-100 pointer text-nowrap tile-animate d-flex justify-content-center"
                >
                  {isInWatchlist ? '- Watchlist' : '+ Watchlist'}
                </button>
                <button 
                  onClick={togglePipeline} 
                  className="btn btn--white border-0 text-dark mb-0 py-0 px-0 w-100 pointer text-nowrap tile-animate d-flex justify-content-center"
                >
                  {isInPipeline ? '- Pipeline' : '+ Pipeline'}
                </button>
                </div>
                <div className="d-flex gap-2 ms-auto me-4 align-items-center">
                {opportunity.department.map((dep) => (
                  <div className="" key={dep}>
                    <span class="badge rounded-pill bg-light text-dark">{formatText(dep)}</span>
                  </div>
                ))}
                </div>
                </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row>
          {/* Column 1 */}
          <Col lg={6}>
            <ListGroup variant="flush" className="p-3 bg-light">
              <ListGroup.Item className="pt-0 ps-0 p-0 bg-light rounded" style={{height:'60vh', overflow: 'scroll'}}><ReactMarkdown>{opportunity.summary || 'N/A'}</ReactMarkdown></ListGroup.Item>
            </ListGroup>
            <h5 className="my-3">Jumpstart</h5>
            <ListGroup variant="flush">
            <div class="accordion accordion-flush" id="accordionFlushExample">
              <div class="accordion-item">
                <h2 class="accordion-header" id="flush-headingOne">
                  <button class="accordion-button collapsed bg-light" type="button" data-bs-toggle="collapse" data-bs-target="#flush-collapseOne" aria-expanded="false" aria-controls="flush-collapseOne">
                    Proposal Outline
                  </button>
                </h2>
                <div id="flush-collapseOne" class="accordion-collapse collapse" aria-labelledby="flush-headingOne" data-bs-parent="#accordionFlushExample">
                  <div class="accordion-body">
                    {opportunity.proposalOutline && (
                    <ProposalOutlineList outlineJson={opportunity.proposalOutline} />
                    )}
                  </div>
                </div>
              </div>
            </div>

            </ListGroup>
          </Col>

          {/* Column 2 */}
          <Col lg={6}>
            <ListGroup variant="flush" className="d-flex flex-column flex-md-row flex-wrap gap-3">
    <div className="col">
          <h5 className="mb-3">Key Dates</h5>

            <div className="card  card-tool card-tool--no-hover rounded shadow-none bg-white py-2 pointer w-100 mb-2 tile-animate">
                    <div className="card-body text-left d-flex flex-column flex-sm-row py-0 px-2">
                      <div className="tool-icon rounded-3 me-1 align-self-start p-2">
                        <CalendarIcon />
                      </div>
                      <div className="d-flex flex-column">
                      <span className="card-title small m-0 ps-1">Deadline</span>
                      <span className="card-text fw-bold m-0 lh-1 ps-1">{formatModifiedDate(opportunity.deadline)} <span className="fst-italic">{opportunity.deadlineTime}</span></span>
                      </div>
                    </div>
                  </div>
                  <div className="card  card-tool card-tool--no-hover rounded shadow-none bg-white py-2 pointer w-100 mb-2 tile-animate">
                    <div className="card-body text-left d-flex flex-column flex-sm-row py-0 px-2">
                      <div className="tool-icon rounded-3 me-1 align-self-start p-2">
                        <QuestionIcon />
                      </div>
                      <div className="d-flex flex-column">
                      <span className="card-title small m-0 ps-1">Questions Due</span>
                      <span className="card-text fw-bold m-0 lh-1 ps-1">{formatModifiedDate(opportunity.questionsDue)} <span className="fst-italic">{opportunity.deadlineTime}</span></span>
                      </div>
                    </div>
                  </div>
                  <div className="card  card-tool card-tool--no-hover rounded shadow-none bg-white py-2 pointer w-100 mb-2 tile-animate">
                    <div className="card-body text-left d-flex flex-column flex-sm-row py-0 px-2">
                      <div className="tool-icon rounded-3 me-1 align-self-start p-2">
                        <AwardIcon />
                      </div>
                      <div className="d-flex flex-column">
                      <span className="card-title small m-0 ps-1">Award Date</span>
                      <span className="card-text fw-bold m-0 lh-1 ps-1">{formatModifiedDate(opportunity.awardDate)} <span className="fst-italic">{opportunity.deadlineTime}</span></span>
                      </div>
                    </div>
                  </div>
</div>
              {/* <ListGroup.Item><strong>Match Score:</strong> {opportunity.matchScore || 'N/A'}</ListGroup.Item> */}
            <div className="col">
                      <h5 className="mb-3">Research & Review</h5>

                      <BuildTeam
                        opportunityId={opportunity.id}
                        lead={opportunity.lead || []}
                        support={opportunity.support || []}
                        reviewer={opportunity.reviewer || []}
                      />
                <ChatBot threadId={opportunity.threadId} assistantId={opportunity.assistantId} />
                
                <button onClick={() => showModal(opportunity.documentLink)} className="btn btn--white text-dark mb-2 w-100 pointer tile-animate d-flex justify-content-between py-2 align-items-center">
                View Source
                <div className="tool-icon rounded-3 me-1 align-self-start p-2">
                <FilesIcon className="ms-2" />
                      </div>
            
                  </button>
                        
                               
                  </div>
            <div className="col-12">
              <h5 className="mb-3 mt-0">Basic Information</h5>

        <div className="d-flex flex-column flex-md-row gap-3">
          <div className="col card  card-tool card-tool--no-hover rounded shadow-none bg-white py-2 pointer mb-2 tile-animate">
        <div className="card-body text-left d-flex flex-column flex-sm-row py-0 px-2">
          <div className="tool-icon rounded-3 me-1 align-self-start p-2">
            <BuildingIcon />
          </div>
    
          <div className="d-flex flex-column">
          <span className="card-title small m-0 ps-1">Issuing Organization</span>
          <span className="card-text fw-bold m-0 lh-1 ps-1">{opportunity.issuingOrganization || 'N/A'}</span>
          {opportunity.state && (<span className="card-text small m-0 lh-1 ps-1 mt-1">{opportunity.state || 'N/A'}</span>)}
          </div>
        </div>
        </div>
         <div className="col card  card-tool card-tool--no-hover rounded shadow-none bg-white py-2 pointer mb-2 tile-animate">
                          <div className="card-body text-left d-flex flex-column flex-sm-row px-2 py-0">
                            <div className="tool-icon rounded-3 me-1 align-self-start p-2">
                              <CommunicationIcon />
                            </div>
                            <div className="d-flex flex-column text-truncate">
                            <span className="card-title small m-0 ps-1">Contact</span>
                                <span className="card-text fw-bold m-0 lh-1 d-block text-truncate ps-1">{opportunity.contactName || 'N/A'}</span>
                                {opportunity.contactEmail && (<span className="d-block card-text small text-truncate ps-1">{opportunity.contactEmail || 'N/A'}</span>)}
                            </div>
                          </div>
                        </div>
                        </div>
<div class="d-flex gap-2">
        
          <div className="card  card-tool card-tool--no-hover rounded shadow-none bg-white py-2 pointer mb-2 w-50 tile-animate">
            <div className="card-body text-left d-flex flex-column flex-sm-row py-0 px-2">
              <div className="tool-icon rounded-3 me-1 align-self-start p-2">
                <NaicsIcon />
              </div>
              <div className="d-flex flex-column">
              <span className="card-title small m-0 ps-1">NAICS</span>
              <span className="card-text fw-bold m-0 lh-1 ps-1">{opportunity.naics || 'N/A'}</span>
              </div>
            </div>
          </div>

          <div className="card  card-tool card-tool--no-hover rounded shadow-none bg-white py-2 pointer mb-2 w-50 tile-animate">
          <div className="card-body text-left d-flex flex-column flex-sm-row py-0 px-2">
            <div className="tool-icon rounded-3 me-1 align-self-start p-2">
              <DepartmentIcon />
            </div>
            <div className="d-flex flex-column">
            <span className="card-title small m-0 ps-1">Department</span>
            <span className="card-text fw-bold m-0 lh-1 ps-1">TBD</span>
            </div>
          </div>
        </div>
    

        <div className="card  card-tool card-tool--no-hover rounded shadow-none bg-white py-2 pointer mb-2 w-50 tile-animate">
              <div className="card-body text-left d-flex flex-column flex-sm-row py-0 px-2">
                <div className="tool-icon rounded-3 me-1 align-self-start p-2">
                  <NotaryIcon />
                </div>
                <div className="d-flex flex-column">
                <span className="card-title small m-0 ps-1">Notary</span>
                <span className="card-text fw-bold m-0 lh-1 ps-1">{opportunity.notary ? 'Yes' : 'No'}</span>
                </div>
              </div>
            </div>

            <div className="card  card-tool card-tool--no-hover rounded shadow-none bg-white py-2 pointer mb-2 w-50 tile-animate">
          <div className="card-body text-left d-flex flex-column flex-sm-row py-0 px-2">
            <div className="tool-icon rounded-3 me-1 align-self-start p-2">
              <RegistrationIcon />
            </div>
            <div className="d-flex flex-column">
            <span className="card-title small m-0 ps-1">Registration</span>
            <span className="card-text fw-bold m-0 lh-1 ps-1">No</span>
            </div>
          </div>
        </div>
          </div>

          <div class="d-flex gap-2">
        
  

    
        </div>
        <div class="d-flex gap-2">
        
        <div className="card  card-tool card-tool--no-hover rounded shadow-none bg-white py-2 pointer mb-2 w-50 tile-animate">
          <div className="card-body text-left d-flex flex-column flex-sm-row py-0 px-2">
            <div className="tool-icon rounded-3 me-1 align-self-start p-2">
              <SubmissionIcon />
            </div>
            <div className="d-flex flex-column">
            <span className="card-title small m-0 ps-1">Submission</span>
            <span className="card-text fw-bold m-0 lh-1 ps-1">Online</span>
            </div>
          </div>
        </div>

        <div className="card  card-tool card-tool--no-hover rounded shadow-none bg-white py-2 pointer mb-2 w-50 tile-animate">
              <div className="card-body text-left d-flex flex-column flex-sm-row py-0 px-2">
                <div className="tool-icon rounded-3 me-1 align-self-start p-2">
                  <BudgetIcon />
                </div>
                <div className="d-flex flex-column">
                <span className="card-title small m-0 ps-1">Budget</span>
                <span className="card-text fw-bold m-0 lh-1 ps-1">{opportunity.contractValue || 'TBD'}</span>
                </div>
              </div>
            </div>

            <div className="card  card-tool card-tool--no-hover rounded shadow-none bg-white py-2 pointer mb-2 w-50 tile-animate">
              <div className="card-body text-left d-flex flex-column flex-sm-row py-0 px-2">
                <div className="tool-icon rounded-3 me-1 align-self-start p-2">
                  <BranchIcon />
                </div>
                <div className="d-flex flex-column">
                <span className="card-title small m-0 ps-1">Branch</span>
                <span className="card-text fw-bold m-0 lh-1 ps-1">{formatText(opportunity.branch || 'TBD')}</span>
                </div>
              </div>
            </div>

            <div className="card  card-tool card-tool--no-hover rounded shadow-none bg-white py-2 pointer mb-2 w-50 tile-animate">
              <div className="card-body text-left d-flex flex-column flex-sm-row py-0 px-2">
                <div className="tool-icon rounded-3 me-1 align-self-start p-2">
                  <StatusIcon />
                </div>
                <div className="d-flex flex-column">
                <span className="card-title small m-0 ps-1">Status</span>
                <span className="card-text fw-bold m-0 lh-1 ps-1">{formatText(opportunity.reviewStatus || 'TBD')}</span>
                </div>
              </div>
            </div>

            
 
    </div>
    {employeeId && (
    <OpportunityMessages opportunityId={opportunity.id} />
    )}

</div>
            </ListGroup>
          </Col>

          {/* Column 3 */}
          <Col lg={3}>
 

                     


          </Col>
          <Col lg={6}>

          </Col>
          <Col lg={6} className="d-none">
          <h5 className="my-3">Jumpstart</h5>
            <ListGroup variant="flush">
            <div class="accordion accordion-flush" id="accordionFlushExample">
              <div class="accordion-item">
                <h2 class="accordion-header" id="flush-headingOne">
                  <button class="accordion-button collapsed bg-light" type="button" data-bs-toggle="collapse" data-bs-target="#flush-collapseOne" aria-expanded="false" aria-controls="flush-collapseOne">
                    Proposal Outline
                  </button>
                </h2>
                <div id="flush-collapseOne" class="accordion-collapse collapse" aria-labelledby="flush-headingOne" data-bs-parent="#accordionFlushExample">
                  <div class="accordion-body">
                    <ReactMarkdown>{opportunity.proposalOutline || 'N/A'}</ReactMarkdown>
                  </div>
                </div>
              </div>
            </div>
              {/* <ListGroup.Item><strong>Priority:</strong> {opportunity.priority}</ListGroup.Item>
              <ListGroup.Item><strong>Stage:</strong> {opportunity.stage}</ListGroup.Item>
              <ListGroup.Item><strong>Status:</strong> {opportunity.status}</ListGroup.Item>
              <ListGroup.Item><strong>Branch:</strong> {opportunity.branch}</ListGroup.Item>
              <ListGroup.Item><strong>Department:</strong> {formatList(opportunity.department)}</ListGroup.Item>
              <ListGroup.Item><strong>Tags:</strong> {formatList(opportunity.tags)}</ListGroup.Item> */}
              {/* <ListGroup.Item><strong>Lead:</strong> {opportunity.lead.map(getUserName).join(', ') || 'N/A'}</ListGroup.Item>
              <ListGroup.Item><strong>Support:</strong> {opportunity.support.map(getUserName).join(', ') || 'N/A'}</ListGroup.Item>
              <ListGroup.Item><strong>Reviewer:</strong> {opportunity.reviewer.map(getUserName).join(', ') || 'N/A'}</ListGroup.Item> */}
   
            </ListGroup>
          </Col>
        </Row>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="" onClick={handleClose} className="btn btn-white border">Close</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default OpportunityDetailsModal;
