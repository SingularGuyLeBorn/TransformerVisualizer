// FILE: src/components/MarkdownRenderer.tsx
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

interface MarkdownRendererProps {
    markdown: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ markdown }) => {
    // 定义我们所有的渲染组件，包括标准的和自定义的
    const components = {
        // [修复] 为 remark-math 插件生成的自定义节点提供渲染器
        // 'math' 对应 $$...$$
        // 'inlineMath' 对应 $...$
        math: ({ value }: { value: string }) => <BlockMath math={value} />,
        inlineMath: ({ value }: { value: string }) => <InlineMath math={value} />,
        
        // 我们也可以在这里覆盖标准HTML标签的样式
        // 使用 'any' 类型来避免对 props 的繁琐类型定义
        img: ({node, ...props}: any) => (
            <img 
                style={{maxWidth: '100%', height: 'auto', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} 
                {...props} 
                alt="" 
            />
        )
    };

    return (
        <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkMath]}
            // [最终解决方案] 将 components 对象断言为 'any' 类型。
            // 这会告诉 TypeScript 编译器：“忽略类型检查，接受我提供的所有自定义渲染器”，
            // 从而彻底解决 TS2322 错误。
            components={components as any}
        >
            {markdown}
        </ReactMarkdown>
    );
};