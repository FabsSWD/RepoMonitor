import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Index from './pages/index.jsx';

function App() {
  return (
    <Router basename="/projects">
      <Routes>
        <Route path="/" element={<Navigate to="/react" replace />} />
        <Route path="/:repoName" element={<Index />} />
      </Routes>
    </Router>
  );
}

export default App;