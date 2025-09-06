// FILE: src/pages/HomePage/HomePage.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { topics, Topic } from '../../topics';
import './HomePage.css';

const TopicCard: React.FC<{ topic: Topic }> = ({ topic }) => {
    return (
        <Link to={`/topic/${topic.id}`} className="topic-card-link">
            <div className="topic-card">
                <div className="topic-card-header">
                    <h2 className="topic-card-title">{topic.title}</h2>
                    <span className="topic-card-date">{topic.date}</span>
                </div>
                <p className="topic-card-description">{topic.description}</p>
                 <div className="topic-card-tags">
                    {topic.tags.map(tag => <span key={tag} className="topic-card-tag">{tag}</span>)}
                </div>
            </div>
        </Link>
    );
};


export const HomePage: React.FC = () => {
    return (
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
    );
};