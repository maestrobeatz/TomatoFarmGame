import React from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

const SignatureRequestModal = ({ show, onApprove, onReject, transactionDetails }) => {
  return (
    <Modal show={show} onHide={onReject} backdrop="static" centered>
      <Modal.Header>
        <Modal.Title>Review Transaction</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="transaction-details">
          <p><strong>From:</strong> {transactionDetails.from}</p>
          <p><strong>To:</strong> {transactionDetails.to}</p>
          <p><strong>Amount:</strong> {transactionDetails.amount} WAX</p>
          <p><strong>Memo:</strong> {transactionDetails.memo || 'No memo'}</p>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="danger" onClick={onReject}>
          Reject
        </Button>
        <Button variant="success" onClick={onApprove}>
          Approve
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default SignatureRequestModal;
