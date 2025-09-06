// FILE: src/topics/attention-variants/AttentionVariantsTopic.tsx
import React from 'react';
import './AttentionVariantsTopic.css';

export const AttentionVariantsTopic: React.FC = () => {
    return (
        <div className="attention-variants-container">
            <h2>多头注意力变体: 从MHA, MQA, GQA到MLA</h2>
            <p style={{ textAlign: 'center', fontSize: '1.2em', color: '#606266' }}>
                此专题内容正在准备中，敬请期待...
            </p>
            {/*
                当您准备好 markdown 文件后，
                可以用下面这段代码替换上面的 <p> 标签和 <h2> 标签，
                并确保 MarkdownRenderer 组件存在。

                const [content, setContent] = useState('');

                useEffect(() => {
                    fetch(rawMarkdown)
                        .then(response => response.text())
                        .then(text => setContent(text.replace('# FILE: src/topics/attention-variants/content.md', '')));
                }, []);

                if (!content) {
                    return <div>Loading content...</div>;
                }

                return (
                    <div className="attention-variants-container">
                        <MarkdownRenderer markdown={content} />
                    </div>
                );
            */}
        </div>
    );
};