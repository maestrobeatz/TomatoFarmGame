// src/utils/modalUtils.js

import ReactDOM from 'react-dom';
import React from 'react';

// Utility function to show a modal
export const showModal = (Component, props = {}) => {
  // Create a container div for the modal
  const modalContainer = document.createElement('div');
  document.body.appendChild(modalContainer);

  // Render the modal component into the container
  const handleClose = () => {
    // Cleanup the modal when closed
    ReactDOM.unmountComponentAtNode(modalContainer);
    document.body.removeChild(modalContainer);
  };

  // Render the modal component
  ReactDOM.render(
    <Component {...props} onClose={handleClose} />,
    modalContainer
  );
};
