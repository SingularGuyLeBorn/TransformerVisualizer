// FILE: src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { TopicPage } from './pages/TopicPage';
import './App.css'; // Global styles remain

function App() {
  return (
    <Router>
      <div className="app-container">
        <header className="app-header">
            <h1><Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>AI 深度探索专题</Link></h1>
        </header>
        <main className="app-main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/topic/:topicId" element={<TopicPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

// Add new global styles for the new layout
const globalStyles = `
  .app-header {
    flex-shrink: 0;
    border-bottom: 1px solid var(--border-color);
    background-color: var(--component-bg);
    z-index: 1001; /* Ensure header is on top */
  }
  .app-header h1 {
    padding: 15px 0;
    font-size: 1.8em;
  }
  .app-main-content {
    flex-grow: 1;
    overflow-y: auto; /* Allow main content to scroll */
    height: calc(100vh - 78px); /* Full height minus header */
  }
`;

const styleSheet = document.createElement("style");
styleSheet.innerText = globalStyles;
document.head.appendChild(styleSheet);


export default App;
