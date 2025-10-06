import React from 'react';
import { IdentificationProvider } from './context/IdentificationContext';
import Home from './pages/Home';
import './App.css';

function App() {
  return (
    <IdentificationProvider>
      {/* Container full-width responsive para BulonScan */}
      <div className="min-h-screen w-full bg-gradient-to-br from-steel-50 via-white to-steel-100">
        <Home />
      </div>
    </IdentificationProvider>
  );
}

export default App;
