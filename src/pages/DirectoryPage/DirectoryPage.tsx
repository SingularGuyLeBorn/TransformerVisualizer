// FILE: src/pages/DirectoryPage/DirectoryPage.tsx
import React from 'react';
import './DirectoryPage.css';

type Status = 'completed' | 'in-progress' | 'planned';

interface ComponentItem {
  title: string;
  description: string;
  status: Status;
}

interface ComponentCategory {
  category: string;
  items: ComponentItem[];
}

const componentBlueprint: ComponentCategory[] = [
  {
    category: '1. 基础交互组件 (Primitives)',
    items: [
      { title: 'InteractiveElement', description: '可交互的单个数值元素，所有可视化的原子构建块。', status: 'completed' },
      { title: 'InteractiveVector', description: '由元素组成的可交互向量，支持高亮和点击事件。', status: 'completed' },
      { title: 'InteractiveMatrix', description: '由元素组成的二维可交互矩阵，支持截断显示和联动高亮。', status: 'completed' },
    ],
  },
  {
    category: '2. 基础计算可视化 (Visualization)',
    items: [
      { title: 'MatMulVisualizer', description: '分步动画展示两个向量的点积（矩阵乘法的核心）计算过程。', status: 'completed' },
      { title: 'ElementwiseOpVisualizer', description: '分步动画展示两个向量的逐元素操作（如加法、乘法）。', status: 'completed' },
    ],
  },
  {
    category: '3. 激活函数 (Activations)',
    items: [
      { title: 'Softmax / ReLU / SwiGLU etc.', description: '可视化各种激活函数如何逐元素地转换输入向量。', status: 'planned' },
    ],
  },
  {
      category: '4. 注意力机制 (Attention)',
      items: [
          { title: 'MHA / MQA / GQA', description: '可视化标准注意力、分组查询注意力和多查询注意力的计算流程。', status: 'in-progress' },
          { title: 'Sparse Attention (NSA, MoBA)', description: '探索各种稀疏注意力模式，理解其如何减少计算量。', status: 'planned' },
          { title: 'FlashAttention / PagedAttention', description: '高效注意力算法的核心思想可视化。', status: 'planned' },
      ]
  },
  {
    category: '5. 归一化 (Normalization)',
    items: [
        { title: 'LayerNorm / RMSNorm', description: '分步动画展示层归一化及其变体的计算过程。', status: 'planned' },
    ],
  },
  {
      category: '6. 核心模块 (Modules)',
      items: [
          { title: 'Residual Connection', description: '可视化残差连接如何将输入添加到输出，形成信息高速公路。', status: 'planned' },
          { title: 'FFN / MoE', description: '探索前馈网络和专家混合模型的数据流。', status: 'planned' },
      ]
  },
  {
      category: '7. 位置编码 (Positional Encodings)',
      items: [
          { title: 'Absolute / RoPE', description: '可视化绝对位置编码和旋转位置编码如何为模型注入顺序信息。', status: 'planned' },
      ]
  },
  {
      category: '8. 后训练算法 (Post-Training)',
      items: [
          { title: 'SFT / RLHF / DPO', description: '可视化监督微调、人类反馈强化学习和直接偏好优化的核心概念。', status: 'planned' },
      ]
  }
];

const ComponentCard: React.FC<{ item: ComponentItem }> = ({ item }) => {
  const statusText = {
    completed: '已完成',
    'in-progress': '进行中',
    planned: '计划中',
  };
  return (
    <div className={`component-card ${item.status}`}>
      <h4>{item.title}</h4>
      <p>{item.description}</p>
      <span className="status-badge">{statusText[item.status]}</span>
    </div>
  );
};

export const DirectoryPage: React.FC = () => {
  return (
    <div className="page-scroll-container">
      <div className="directory-page-container">
        <div className="directory-header">
          <h2>组件蓝图与开发计划</h2>
          <p>
            本项目旨在构建一套完整、可复用的机器学习可视化组件库。以下是当前的开发蓝图，它将指导我们逐步实现所有核心功能模块。
          </p>
        </div>
        {componentBlueprint.map(category => (
          <section key={category.category} className="category-section">
            <h3 className="category-title">{category.category}</h3>
            <div className="component-grid">
              {category.items.map(item => (
                <ComponentCard key={item.title} item={item} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
};
// END OF FILE: src/pages/DirectoryPage/DirectoryPage.tsx