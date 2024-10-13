import React, { useState, useEffect, useRef } from 'react';
import '../styles/Onboarding.css';

const Onboarding = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const containerRef = useRef(null);

  const nextStep = () => setStep(prevStep => prevStep + 1);
  const prevStep = () => setStep(prevStep => prevStep - 1);

  useEffect(() => {
    const adjustHeight = () => {
      const container = containerRef.current;
      if (container) {
        container.style.height = 'auto';
        container.style.height = `${container.scrollHeight}px`;
      }
    };

    adjustHeight();
    window.addEventListener('resize', adjustHeight);

    return () => window.removeEventListener('resize', adjustHeight);
  }, [step]);

  return (
    <div className="onboarding-container" ref={containerRef}>
      {step === 1 && (
        <div>
          <h2>Welcome to Tomato Farm Game!</h2>
          <p>
            Dive into the harmonious world of MaestrOBeatZ, where music meets farming in a unique blend of creativity and technology. This collection features a series of NFTs that represent various stages of growth in our vibrant and musical tomato farm. Each NFT captures the essence of musical cultivation, from the first seeds to the ripest tomatoes.
          </p>
          <p>
            In MaestrOBeatZ, players collect, blend, and stake NFTs to build and enhance their virtual tomato farms. Using TOMATOE and BEATZ tokens, players purchase packs containing essential NFTs. These NFTs can be blended to create more powerful versions, increasing the farm's productivity and rewards. Players stake their NFTs in weekly mini pools to earn TOMATOE tokens, creating a dynamic and engaging in-game economy.
          </p>
          <p>
            Join the MaestrOBeatZ community and immerse yourself in the musical farming experience. Each NFT not only enhances your virtual farm but also adds a layer of musical joy to your collection. Happy farming!
          </p>
          <button onClick={nextStep}>Get Started</button>
        </div>
      )}
      {step === 2 && (
        <div>
          <h2>Step 1: Create a WAX Testnet Account</h2>
          <p>To create a WAX testnet account, follow these instructions:</p>
          <ol>
            <li>Visit the <a href="https://waxsweden.org/create-testnet-account" target="_blank" rel="noopener noreferrer">WAX Testnet Account Creation</a> page.</li>
            <li>Fill in the required details and submit the form.</li>
            <li>You will receive your account name and private keys.</li>
            <li>Make sure to get some WAX tokens for transactions.</li>
          </ol>
          <div className="button-group">
            <button onClick={prevStep}>Back</button>
            <button onClick={nextStep}>Next</button>
          </div>
        </div>
      )}
      {step === 3 && (
        <div>
          <h2>Step 2: Install Anchor Wallet</h2>
          <p>Now, let's install the Anchor wallet on your device:</p>
          <ol>
            <li>Go to the <a href="https://greymass.com/anchor/" target="_blank" rel="noopener noreferrer">Anchor Wallet Download</a> page.</li>
            <li>Download and install the appropriate version for your device (Windows, macOS, Linux, or mobile).</li>
            <li>Follow the installation instructions provided on the website.</li>
          </ol>
          <div className="button-group">
            <button onClick={prevStep}>Back</button>
            <button onClick={nextStep}>Next</button>
          </div>
        </div>
      )}
      {step === 4 && (
        <div>
          <h2>Step 3: Import Your WAX Account</h2>
          <p>There are two ways to import your WAX account into Anchor:</p>
          <h3>Option 1: Automatic Import</h3>
          <ol>
            <li>In Anchor, click on "Import Account".</li>
            <li>Select "Scan QR Code".</li>
            <li>Scan the QR code provided during your WAX testnet account creation.</li>
            <li>Your account will be automatically imported into Anchor.</li>
          </ol>
          <h3>Option 2: Manual Import</h3>
          <ol>
            <li>In Anchor, click on "Import Account".</li>
            <li>Select "Manual" to input your account name and private keys.</li>
            <li>Enter your WAX account name exactly as provided during creation.</li>
            <li>Copy and paste your private key into the provided field.</li>
            <li>Click "Import" to add your account to Anchor.</li>
            <li>Your WAX testnet account is now available in Anchor, ready for transactions!</li>
          </ol>
          <div className="button-group">
            <button onClick={prevStep}>Back</button>
            <button onClick={nextStep}>Next</button>
          </div>
        </div>
      )}
      {step === 5 && (
        <div>
          <h2>You're Ready to Go!</h2>
          <p>You can now log in with your Anchor wallet to start playing Tomato Farm Game.</p>
          <button onClick={() => window.open('https://test.neftyblocks.com/collection/maestrobeatz/drops/2546', '_blank')}>Need a Mini Farm Test Pack?</button>
        </div>
      )}
    </div>
  );
};

export default Onboarding;
