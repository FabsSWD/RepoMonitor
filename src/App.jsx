import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import GitHubRepoMonitor from './components/GitHubRepoMonitor';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/works/:repoName" element={<GitHubRepoMonitor />} />
      </Routes>
    </Router>
  );
}

export default App;