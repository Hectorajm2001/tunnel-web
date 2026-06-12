import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Portfolio from './pages/Portfolio';
import Portal from './pages/Portal';
import ShaderBackground from './components/ShaderBackground';
import './index.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        <ShaderBackground />
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Portfolio />} />
            <Route path="/portal" element={<Portal />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
