// FILE: src/topics/index.tsx
import React from 'react';
import { TransformerExplorerTopic } from './transformer-explorer/TransformerExplorerTopic';
import { AttentionVariantsTopic } from './attention-variants/AttentionVariantsTopic';
import { RefactoredAttentionVariantsTopic } from './refactored-attention-variants/AttentionVariantsTopic';
import { RefactoredTransformerExplorerTopic } from './refactored-transformer-explorer/TransformerExplorerTopic';
import { ComponentShowcaseTopic } from './component-showcase/ComponentShowcaseTopic';
import { ComputationGraphShowcase } from './computation-graph-showcase/ComputationGraphShowcase';

export interface Topic {
    id: string;
    title: string;
    description: string;
    date: string;
    tags: string[];
    component: React.FC;
}

const DirectoryPlaceholder: React.FC = () => <div>目录页</div>;

export const topics: Topic[] = [
    {
        id: 'component-showcase',
        title: '通用组件展厅',
        description: '一个用于集中展示和测试所有已完成的通用可视化组件的页面。在这里，您可以直观地看到每个组件的最新效果。',
        date: '持续更新',
        tags: ['Components', 'Showcase', 'Dev'],
        component: ComponentShowcaseTopic,
    },
    {
        id: 'computation-graph-showcase',
        title: '计算图展厅',
        description: '展示可拖拽节点（DraggableNode）组件，这是未来构建完全交互式计算图编辑器的第一步。',
        date: '2025年9月10日',
        tags: ['Components', 'Graph', 'Dev'],
        component: ComputationGraphShowcase,
    },
    {
        id: 'refactored-attention-variants',
        title: '[新版] 多头注意力变体 (组件化重构)',
        description: '【推荐】一篇深度科普文章，使用通用组件库，详细剖析从MHA到MLA的演进，深入探讨KV Cache优化的核心思想。',
        date: '2025年9月9日',
        tags: ['深度文章', 'Attention', 'GQA', 'MLA', '推荐'],
        component: RefactoredAttentionVariantsTopic,
    },
    {
        id: 'refactored-transformer-explorer',
        title: '[新版] Transformer 深度探索器 (组件化重构)',
        description: '【推荐】使用通用组件库重构的Transformer可视化工具。内容更详尽，交互更流畅，为您揭示Transformer的内部工作原理。',
        date: '2025年9月9日',
        tags: ['深度文章', 'Transformer', '组件化', '推荐'],
        component: RefactoredTransformerExplorerTopic,
    },
    {
        id: 'directory',
        title: '组件蓝图与开发计划',
        description: '查看本项目所有核心可视化组件的开发计划、当前状态和设计理念，了解项目的整体架构和未来方向。',
        date: '进行中',
        tags: ['Project', 'Roadmap', 'Architecture'],
        component: DirectoryPlaceholder,
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