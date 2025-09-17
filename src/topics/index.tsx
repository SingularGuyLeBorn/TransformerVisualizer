// FILE: src/topics/index.tsx
import React from 'react';
import { TransformerExplorerTopic } from './transformer-explorer/TransformerExplorerTopic';
import { AttentionVariantsTopic } from './attention-variants/AttentionVariantsTopic';
import { RefactoredAttentionVariantsTopic } from './refactored-attention-variants/AttentionVariantsTopic'; // [新增] 导入新专题

export interface Topic {
    id: string;
    title: string;
    description: string;
    date: string;
    tags: string[];
    component: React.FC;
}

// [新增] 为目录页创建一个占位组件
const DirectoryPlaceholder: React.FC = () => <div>目录页</div>;

export const topics: Topic[] = [
    {
        id: 'refactored-attention-variants',
        title: '[新版] 多头注意力变体 (组件化重构)',
        description: '【推荐】使用全新的通用组件库重构。展示了从MHA到MLA的演进，验证了新组件的复用性和强大功能。',
        date: '2025年9月8日',
        tags: ['Refactored', 'Components', 'GQA', 'MLA', 'Recommended'],
        component: RefactoredAttentionVariantsTopic,
    },
    {
        id: 'directory',
        title: '组件蓝图与开发计划',
        description: '查看本项目所有核心可视化组件的开发计划、当前状态和设计理念，了解项目的整体架构和未来方向。',
        date: '进行中',
        tags: ['Project', 'Roadmap', 'Architecture'],
        component: DirectoryPlaceholder, // 该组件不会实际渲染，因为路由直接指向DirectoryPage
    },
    {
        id: 'attention-variants',
        title: '[旧版] 多头注意力变体: 从MHA, MQA, GQA到MLA',
        description: '通过交互式图表，深入探讨注意力机制从Multi-Head到Multi-head Latent的演进过程，直观理解其设计理念以及对KV Cache效率和性能的影响。',
        date: '2025年9月7日',
        tags: ['Legacy', 'Attention', 'LLM', 'Visualization'],
        component: AttentionVariantsTopic,
    },
    {
        id: 'transformer-explorer',
        title: '[旧版] Transformer 深度探索器',
        description: '一个完全交互式的可视化工具，带您深入探索Transformer模型内部的数据流动、矩阵变换和数学原理。点击任何数字，追溯它的计算来源。',
        date: '2025年9月6日',
        tags: ['Legacy', 'Transformer', 'Interactive'],
        component: TransformerExplorerTopic,
    },
];

export {};
// END OF FILE: src/topics/index.tsx