// FarmersList.js
import React from 'react';

const FarmersList = ({ farmers }) => {
  if (farmers.length === 0) {
    return (
      <div className="farmers-list">
        <h3>Registered Farmers</h3>
        <p>No farmers registered yet.</p>
      </div>
    );
  }

  return (
    <div className="farmers-list">
      <h3>Registered Farmers</h3>
      <table>
        <thead>
          <tr>
            <th>Account</th>
            <th>Username</th>
          </tr>
        </thead>
        <tbody>
          {farmers.map((farmer) => (
            <tr key={farmer.account}>
              <td>{farmer.account}</td>
              <td>{farmer.username || 'N/A'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default FarmersList;
