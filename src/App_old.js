import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ErrorBoundary from './components/Shared/ErrorBoundary';
import GameApp from './components/Game/GameApp';
import WalletApp from './components/Game/WalletApp';
import useSession from './hooks/useSession';
import './styles/global.css';

function App() {
  const { session, handleLogin, handleLogout, error } = useSession();

  return (
    <ErrorBoundary>
      <Router basename="/TomatoFarmGame">
        <div className="App">
          {error && <div className="error-message">{error}</div>}
          {!session ? (
            <div>
              <h1>Welcome to Tomato Farm Game</h1>
              <button onClick={handleLogin}>Login</button>
            </div>
          ) : (
            <>
              <button onClick={handleLogout}>Logout</button>
              <Routes>
                <Route 
                  path="/wallet" 
                  element={<WalletApp session={session} />} 
                />
                <Route 
                  path="/" 
                  element={<GameApp session={session} />} 
                />
              </Routes>
            </>
          )}
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
