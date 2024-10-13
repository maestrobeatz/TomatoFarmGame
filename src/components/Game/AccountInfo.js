import React from 'react';
import '../../styles/AccountInfo.css';

const AccountInfo = ({ accountInfo }) => {
  console.log('Rendering AccountInfo component with:', accountInfo); // Log for debugging

  if (!accountInfo || !accountInfo.accountName) {
    return <p>No account information available.</p>;
  }

  const cpuLimit = accountInfo.cpu_stake || 1; // Default CPU stake if not available
  const cpuUsed = accountInfo.cpu_stake || 0; // Placeholder as actual CPU usage isn't provided
  const cpuUsagePercentage = (cpuUsed / cpuLimit) * 100;

  const getCpuStatusColor = (percentage) => {
    if (percentage < 50) return 'green';
    if (percentage < 80) return 'yellow';
    return 'red';
  };

  const cpuStatusColor = getCpuStatusColor(cpuUsagePercentage);

  return (
    <div className="AccountInfo">
      <p><strong>Account Name:</strong> {accountInfo.accountName}</p>
      <p><strong>Balance:</strong> {accountInfo.balance || 'N/A'}</p>
      <p><strong>CPU Stake:</strong> {accountInfo.cpu_stake || 'N/A'}</p>
      <p><strong>Net Stake:</strong> {accountInfo.net_stake || 'N/A'}</p>
      <p><strong>RAM Usage:</strong> {accountInfo.ram_usage || 'N/A'} / {accountInfo.ram_quota || 'N/A'}</p>
      <div className="CpuStatus">
        <h3>CPU Status</h3>
        <div className="CpuStatusBar">
          <div 
            className={`CpuStatusFill ${cpuStatusColor}`} 
            style={{ width: `${cpuUsagePercentage}%` }}
          ></div>
        </div>
        <div className="CpuRow">
          <p><strong>CPU Usage:</strong> {cpuUsagePercentage.toFixed(2)}%</p>
        </div>
      </div>
    </div>
  );
};

export default AccountInfo;
