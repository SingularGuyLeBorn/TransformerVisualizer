// FILE: src/pages/DirectoryPage/DirectoryPage.tsx
import React, { useState, useEffect } from 'react';
import './DirectoryPage.css';

type Status = 'completed' | 'in-progress' | 'planned';

interface ComponentItem {
    id: string; // Unique ID for keying
    title: string;
    description: string;
    status: Status;
    details: {
        purpose: string;
        howItWorks?: string;
        visualisation?: string;
        impact?: string;
        nitpicks?: string[];
    };
}

interface ComponentCategory {
    category: string;
    description: string;
    items: ComponentItem[];
}

// [CORE FIX] The blueprint is now restored to its full 14-category glory.
const componentBlueprint: ComponentCategory[] = [
    {
        category: '1. 核心交互基元 (Primitives)',
        description: '构成所有高级可视化组件的最基础、可交互的原子元素，提供基础数据展示和用户交互能力。',
        items: [
            { id: 'interactive_elements', title: 'InteractiveMatrix/Vector/Element', status: 'completed',
                description: '提供基础的数值矩阵、向量和单个元素的交互式展示。',
                details: {
                    purpose: '实现数据的基本可视化和用户高亮、点击等交互，是所有复杂组件的数据展示基础。',
                    nitpicks: [
                        '**性能优化**：在超大矩阵（如 1024x1024）上可能会有性能问题，未来可考虑虚拟化渲染。',
                    ]
                }
            },
            { id: 'draggable_node', title: 'DraggableNode', status: 'completed',
                description: '可在画布上自由拖拽的节点，用于构建计算图或模型架构图。',
                details: {
                    purpose: '为构建动态、可编辑的计算图提供基础交互能力。',
                    nitpicks: [
                        '**功能增强**：目前节点之间无法建立可视化连接，需要实现 `ConnectablePort` 子组件和连线绘制逻辑。',
                    ]
                }
            },
            { id: 'interactive_tensor', title: 'InteractiveTensor', status: 'completed',
                description: '高维张量（3D及以上）的交互式切片与可视化。',
                details: {
                    purpose: '帮助用户理解和观察高维数据结构，通过切片操作聚焦特定维度的数据。',
                }
            },
        ],
    },
    {
        category: '2. 基础计算动画 (Core Animations)',
        description: '将深度学习中的核心数学运算以分步动画的形式直观呈现，帮助用户理解计算细节。',
        items: [
            { id: 'activation_rope', title: 'Activation/RoPE Visualizer', status: 'completed',
                description: '多种激活函数（ReLU, GELU, SiLU, SwiGLU）及其函数曲线，以及旋转位置编码（RoPE）的分步动画。',
                details: {
                    purpose: '直观理解非线性变换对数据的影响和位置编码如何为模型注入顺序信息。',
                }
            },
            { id: 'softmax_layernorm_rmsnorm', title: 'Softmax/LayerNorm/RMSNorm Visualizer', status: 'completed',
                description: 'Softmax、LayerNorm和RMSNorm等归一化函数的分步动画演示。',
                details: {
                    purpose: '清晰展示归一化层如何稳定神经网络训练，并通过动画分解其复杂的统计学计算过程。',
                }
            },
            { id: 'ffn_residualadd', title: 'FeedForward/ResidualAdd Visualizer', status: 'completed',
                description: '前馈网络（FFN）和残差连接（Add & Norm）的核心数据流与动画。',
                details: {
                    purpose: '展示Transformer等模型中两个最核心的子层如何处理信息。',
                }
            },
        ],
    },
    {
        category: '3. 激活函数 (Activation Functions)',
        description: '（已并入基础计算动画模块）',
        items: []
    },
    {
        category: '4. 注意力机制 (Attention Mechanisms)',
        description: '深入剖析Transformer中的核心注意力机制，从MHA到更高效的变体，理解其设计哲学与得失权衡。',
        items: [
            { id: 'attention_mha_mqa_gqa_mla', title: 'AttentionVisualizer (MHA/MQA/GQA/MLA)', status: 'in-progress',
                description: '一个通用组件，通过props切换，可视化多头、多查询、分组查询以及潜在注意力（MLA）的计算流程和KV Cache优化。',
                details: {
                    purpose: '直观对比不同注意力机制的Q/K/V共享策略、KV Cache的压缩效果以及对性能的影响。',
                }
            },
            { id: 'sparse_linear_attention', title: 'Sparse & Linear Attention', status: 'planned',
                description: '可视化稀疏注意力（如NSA, MoBA）和线性注意力（如Linformer, Performer）如何优化计算复杂度。',
                details: {
                    purpose: '解释这些高级注意力机制如何通过选择性计算或线性化操作，将计算量从 `O(N^2)` 降低。',
                }
            },
        ],
    },
    {
        category: '5. 现代架构 (Modern Architectures)',
        description: '超越Transformer，探索最新的、具有创新性的序列模型架构，理解其设计理念与优势。',
        items: [
            { id: 'mamba_visualizer', title: 'MambaVisualizer (SSM)', status: 'completed',
                description: '可视化基于状态空间模型（SSM）的Mamba如何通过选择性扫描机制高效处理序列。',
                details: {
                    purpose: '解释Mamba如何结合RNN的循环特性和现代硬件的并行优势，解决长序列依赖问题。',
                }
            },
            { id: 'rwkv_retnet', title: 'RWKV / RetNet', status: 'planned',
                description: '可视化RWKV（RNN与Transformer融合）和RetNet（Retention Network）的核心机制。',
                details: {
                    purpose: '展示这些架构如何在保持线性或次线性复杂度的同时，实现优秀的性能。',
                }
            },
        ],
    },
    {
        category: '6. 归一化 (Normalization)',
        description: '（已并入基础计算动画模块）',
        items: []
    },
    {
        category: '7. 架构模块 (Architecture Modules)',
        description: '构成深度神经网络的通用高级模块。',
        items: [
            {id: 'classic_nn', title: 'Classic Networks (CNN/RNN)', status: 'planned', description: '可视化经典的卷积和循环神经网络的基本操作。', details: {purpose: '回顾经典，为理解混合架构打下基础。'}}
        ]
    },
    {
        category: '8. 稀疏模型 (Sparse Models)',
        description: '探索通过稀疏化提升模型效率的策略。',
        items: [
            {id: 'moe_visualizer', title: 'MoEVisualizer', status: 'completed', description: '可视化专家混合模型（MoE）中的路由器如何动态选择专家。', details: {purpose: '解释MoE如何通过稀疏激活实现用更少的计算获得更大的模型容量。'}}
        ]
    },
    {
        category: '9. FFN 变体 (Feed-Forward Networks)',
        description: '（已并入激活函数模块）',
        items: []
    },
    {
        category: '10. 位置编码 (Positional Encoding)',
        description: '（已并入基础计算动画模块）',
        items: []
    },
    {
        category: '11. 后训练算法 (Post-Training)',
        description: '使大模型输出更安全、更有用、更符合人类意图的关键技术。',
        items: [
            { id: 'sft_visualizer', title: 'SFTVisualizer', status: 'completed',
                description: '可视化监督微调（SFT）中“提示-回答”对的训练流程。',
                details: {
                    purpose: '解释SFT如何通过模仿学习，教会模型遵循指令并生成期望的响应。',
                }},
            { id: 'dpo_visualizer', title: 'DPO (Direct Preference Optimization)', status: 'planned',
                description: '可视化直接偏好优化（DPO）如何直接在偏好数据上微调模型，简化RLHF流程。',
                details: {
                    purpose: '解释DPO如何在不显式训练奖励模型的情况下，直接从偏好数据中学习对齐策略。',
                }}
        ]
    },
    {
        category: '12. 参数高效微调 (PEFT)',
        description: '在不改动大部分预训练模型参数的情况下，实现模型高效适应新任务的关键技术。',
        items: [
            { id: 'lora_visualizer', title: 'LoRAVisualizer', status: 'completed',
                description: '可视化低秩适应（LoRA）如何通过在旁路添加小型低秩矩阵来微调大模型权重。',
                details: {
                    purpose: '解释LoRA如何显著减少可训练参数数量，降低微调成本。',
                }
            },
            { id: 'adapter_visualizer', title: 'AdapterVisualizer', status: 'completed',
                description: '可视化Adapter微调如何通过注入小型可训练模块到冻结的Transformer层中。',
                details: {
                    purpose: '解释Adapter如何在不改变原始模型架构的情况下，通过添加少量参数实现对特定任务的适应。',
                }
            },
        ],
    },
    {
        category: '13. 量化与压缩 (Quantization & Compression)',
        description: '减小模型体积、加速推理的核心优化技术。',
        items: [
            {id: 'quantization', title: 'Quantization (INT8/4)', status: 'planned', description: '可视化权重和激活值如何从FP16/BF16被量化为低精度整数。', details: {purpose: '解释量化如何以微小的性能损失换取显著的推理加速和显存节省。'}}
        ]
    },
    {
        category: '14. 可视化调试工具 (Visualization Tools)',
        description: '用于分析和调试模型训练过程与结果的通用工具。',
        items: [
            {id: 'heatmap', title: 'Attention Heatmap', status: 'planned', description: '展示注意力权重的热力图，分析模型关注点。', details: {purpose: '提供一种直观的方式来“看透”模型的注意力分配，用于模型解释和调试。'}}
        ]
    },
];

