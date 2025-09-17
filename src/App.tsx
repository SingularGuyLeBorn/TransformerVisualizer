// FILE: src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { HomePage } from './pages/HomePage/HomePage';
import { TopicPage } from './pages/TopicPage/TopicPage';
import { DirectoryPage } from './pages/DirectoryPage/DirectoryPage'; // [新增] 导入目录页面
import './App.css';

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
            {/* [新增] 添加新页面的路由 */}
            <Route path="/directory" element={<DirectoryPage />} />
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
    overflow: hidden; /* It should NOT scroll itself */
    min-height: 0; /* Crucial for nested flex scrolling */
    position: relative; /* Needed for absolute positioned children like controls */
  }
  /* This is now a generic container for standard pages that need scrolling */
  .page-scroll-container {
      height: 100%;
      overflow-y: auto;
  }
`;

// Use a more robust way to ensure the stylesheet is added only once.
if (!document.getElementById('app-global-styles')) {
    const styleSheet = document.createElement("style");
    styleSheet.id = 'app-global-styles';
    styleSheet.innerText = globalStyles;
    document.head.appendChild(styleSheet);
}


export default App;
// END OF FILE: src/App.tsx