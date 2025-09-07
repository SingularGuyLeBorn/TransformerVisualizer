// FILE: src/pages/TopicPage/TopicPage.tsx
import React from 'react';
import { useParams } from 'react-router-dom';
import { topics } from '../../topics';
import { TopicSidebar } from './components/TopicSidebar';
import './TopicPage.css';

export const TopicPage: React.FC = () => {
    const { topicId } = useParams<{ topicId: string }>();
    const topic = topics.find(t => t.id === topicId);

    if (!topic) {
        return <div style={{textAlign: 'center', padding: '40px'}}>专题 '{topicId}' 未找到！</div>;
    }

    const TopicComponent = topic.component;

    // Some topics like the explorers have their own internal scrolling mechanisms
    // and should not be wrapped in a scrolling container.
    const hasCustomLayout = ['transformer-explorer', 'attention-variants'].includes(topic.id);

    return (
        <div className="topic-page-layout">
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