const ComponentItemCard: React.FC<{ item: ComponentItem }> = ({ item }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const statusText = {
        completed: '已完成',
        'in-progress': '进行中',
        planned: '计划中',
    };
    const hasDetails = item.details.purpose || item.details.nitpicks;

    return (
        <div className={`component-card ${isExpanded ? 'expanded' : ''}`} onClick={() => hasDetails && setIsExpanded(!isExpanded)}>
            <div className="card-header">
                <div className="card-title-status">
                    <h4 className="card-title">{item.title}</h4>
                    <span className={`status-badge ${item.status}`}>{statusText[item.status]}</span>
                </div>
                {hasDetails && (
                    <button className={`expand-toggle ${isExpanded ? 'expanded' : ''}`}>
                        {isExpanded ? '▲' : '▼'}
                    </button>
                )}
            </div>
            <div className="card-content">
                <p className="component-description">{item.description}</p>
            </div>
            {hasDetails && (
                <div className={`card-details ${isExpanded ? 'expanded' : ''}`}>
                    {item.details.purpose && (
                        <div className="details-section">
                            <h4>目的 (Purpose)</h4>
                            <p>{item.details.purpose}</p>
                        </div>
                    )}
                    {item.details.nitpicks && item.details.nitpicks.length > 0 && (
                        <div className="details-section">
                            <h4>吹毛求疵 (优化方向)</h4>
                            <ul className="details-section nitpick-list">
                                {item.details.nitpicks.map((note, index) => (
                                    <li key={index}>{note}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export const DirectoryPage: React.FC = () => {
    const [overallProgress, setOverallProgress] = useState(0);

    useEffect(() => {
        let totalItems = 0;
        let completedItems = 0;
        componentBlueprint.forEach(category => {
            category.items.forEach(item => {
                totalItems++;
                if (item.status === 'completed') {
                    completedItems++;
                }
            });
        });
        const newProgress = totalItems === 0 ? 0 : Math.round((completedItems / totalItems) * 100);
        // Use a timeout to ensure the bar animates from 0 on mount
        setTimeout(() => setOverallProgress(newProgress), 100);
    }, []);

    return (
        <div className="page-scroll-container">
            <div className="directory-page-container">
                <div className="directory-header">
                    <h2>组件蓝图与开发计划</h2>
                    <p>
                        这是一个动态的开发文档，记录了所有组件的开发状态以及我们“吹毛求疵”出的潜在优化方向。
                    </p>
                </div>

                <div className="overall-progress">
                    <h3>项目总进度</h3>
                    <div className="progress-bar-wrapper">
                        <div className="progress-bar" style={{ width: `${overallProgress}%` }}>
                            <span className="progress-text">{overallProgress}%</span>
                        </div>
                    </div>
                </div>

                {componentBlueprint.filter(c => c.items.length > 0).map(category => {
                    const totalCategoryItems = category.items.length;
                    const completedCategoryItems = category.items.filter(item => item.status === 'completed').length;
                    const categoryProgress = totalCategoryItems === 0 ? 0 : Math.round((completedCategoryItems / totalCategoryItems) * 100);

                    return (
                        <section key={category.category} className="category-section">
                            <div className="category-header">
                                <h3>{category.category}</h3>
                                <div className="category-progress-wrapper">
                                    <div className="category-progress-bar" style={{ width: `${categoryProgress}%` }}>
                                        <span className="category-progress-text">{categoryProgress}%</span>
                                    </div>
                                </div>
                            </div>
                            <p className="category-description">{category.description}</p>
                            <div className="component-grid">
                                {category.items.map(item => (
                                    <ComponentItemCard key={item.id} item={item} />
                                ))}
                            </div>
                        </section>
                    );
                })}
            </div>
        </div>
    );
};
// END OF FILE: src/pages/DirectoryPage/DirectoryPage.tsx