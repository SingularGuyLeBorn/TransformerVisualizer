// FILE: src/pages/TopicPage/components/TopicSidebar.tsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Topic, topics } from '../../../topics';
import './TopicSidebar.css';

export const TopicSidebar: React.FC = () => {
    return (
        <aside className="topic-sidebar">
            <h3 className="sidebar-title">所有专题</h3>
            <ul className="sidebar-topic-list">
                {topics.map((topic: Topic) => (
                    <li key={topic.id} className="sidebar-topic-item">
                        <NavLink
                            to={`/topic/${topic.id}`}
                            className={({ isActive }) =>
                                `sidebar-topic-link ${isActive ? 'active' : ''}`
                            }
                        >
                            {topic.title}
                        </NavLink>
                    </li>
                ))}
            </ul>
        </aside>
    );
};

// END OF FILE: src/pages/TopicPage/components/TopicSidebar.tsx