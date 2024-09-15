import React from 'react';
import AccountInfo from './AccountInfo';
import PlotStatus from './PlotStatus';
import Farms from './Farms';
import NFTList from './NFTList';

const AccountInfoSection = ({ session, accountInfo, farms, plots }) => (
  <>
    <div className="section">
      <h2>Account Information</h2>
      <AccountInfo accountInfo={accountInfo || {}} />
    </div>
    <div className="section">
      <h2>Farms</h2>
      <Farms session={session} farms={farms} plots={plots} />
    </div>
    <div className="section">
      <h2>Your Plot Status</h2>
      <PlotStatus session={session} plots={plots} />
    </div>
    <div className="section">
      <h2>Your NFTs</h2>
      <NFTList actor={session.actor.toString()} />
    </div>
  </>
);

export default AccountInfoSection;
