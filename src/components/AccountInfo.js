import React, { useEffect, useState } from 'react';
import { JsonRpc } from 'eosjs';
import './AccountInfo.css'; // Ensure this import is correct

const rpc = new JsonRpc(process.env.REACT_APP_RPC);

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const AccountInfo = ({ accountInfo }) => {
  const [balance, setBalance] = useState(null);
  const [cpuLimit, setCpuLimit] = useState({ used: 0, available: 0, max: 1 });
  const [plotStatus, setPlotStatus] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAccountData = async () => {
      if (!accountInfo) return;

      setLoading(true);
      try {
        const balanceResult = await rpc.get_currency_balance('eosio.token', accountInfo.account_name, 'WAX');
        setBalance(balanceResult.length > 0 ? balanceResult[0] : '0 WAX');

        const cpuData = accountInfo.cpu_limit || { used: 0, available: 0, max: 1 };
        setCpuLimit(cpuData);

        const plotResponse = await fetch(`${API_BASE_URL}/plots/${accountInfo.account_name}`);
        const plotData = await plotResponse.json();
        console.log('Fetched plotStatus:', plotData);  // Add this line for debugging
        setPlotStatus(plotData.plots || []);
        
      } catch (error) {
        console.error('Error fetching account data:', error);
        setBalance('Error fetching balance');
        setCpuLimit({ used: 0, available: 0, max: 1 });
      } finally {
        setLoading(false);
      }
    };

    fetchAccountData();
  }, [accountInfo]);

  if (!accountInfo) {
    return <p>No account information available.</p>;
  }

  if (loading) {
    return <p>Loading account information...</p>;
  }

  const cpuUsagePercentage = (cpuLimit.used / cpuLimit.max) * 100;
  const getCpuStatusColor = (percentage) => {
    if (percentage < 50) return 'green';
    if (percentage < 80) return 'yellow';
    return 'red';
  };

  const cpuStatusColor = getCpuStatusColor(cpuUsagePercentage);

  return (
    <div className="AccountInfo">
      <p><strong>Account Name:</strong> {accountInfo.account_name}</p>
      <p><strong>Balance:</strong> {balance}</p>
      {cpuLimit && (
        <div className="CpuStatus">
          <h3>CPU Status</h3>
          <div className="CpuStatusBar">
            <div className={`CpuStatusFill ${cpuStatusColor}`} style={{ width: `${cpuUsagePercentage}%` }}></div>
          </div>
          <div className="CpuRow">
            <p><strong>Used:</strong> {cpuLimit.used} µs</p>
            <p><strong>Available:</strong> {cpuLimit.available} µs</p>
            <p><strong>Max:</strong> {cpuLimit.max} µs</p>
          </div>
        </div>
      )}
      {plotStatus.length > 0 ? (
        <div className="plot-status">
          <h3>Plot Status</h3>
          {plotStatus.map(plot => (
            <div key={plot.plot_id}>
              <p><strong>Plot ID:</strong> {plot.plot_id}</p>
              <p><strong>Seeds Planted:</strong> {plot.has_planted_seeds ? 'Yes' : 'No'}</p>
              <p><strong>Watered:</strong> {plot.has_watered_plants ? 'Yes' : 'No'}</p>
              <p><strong>Harvested:</strong> {plot.has_harvested_crops ? 'Yes' : 'No'}</p>
              <hr />
            </div>
          ))}
        </div>
      ) : (
        <p>No plots available.</p>
      )}
    </div>
  );
};

export default AccountInfo;
