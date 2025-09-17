import React from 'react';
import { IdentificationProvider } from './context/IdentificationContext';
import Home from './pages/Home';
import './App.css';

function App() {
  return (
    <IdentificationProvider>
      <div className="App">
        <Home />
      </div>
    </IdentificationProvider>
  );
}

export default App;
