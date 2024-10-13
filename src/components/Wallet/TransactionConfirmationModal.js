import React from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

const TransactionConfirmationModal = ({ show, onConfirm, onCancel, transaction }) => {
  return (
    <Modal show={show} onHide={onCancel}>
      <Modal.Header closeButton>
        <Modal.Title>Confirm Transaction</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>Are you sure you want to proceed with this transaction?</p>
        <pre>{JSON.stringify(transaction, null, 2)}</pre> {/* Display transaction details */}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="primary" onClick={() => onConfirm(transaction)}>
          Confirm
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default TransactionConfirmationModal;
