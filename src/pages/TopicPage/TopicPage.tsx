// FILE: src/pages/TopicPage/TopicPage.tsx
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { topics } from '../../topics';
import { TopicSidebar } from './components/TopicSidebar';
import './TopicPage.css';

// [NEW] SVG Icon for the toggle button
const MenuIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 6H20M4 12H20M4 18H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);


export const TopicPage: React.FC = () => {
    const { topicId } = useParams<{ topicId: string }>();
    const topic = topics.find(t => t.id === topicId);
    // [NEW] State to manage sidebar visibility, default to hidden
    const [isSidebarVisible, setIsSidebarVisible] = useState(false);

    if (!topic) {
        return <div style={{textAlign: 'center', padding: '40px'}}>专题 '{topicId}' 未找到！</div>;
    }

    const TopicComponent = topic.component;

    // Some topics like the explorers have their own internal scrolling mechanisms
    // and should not be wrapped in a scrolling container.
    const hasCustomLayout = ['transformer-explorer', 'attention-variants'].includes(topic.id);

    return (
        // [MODIFIED] Add class based on state and a toggle button
        <div className={`topic-page-layout ${isSidebarVisible ? 'sidebar-visible' : ''}`}>
            <button
                className="sidebar-toggle-button"
                onClick={() => setIsSidebarVisible(!isSidebarVisible)}
                title={isSidebarVisible ? '隐藏专题列表' : '显示专题列表'}
            >
                <MenuIcon />
            </button>
            <TopicSidebar />
            <div className="topic-content-area">
                <div className={`topic-component-wrapper ${hasCustomLayout ? 'no-scroll' : ''}`}>
                    <TopicComponent />
                </div>
            </div>
        </div>
    );
};

// END OF FILE: src/pages/TopicPage/TopicPage.tsx