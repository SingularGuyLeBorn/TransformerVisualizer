// FILE: src/pages/HomePage/HomePage.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { topics, Topic } from '../../topics';
import './HomePage.css';

const TAG_COLORS = ['color-1', 'color-2', 'color-3', 'color-4', 'color-5'];

const TopicCard: React.FC<{ topic: Topic }> = ({ topic }) => {
    // [修改] 如果id是'directory'，则使用不同的链接
    const linkTo = topic.id === 'directory' ? '/directory' : `/topic/${topic.id}`;

    return (
        <Link to={linkTo} className="topic-card-link">
            <div className="topic-card">
                <div className="topic-card-header">
                    <div className="topic-card-tags">
                        {topic.tags.map((tag, index) => (
                            <span key={tag} className={`topic-card-tag ${TAG_COLORS[index % TAG_COLORS.length]}`}>{tag}</span>
                        ))}
                    </div>
                </div>
                <div className="topic-card-content">
                    <h3 className="topic-card-title">{topic.title}</h3>
                    <p className="topic-card-description">{topic.description}</p>
                </div>
                <div className="topic-card-footer">
                    <div className="topic-card-date">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <g strokeWidth="0" id="SVGRepo_bgCarrier"></g>
                            <g strokeLinejoin="round" strokeLinecap="round" id="SVGRepo_tracerCarrier"></g>
                            <g id="SVGRepo_iconCarrier">
                                <path strokeLinecap="round" strokeWidth="2" d="M12 8V12L15 15"></path>
                                <circle strokeWidth="2" r="9" cy="12" cx="12"></circle>
                            </g>
                        </svg>
                        {topic.date}
                    </div>
                </div>
            </div>
        </Link>
    );
};


export const HomePage: React.FC = () => {
    return (
        <div className="page-scroll-container">
            <div className="homepage-container">
                <div className="homepage-intro">
                    <h2>欢迎来到 AI 深度探索</h2>
                    <p>一个旨在通过交互式可视化和深度文章，剖析前沿AI技术的知识平台。</p>
                </div>
                <div className="topic-grid">
                    {topics.map(topic => (
                        <TopicCard key={topic.id} topic={topic} />
                    ))}
                </div>
            </div>
        </div>
    );
};
// END OF FILE: src/pages/HomePage/HomePage.tsx