import React from 'react';
import '../../styles/AccountInfo.css';

const AccountInfo = ({ accountInfo }) => {
  console.log('Rendering AccountInfo component with:', accountInfo); // Debugging log

  if (!accountInfo || !accountInfo.accountName) {
    return <p>No account information available.</p>;
  }

  // CPU Usage Calculation
  const cpuLimit = accountInfo.cpu?.max || 1; // Total CPU available
  const cpuUsed = accountInfo.cpu?.used || 0; // Actual CPU used
  const cpuUsagePercentage = (cpuUsed / cpuLimit) * 100;

  // RAM Usage Calculation
  const ramUsage = accountInfo.ram?.usage || 0;
  const ramQuota = accountInfo.ram?.quota || 1; // Total RAM available
  const ramUsagePercentage = (ramUsage / ramQuota) * 100;

  // NET Usage Calculation
  const netLimit = accountInfo.net?.max || 1; // Total NET available
  const netUsed = accountInfo.net?.used || 0; // Actual NET used
  const netUsagePercentage = (netUsed / netLimit) * 100;

  // Function to determine the color class based on percentage
  const getStatusColor = (percentage) => {
    if (percentage < 50) return 'green';
    if (percentage < 60) return 'yellow';
    if (percentage < 80) return 'orange';
    return 'red';
  };

  // Removed the function to change text color based on background
  // Now all text will remain black within the bars

  return (
    <div className="AccountInfo">
      {/* Account Name and Balance on the same row */}
      <div className="AccountHeader">
        <p><strong>Account Name:</strong> {accountInfo.accountName}</p>
        <p><strong>Balance:</strong> {accountInfo.balance || 'N/A'}</p>
      </div>

      {/* CPU Status */}
      <div className="CpuStatus">
        <div className="BarLabel"><strong>CPU Usage</strong></div>
        <div className="CpuStatusBar">
          <div
            className={`CpuStatusFill ${getStatusColor(cpuUsagePercentage)}`}
            style={{ width: `${cpuUsagePercentage}%` }}
          >
            <span className="BarValue">
              {cpuUsagePercentage.toFixed(2)}%
            </span>
          </div>
        </div>
      </div>

      {/* NET Status */}
      <div className="NetStatus">
        <div className="BarLabel"><strong>NET Usage</strong></div>
        <div className="NetStatusBar">
          <div
            className={`NetStatusFill ${getStatusColor(netUsagePercentage)}`}
            style={{ width: `${netUsagePercentage}%` }}
          >
            <span className="BarValue">
              {netUsagePercentage.toFixed(2)}%
            </span>
          </div>
        </div>
      </div>

      {/* RAM Status */}
      <div className="RamStatus">
        <div className="BarLabel"><strong>RAM Usage</strong></div>
        <div className="RamStatusBar">
          <div
            className={`RamStatusFill ${getStatusColor(ramUsagePercentage)}`}
            style={{ width: `${ramUsagePercentage}%` }}
          >
            <span className="BarValue">
              {ramUsagePercentage.toFixed(2)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountInfo;
