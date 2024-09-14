import React from 'react';

const FarmersList = ({ farmers }) => {
  if (farmers.length === 0) {
    return <p>No farmers registered yet.</p>;
  }

  return (
    <div>
      <h2>Registered Farmers</h2>
      <ul>
        {farmers.map((farmer) => (
          <li key={farmer._id}>
            <strong>{farmer.nickname}</strong> (Account: {farmer.accountName}) - Registered on {new Date(farmer.createdAt).toLocaleDateString()}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FarmersList;
