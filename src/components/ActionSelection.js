import React from 'react';

const ActionSelection = ({ onSelectAction }) => {
  return (
    <div className="action-buttons">
      <button onClick={() => onSelectAction('plantseeds')}>Plant Seeds</button>
      <button onClick={() => onSelectAction('waterplants')}>Water Plants</button>
      <button onClick={() => onSelectAction('harvest')}>Harvest</button>
      <button onClick={() => onSelectAction('sellcrops')}>Sell Crops</button>
      <button onClick={() => onSelectAction('refillcan')}>Refill Water</button>
    </div>
  );
};

export default ActionSelection;
