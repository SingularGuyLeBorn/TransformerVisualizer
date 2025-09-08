// FILE: src/components/ViewToggle/ViewToggle.tsx
import React from 'react';
import './ViewToggle.css';

export type ViewMode = 'decomposition' | 'animation' | 'none';

interface ViewToggleProps {
  viewMode: ViewMode;
  setViewMode: React.Dispatch<React.SetStateAction<ViewMode>>;
}

export const ViewToggle: React.FC<ViewToggleProps> = ({ viewMode, setViewMode }) => {
  return (
    <div className="view-toggle-container">
      <button
        className={`view-toggle-button ${viewMode === 'decomposition' ? 'active' : ''}`}
        onClick={() => setViewMode(prev => prev === 'decomposition' ? 'none' : 'decomposition')}
        title="切换到分解视图模式"
      >
        分解视图
      </button>
      <button
        className={`view-toggle-button ${viewMode === 'animation' ? 'active' : ''}`}
        onClick={() => setViewMode(prev => prev === 'animation' ? 'none' : 'animation')}
        title="切换到动画视图模式"
      >
        动画视图
      </button>
      {viewMode !== 'none' && (
         <button
            className="view-toggle-close-button"
            onClick={() => setViewMode('none')}
            title="关闭视图模式"
         >
            &times;
         </button>
      )}
    </div>
  );
};

// END OF FILE: src/components/ViewToggle/ViewToggle.tsx