import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import GitHubRepoMonitor from './components/GitHubRepoMonitor';

function App() {
  return (
    <Router basename="/projects">
      <Routes>
        <Route path="/" element={<Navigate to="/react" replace />} />
        <Route path="/:repoName" element={<GitHubRepoMonitor />} />
      </Routes>
    </Router>
  );
}

export default App;