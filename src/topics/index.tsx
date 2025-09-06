// FILE: src/topics/index.tsx
import React from 'react'; // 必须导入 React 才能使用 React.FC
import { TransformerExplorerTopic } from './transformer-explorer/TransformerExplorerTopic';
import { AttentionVariantsTopic } from './attention-variants/AttentionVariantsTopic';

export interface Topic {
    id: string;
    title: string;
    description: string;
    date: string;
    tags: string[];
    component: React.FC;
}

export const topics: Topic[] = [
    {
        id: 'attention-variants',
        title: '多头注意力变体: 从MHA, MQA, GQA到MLA',
        description: '通过交互式图表，深入探讨注意力机制从Multi-Head到Multi-head Latent的演进过程，直观理解其设计理念以及对KV Cache效率和性能的影响。',
        date: '2025年9月7日',
        tags: ['Attention', 'LLM', 'GQA', 'MLA', 'Visualization'],
        component: AttentionVariantsTopic,
    },
    {
        id: 'transformer-explorer',
        title: 'Transformer 深度探索器',
        description: '一个完全交互式的可视化工具，带您深入探索Transformer模型内部的数据流动、矩阵变换和数学原理。点击任何数字，追溯它的计算来源。',
        date: '2025年9月6日',
        tags: ['Transformer', 'Visualization', 'Interactive', 'PyTorch'],
        component: TransformerExplorerTopic,
    },
    // 未来可以在这里添加更多专题...
];

// [最终修复] 即使已有其他 export 语句，在 .tsx 文件中再添加一个空的 export
// 是最明确、最可靠地将其标记为模块的方式，可以彻底解决 TS1208 错误。
export {};

// END OF FILE: src/topics/index.tsx