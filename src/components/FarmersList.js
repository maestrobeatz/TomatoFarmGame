// FarmersList.js
import React from 'react';

const FarmersList = ({ farmers }) => {
  console.log('Rendering FarmersList, farmers:', farmers);

  return (
    <div className="farmers-list">
      <h3>Registered Farmers: {farmers.length}</h3>
      {farmers.length > 0 ? (
        <ul>
          {farmers.map(farmer => (
            <li key={farmer._id}>{farmer.accountName}</li>
          ))}
        </ul>
      ) : (
        <p>No farmers registered yet.</p>
      )}
    </div>
  );
};

export default FarmersList;
