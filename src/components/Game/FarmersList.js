// FarmersList.js
import React, { useEffect, useState } from 'react';
import { getFarmers } from '../api'; // Import the getFarmers API call

const FarmersList = () => {
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch the farmers when the component mounts
  useEffect(() => {
    const fetchFarmers = async () => {
      try {
        const data = await getFarmers();
        if (data && data.farmers) {
          setFarmers(data.farmers); // Set farmers in state
        }
        setLoading(false); // Turn off the loading indicator
      } catch (error) {
        setError('Failed to fetch farmers');
        setLoading(false);
      }
    };

    fetchFarmers();
  }, []);

  if (loading) {
    return <p>Loading...</p>; // Show loading message while data is being fetched
  }

  if (error) {
    return <p>{error}</p>; // Show error message if there's an error
  }

  return (
    <div className="farmers-list">
      <h3>Registered Farmers</h3>
      {farmers.length === 0 ? (
        <p>No farmers registered yet.</p>
      ) : (
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
                <td>{farmer.account}</td> {/* Ensure no extra space */}
                <td>{farmer.username || 'N/A'}</td> {/* Ensure no extra space */}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default FarmersList;
