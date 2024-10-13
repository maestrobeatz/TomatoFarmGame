// FarmersList.js
import React from 'react';
import '../../styles/FarmersList.css';

const FarmersList = ({ farmers }) => {
  return (
    <div className="farmers-list">
      <h3>Registered Farmers</h3>
      {farmers.length === 0 ? (
        <p>No farmers registered yet.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Username</th>
              <th>Account Name</th>
            </tr>
          </thead>
          <tbody>
            {farmers.map((farmer) => (
              <tr key={farmer.accountName}>
                <td>{farmer.nickname || 'N/A'}</td>
                <td>{farmer.accountName}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default FarmersList;
