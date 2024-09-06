import React, { useEffect, useState } from 'react';
import { JsonRpc } from 'eosjs';
import './AccountInfo.css';

const rpc = new JsonRpc(process.env.REACT_APP_RPC);

const AccountInfo = ({ accountInfo }) => {
  const [balance, setBalance] = useState(null);
  const [cpuLimit, setCpuLimit] = useState({ used: 0, available: 0, max: 1 });
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
    </div>
  );
};

export default AccountInfo;
