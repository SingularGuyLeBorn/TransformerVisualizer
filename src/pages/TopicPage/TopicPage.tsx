// FILE: src/pages/TopicPage/TopicPage.tsx
import React from 'react';
import { useParams } from 'react-router-dom';
import { topics } from '../../topics';

export const TopicPage: React.FC = () => {
    const { topicId } = useParams<{ topicId: string }>();
    const topic = topics.find(t => t.id === topicId);

    if (!topic) {
        return <div style={{textAlign: 'center', padding: '40px'}}>专题 '{topicId}' 未找到！</div>;
    }

    const TopicComponent = topic.component;

    // For the transformer explorer, we render it directly to control its unique layout
    if (topic.id === 'transformer-explorer') {
        return <TopicComponent />;
    }

    // For other topics (like markdown articles), wrap them in a standard container
    return (
        <div className="topic-page-container">
            <TopicComponent />
        </div>
    );
};

export {}