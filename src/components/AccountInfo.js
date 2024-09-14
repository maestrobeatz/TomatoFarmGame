import React from 'react';
import './AccountInfo.css';

const AccountInfo = ({ accountInfo }) => {
  console.log('Rendering AccountInfo component with:', accountInfo); // Log for debugging

  if (!accountInfo.accountName) {
    return <p>No account information available.</p>;
  }

  const cpuLimit = accountInfo.cpu_limit?.max || 1; // Prevent division by 0
  const cpuUsed = accountInfo.cpu_limit?.used || 0;
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
      <p><strong>Balance:</strong> {accountInfo.balance}</p>
      <p><strong>CPU Stake:</strong> {accountInfo.cpu_stake}</p>
      <p><strong>Net Stake:</strong> {accountInfo.net_stake}</p>
      <p><strong>RAM Usage:</strong> {accountInfo.ram_usage} / {accountInfo.ram_quota}</p>

      <div className="CpuStatus">
        <h3>CPU Status</h3>
        <div className="CpuStatusBar">
          <div className={`CpuStatusFill ${cpuStatusColor}`} style={{ width: `${cpuUsagePercentage}%` }}></div>
        </div>
        <div className="CpuRow">
          <p><strong>CPU Usage:</strong> {cpuUsagePercentage.toFixed(2)}%</p>
        </div>
      </div>
    </div>
  );
};

export default AccountInfo;
