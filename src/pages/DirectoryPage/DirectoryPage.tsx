// FILE: src/pages/DirectoryPage/DirectoryPage.tsx
import React, { useState, useEffect } from 'react';
import './DirectoryPage.css';

type Status = 'completed' | 'in-progress' | 'planned';

interface ComponentItem {
    id: string;
    title: string;
    description: string;
    status: Status;
    details: {
        purpose: string;
        howItWorks?: string;
        visualisation: string;
        impact: string;
        nitpicks?: string[];
    };
}

interface ComponentCategory {
    category: string;
    description: string;
    items: ComponentItem[];
}

const componentBlueprint: ComponentCategory[] = [
    {
        category: '1. 交互基元 (Interactive Primitives)',
        description: '构成所有高级可视化组件的最基础、可交互的原子元素。它们是我们将抽象数学概念转化为具体可感图形界面的基石。',
        items: [
            { id: 'interactive_matrix', title: 'InteractiveMatrix/Vector/Scalar', status: 'completed',
                description: '提供基础的数值矩阵、向量和单个元素的交互式展示，支持点击、悬浮、高亮和智能截断显示。',
                details: {
                    purpose: '解决深度学习中“一切皆张量”的抽象性。此组件旨在将这些冰冷的数字转化为用户可以直观感知、操作和溯源的图形元素。',
                    visualisation: '一个可配置的网格，每个单元格代表一个数值，并用颜色深浅（色阶）表示其大小。鼠标悬浮时，单元格会放大并显示精确数值的Tooltip。点击时，单元格会高亮，并可触发回调（例如，在计算图中追溯其来源）。对于超大矩阵，会自动启用虚拟化渲染和智能省略号截断。',
                    impact: '这是降低理解门槛的第一步。它让初学者明白，复杂的“权重矩阵”或“嵌入向量”本质上就是一个个数字的集合，并能直观看到数值的分布和变化，是实现“点击即可溯源”功能的基础。',
                    nitpicks: [
                        '**交互增强**：增加框选功能，允许用户一次性高亮矩阵中的一个区域，用于观察卷积核操作或注意力子矩阵。',
                        '**3D渲染**：未来可探索使用`three.js`将矩阵渲染为3D热力图地形，以更立体地展示数值景观。'
                    ]
                }
            },
            { id: 'draggable_node', title: 'DraggableNode & ConnectablePort', status: 'in-progress',
                description: '可在画布内自由拖拽的节点，并带有可用于建立连接的端口，是构建动态计算图的核心。',
                details: {
                    purpose: '将静态的模型架构图（如论文中的框图）转变为一个动态的、可由用户亲手搭建和重排的“数字乐高”，从而赋予用户探索模型结构的主动权。',
                    visualisation: '一个带有标题和内容区域的卡片式节点。鼠标按住标题栏可拖动其在父容器中的位置。节点的边缘在悬浮时会出现可点击的输入/输出端口（ConnectablePort），点击并拖拽端口可以拉出一条连接线（由`AnimatedFlow`实现）。',
                    impact: '极大地提升了用户的参与感和探索自由度。用户不再是被动地看图，而是可以主动地“构建”一个Transformer Block，亲手连接多头注意力和前馈网络，从而深刻理解模型的模块化构成和数据流。'
                }
            },
            { id: 'animated_flow', title: 'AnimatedFlow', status: 'planned',
                description: '在两个连接的节点之间，可视化数据流动的动画路径。',
                details: {
                    purpose: '清晰地展示计算图中的数据流向、依赖关系以及计算的先后顺序。',
                    visualisation: '使用SVG或Canvas绘制平滑的贝塞尔曲线连接两个节点的端口。当数据流动时，发光的粒子或动态的虚线会沿着曲线从输出端口移动到输入端口。流动的速度和粒子密度可以用来表示数据量或计算强度。',
                    impact: '让“前向传播”和“反向传播”这些抽象概念变得具体可见。用户能直观地看到一个Token的向量如何在模型中“旅行”，以及梯度是如何从损失函数“流回”到每一层参数的。'
                }
            }
        ],
    },
    {
        category: '2. 激活函数 (Activation Functions)',
        description: '可视化各种激活函数如何对输入数据进行非线性变换，这是神经网络学习复杂模式、打破线性模型局限的关键所在。',
        items: [
            { id: 'softmax', title: 'Softmax', status: 'completed',
                description: '将一组任意实数转换为一个概率分布。',
                details: {
                    purpose: '在分类任务中输出概率，或在注意力机制中将分数转换为权重。',
                    visualisation: '输入一个`InteractiveVector`，动画展示每个元素如何经过`exp(x)`变换，然后所有变换后的值相加得到归一化分母，最后每个值再除以该分母，得到最终的概率分布向量。可以调节`temperature`参数观察概率分布的平滑/尖锐变化。',
                    impact: '将注意力分数到最终权重的转换过程透明化，是理解注意力机制的关键一步。'
                }
            },
            { id: 'relu', title: 'ReLU (Rectified Linear Unit)', status: 'completed',
                description: '最简单、最常用的激活函数，`f(x) = max(0, x)`。',
                details: {
                    purpose: '为网络引入非线性，同时计算极其高效，并有效缓解了梯度消失问题。',
                    visualisation: '在一个2D坐标系中绘制其“折线”函数图像。动画展示输入向量中的负值元素被“压平”到0，而正值元素保持不变。',
                    impact: '直观展示了“稀疏激活”的概念——一部分神经元被关闭（输出为0），有助于形成更高效的特征表示。'
                }
            },
            { id: 'gelu', title: 'GELU (Gaussian Error Linear Unit)', status: 'planned',
                description: '一种平滑的ReLU近似，广泛用于BERT、GPT等Transformer模型中。',
                details: {
                    purpose: '提供比ReLU更平滑的非线性变换，被认为能提供更好的优化性能。',
                    visualisation: '与ReLU并列展示其平滑的曲线。动画会强调其在负值区域并非硬性截断，而是平滑地趋近于0，允许少量负梯度通过。',
                    impact: '解释了现代Transformer为何偏爱这类“更软”的激活函数，以及其相对于ReLU的理论优势。'
                }
            },
            { id: 'swiglu', title: 'SwiGLU (Swish-Gated Linear Unit)', status: 'in-progress',
                description: '一种门控线性单元，是Llama等顶尖大模型FFN层的关键。',
                details: {
                    purpose: '通过一个数据依赖的“门控”机制，动态地调整信息流，让网络自适应地决定哪些信息可以通过，极大提升了FFN层的表达能力。',
                    visualisation: '动画将一个输入向量`x`清晰地分裂成两路。一路流经`Swish`激活，另一路作为“门”。然后两者进行逐元素相乘，这个相乘步骤会用闪烁的动画来强调。',
                    impact: '揭示了现代LLM性能提升的一个关键秘密：FFN层不只是简单的非线性变换，更是一个智能的、自适应的“信息筛选器”。'
                }
            }
        ]
    },
    {
        category: '3. 注意力机制 (Attention Mechanisms)',
        description: 'Transformer模型的心脏。这些机制使其能够动态地、加权地关注输入序列中的不同部分，从而高效处理长距离依赖。',
        items: [
            { id: 'self_attention', title: 'Self-Attention', status: 'completed',
                description: '注意力的基本形式，序列中的每个元素都与序列中的所有其他元素计算关联度。',
                details: {
                    purpose: '在一个序列内部建立元素间的依赖关系，捕捉句法结构、指代关系等。',
                    visualisation: '核心是`Scaled Dot-Product Attention`的完整分步动画：Q,K,V生成 -> QKᵀ相乘 -> Scale -> Softmax -> 与V加权求和。用户可以点击序列中任何一个Token，来观看它作为Query的完整计算流程。',
                    impact: '这是理解Transformer如何工作的最核心、最关键的一步。它将论文中浓缩的公式分解为可交互、可理解的矩阵运算步骤。'
                }
            },
            { id: 'mha', title: 'MHA (Multi-Head Attention)', status: 'in-progress',
                description: '将注意力计算并行地在多个“表示子空间”中进行，然后拼接结果。',
                details: {
                    purpose: '允许模型在不同方面、不同位置共同关注信息。例如，一个头可能关注句法关系，另一个头关注语义相似性。',
                    visualisation: '将Q,K,V矩阵在特征维度上清晰地切分成多个“头”，用不同颜色表示。每个头都独立执行一次自注意力计算（并行展示）。最后，所有头的输出向量被拼接（concat）起来，再通过一个线性层融合。',
                    impact: '让学习者明白模型是如何“多角度思考”的，以及为什么增加“头”的数量能提升模型的表达能力。'
                }
            },
            { id: 'mqa', title: 'MQA (Multi-Query Attention)', status: 'planned',
                description: 'MHA的一种推理优化变体，所有查询头共享同一组键(K)和值(V)头。',
                details: {
                    purpose: '在自回归生成（推理）时，大幅减少需要缓存的KV Cache大小，从而降低内存占用和显存带宽，提升推理速度。',
                    visualisation: '与MHA对比展示。MHA中，N个Q头对应N个K,V头。MQA中，N个Q头全部指向唯一的一组K,V头。下方会有一个KV Cache的可视化，其大小会根据所选模式动态变化，直观展示MQA带来的巨大内存节省。',
                    impact: '揭示了模型工程优化的一个关键方向：如何让强大的模型在资源有限的设备上高效运行。'
                }
            },
            { id: 'gqa', title: 'GQA (Grouped-Query Attention)', status: 'planned',
                description: 'MHA和MQA之间的一种折中方案，每组查询头共享一组K,V头。',
                details: {
                    purpose: '在保持接近MHA性能的同时，实现类似MQA的推理效率提升，是一种“两全其美”的方案。',
                    visualisation: '用分组框将多个Q头框起来，共同指向同一组K,V头。例如，8个Q头可能被分成2组，每4个Q头共享一组K,V。KV Cache的大小会介于MHA和MQA之间。',
                    impact: '清晰展示了在模型质量和推理效率之间进行权衡设计的思想，是Mixtral等SOTA模型采用的关键技术。'
                }
            },
            { id: 'sliding_window_attention', title: 'Sliding Window Attention', status: 'planned',
                description: '一种稀疏注意力，每个Token只关注其邻近的一个固定大小的窗口内的其他Token。',
                details: {
                    purpose: '将注意力的计算复杂度从O(N²)降低到O(N*W)（W为窗口大小），使其能处理非常长的序列。',
                    visualisation: '在一个巨大的N×N注意力矩阵的背景上，只高亮并计算其对角线周围的一个带状区域。当Query移动时，这个“关注窗口”也随之滑动。',
                    impact: '是Longformer等长文本模型的核心思想之一，直观展示了如何用局部注意力来近似全局注意力，以换取效率。'
                }
            },
            { id: 'flash_attention', title: 'FlashAttention', status: 'planned',
                description: '一种为现代GPU深度优化的IO感知（IO-aware）注意力算法。',
                details: {
                    purpose: '在不改变数学等价性的前提下，通过核函数融合、分块计算等技巧，大幅减少GPU内存的读写次数，从而在不牺牲精度的情况下，实现2-4倍的加速并节省大量内存。',
                    visualisation: '一个抽象的硬件示意图，包含“HBM（慢速大显存）”和“SRAM（快速小缓存）”。动画对比标准注意力和FlashAttention的内存访问模式。FlashAttention会以“块”为单位将Q,K,V加载到SRAM中完成计算，显著减少与HBM的交互次数。',
                    impact: '揭示了算法与硬件协同设计的巨大威力。让学习者明白，现代AI的性能突破不仅仅来自模型结构创新，也同样来自对底层硬件特性的深刻理解和极致利用。'
                }
            }
        ]
    },
    {
        category: '4. 现代架构 (Modern Architectures)',
        description: '超越经典Transformer，探索最新的、具有创新性的序列模型架构，它们试图解决Transformer在效率或性能上的局限。',
        items: [
            { id: 'mamba', title: 'Mamba (Selective SSM)', status: 'completed',
                description: '可视化基于状态空间模型（SSM）的Mamba，如何通过选择性扫描机制以线性复杂度高效处理长序列。',
                details: {
                    purpose: '结合RNN的循环特性（O(N)复杂度）和现代硬件的并行优势，并通过一个内容感知的选择机制，动态地决定要记住什么、忘记什么。',
                    visualisation: '核心是展示一个隐藏状态向量`h`的演化。动画展示在处理每个token `x_t`时，一个控制网络如何根据`x_t`动态生成状态转移参数A, B, C。然后，这些参数被用来更新隐藏状态：`h_t = A * h_{t-1} + B * x_t`。这个“选择性”的过程会通过高亮变化的A,B参数来强调。',
                    impact: 'Mamba是当前非Transformer架构的最前沿代表。可视化能帮助学习者理解其核心思想：从一个固定的、线性的状态空间模型，通过引入输入的动态控制，演变成一个强大的、内容感知的序列建模器。'
                }
            },
            { id: 'rwkv', title: 'RWKV (Receptance Weighted Key Value)', status: 'planned',
                description: '一种创新的线性注意力架构，融合了RNN和Transformer的优点。',
                details: {
                    purpose: '设计出一种既能像RNN一样进行高效的O(1)循环推理，又能像Transformer一样进行并行训练的架构，兼得两家之长。',
                    visualisation: '将并列展示两种计算模式。**并行模式（训练时）**：展示其独特的Time-mixing和Channel-mixing块的计算。**循环模式（推理时）**：展示一个类似RNN的状态更新过程。核心动画将通过数学公式的变换，直观地演示这两种模式的等价性。',
                    impact: '让学习者深入理解模型架构设计中的一个重要主题：训练并行性和推理效率的统一。'
                }
            },
            { id: 'retnet', title: 'RetNet (Retention Network)', status: 'planned',
                description: '另一种旨在统一RNN和Transformer的架构，具有出色的性能和清晰的数学形式。',
                details: {
                    purpose: '与RWKV类似，实现训练并行化和推理循环化，但通过一个带有指数衰减的“记忆留存”机制来实现。',
                    visualisation: '核心是可视化其“留存矩阵”，这是一个对角矩阵，其元素是指数衰减的。动画展示在并行模式下，这个矩阵如何作用于注意力计算；在循环模式下，它如何简化为一个简单的状态更新公式。',
                    impact: '提供了另一种实现“两全其美”架构的优雅思路，有助于加深对线性注意力背后数学原理的理解。'
                }
            }
        ]
    },
    {
        category: '5. 稀疏模型 (Sparse Models)',
        description: '通过在每次计算中仅激活模型参数的一小部分，来以更低的计算成本（FLOPs）实现更大的模型容量（总参数量）。',
        items: [
            { id: 'moe', title: 'MoE (Mixture of Experts)', status: 'completed',
                description: '可视化专家混合模型（MoE）中的路由器（Router）如何为每个Token动态地选择一小部分“专家”网络进行处理。',
                details: {
                    purpose: '在保持单个Token计算量不变的情况下，极大地扩展模型的总参数量，从而提升模型容量和性能，实现“用更少的计算撬动更大的模型”。',
                    visualisation: '一个Token向量首先进入一个“路由器”网络。路由器会输出一个权重向量。根据Top-K（通常K=2）原则，权重最高的两个专家（FFN层）会被高亮激活。Token被发送给这两个专家。最后，将两个专家的输出根据路由器的权重进行加权求和。',
                    impact: 'MoE是构建当前最强模型（如Mixtral, GPT-4）的关键技术。可视化能揭开其神秘面纱，让学习者明白它不是一个模型，而是一个“由路由器调度的专家委员会”，从而理解其高效的本质。'
                }
            },
            { id: 'switch_transformer', title: 'Switch Transformer', status: 'planned',
                description: 'MoE的一种简化变体，路由器仅选择Top-1专家。',
                details: {
                    purpose: '进一步简化路由逻辑，降低通信开销和计算复杂性，探索稀疏模型的极限简化形式。',
                    visualisation: '与MoE的可视化非常相似，但路由器的决策是“非黑即白”的Top-1选择，只有一个专家会被激活。这使得计算路径更简单，没有最后的加权求和步骤。',
                    impact: '展示了MoE架构在设计空间中的一种极端选择，有助于理解路由策略对模型性能和效率的影响。'
                }
            }
        ]
    },
    {
        category: '6. 位置编码 (Positional Encoding)',
        description: 'Transformer本身是排列不变的，无法感知顺序。这些技术为模型注入了关于Token位置和顺序的关键信息。',
        items: [
            { id: 'sinusoidal_pe', title: 'Sinusoidal PE (正弦位置编码)', status: 'completed',
                description: '原始Transformer使用的、基于不同频率的正弦和余弦函数的固定位置编码。',
                details: {
                    purpose: '为模型注入绝对位置信息，并且由于其周期性，理论上能泛化到比训练时更长的序列。',
                    visualisation: '展示一个位置编码矩阵，其中每一行代表一个位置，每一列代表一个维度。矩阵会呈现出平滑的、周期性的波纹状图案。动画展示Token嵌入向量与其对应的位置编码行向量相加的过程。',
                    impact: '理解初代Transformer如何解决顺序问题，并直观感受其基于频率的设计如何编码位置。'
                }
            },
            { id: 'rope', title: 'RoPE (Rotary Position Embedding)', status: 'in-progress',
                description: '旋转位置编码，通过复数乘法（等价于2D旋转）来优雅地编码相对位置信息。',
                details: {
                    purpose: '在注意力计算中以一种乘法方式注入相对位置信息，具有优秀的长度外推能力，是当前几乎所有主流开源大模型的首选。',
                    visualisation: '核心是2D复平面上的向量旋转动画。将Q和K向量的特征维度两两配对，看作一系列复数。动画展示位置为m的Q向量和位置为n的K向量，如何根据各自的位置被旋转不同角度。它们的点积结果只与相对位置差(m-n)有关，这个不变性会通过公式推导和动画演示来证明。',
                    impact: 'RoPE是理解现代LLM的“必修课”，但其数学原理较为抽象。可视化能将其复杂的运算翻译成直观的2D向量旋转，极大地降低了理解门槛。'
                }
            },
            { id: 'alibi', title: 'ALiBi (Attention with Linear Biases)', status: 'planned',
                description: '一种简单而高效的位置编码替代方案，直接给注意力分数添加一个与距离成正比的惩罚。',
                details: {
                    purpose: '无需训练、即插即用。通过惩罚远距离注意力，使模型天然地关注局部信息，从而实现强大的长度外推能力。',
                    visualisation: '在注意力分数矩阵（Softmax之前）上，以动画形式叠加一个静态的、线性的惩罚“斜坡”矩阵。这个矩阵沿对角线为0，离对角线越远，惩罚值（负数）越大。',
                    impact: '展示了一种与向量注入完全不同的位置信息编码思路，即直接修改注意力结构，简单又有效。'
                }
            }
        ]
    },
    {
        category: '7. 参数高效微调 (PEFT)',
        description: '在不改动绝大部分预训练模型参数的情况下，实现模型高效适应新任务的关键技术集合。',
        items: [
            { id: 'lora', title: 'LoRA (Low-Rank Adaptation)', status: 'in-progress',
                description: '通过在原始权重矩阵旁添加一个低秩“旁路”（两个小矩阵A和B）来进行微调。',
                details: {
                    purpose: '显著减少可训练参数（通常>90%），大幅降低微调的计算和存储成本，同时约束更新的“秩”以避免灾难性遗忘。',
                    visualisation: '核心动画是展示输入`x`如何兵分两路：一路通过巨大的、灰色的“冻结”权重矩阵`W`；另一路则通过两个小型的、彩色的“可训练”低秩矩阵`A`和`B`。两路输出最终相加。',
                    impact: 'LoRA是当前大模型微调领域最主流的技术。可视化能让学习者一目了然地看到其“大不动、动小”的核心思想。'
                }
            },
            { id: 'qlora', title: 'QLoRA (Quantized LoRA)', status: 'planned',
                description: 'LoRA的内存优化版，将冻结的大模型权重进行4-bit量化。',
                details: {
                    purpose: '在LoRA的基础上，进一步大幅降低微调时的显存占用，使得在单张消费级GPU上微调超大模型成为可能。',
                    visualisation: '在LoRA可视化的基础上，代表`W`的巨大矩阵会用更粗糙、离散的色阶来表示，并标注为“4-bit Quantized”。动画会强调，在计算时，这个4-bit的权重块会被动态地反量化为16-bit与输入相乘。',
                    impact: '让“人人都能微调大模型”的梦想更近一步。可视化清晰展示了量化与PEFT技术的强强联合。'
                }
            },
            { id: 'dora', title: 'DoRA (Weight-Decomposed Low-Rank Adaptation)', status: 'planned',
                description: 'LoRA的改进版，将权重更新分解为“大小”和“方向”两部分进行学习。',
                details: {
                    purpose: '通过更精细的参数化方式，在同等参数量下取得比LoRA更好的微调效果。',
                    visualisation: '在LoRA动画的基础上增加一步：原始权重`W`被分解为一个大小（标量`m`）和一个方向（单位向量`V`）。LoRA的更新`ΔW`现在被用来更新方向`V`，同时还有一个小的向量被用来学习更新大小`m`。',
                    impact: '展示了PEFT领域持续的创新，即便是最主流的技术也在不断被优化和改进。'
                }
            },
            { id: 'adapter', title: 'Adapter Tuning', status: 'completed',
                description: '通过向Transformer层中注入小型的“瓶颈”模块来进行微调。',
                details: {
                    purpose: '在完全不改变原始模型权重的情况下，通过添加少量新参数来实现任务适配。',
                    visualisation: '在一个Transformer Block的示意图中，动画性地在多头注意力和FFN层之后插入一个“降维-激活-升维”的小型网络模块。数据流会流经这个彩色的、可训练的Adapter模块，而主干网络始终保持灰色（冻结）。',
                    impact: 'PEFT领域的开创性工作之一，理解其“模块注入”思想是理解整个领域发展的基础。'
                }
            },
        ]
    },
    {
        category: '8. 后训练与对齐 (Post-Training & Alignment)',
        description: '在预训练和微调之后，通过一系列技术使大模型的输出更安全、更有用、更符合人类的意图和偏好。',
        items: [
            { id: 'sft', title: 'SFT (Supervised Fine-Tuning)', status: 'completed',
                description: '使用高质量的“指令-回答”对来教会模型遵循指令。',
                details: {
                    purpose: '让模型从一个只会“续写”的语言模型（Base Model），转变为一个能够理解并执行人类指令的“助手”模型（Chat Model）。',
                    visualisation: '展示一个“指令-回答”数据对。模型根据指令自回归地生成预测。动画会逐个token地对比模型的预测和标准回答，在出现差异的地方计算损失，并将梯度动画化地反向传播。',
                    impact: 'SFT是模型“学会对话”的第一步，也是所有后续对齐技术的基础。'
                }
            },
            { id: 'rlhf', title: 'RLHF (RL from Human Feedback)', status: 'planned',
                description: '通过人类对模型输出的偏好排序，训练一个奖励模型，再用强化学习优化语言模型。',
                details: {
                    purpose: '让模型学会人类更复杂的、难以用语言描述的偏好，例如“有用性”、“无害性”和“诚实性”。',
                    visualisation: '分为两阶段动画：1) 奖励模型训练：人类对两个回答进行排序，训练一个奖励模型给偏好的回答打高分。2) PPO优化：语言模型生成回答，奖励模型打分，PPO算法根据奖励信号更新语言模型。',
                    impact: '这是使ChatGPT能力产生飞跃的关键技术，是实现复杂人类价值观对齐的里程碑。'
                }
            },
            { id: 'dpo', title: 'DPO (Direct Preference Optimization)', status: 'in-progress',
                description: '一种更简单、更稳定的对齐方法，它绕过了复杂的强化学习流程。',
                details: {
                    purpose: '直接使用偏好数据（chosen vs. rejected）来微调语言模型，通过一个巧妙的损失函数直接优化，避免了RLHF的不稳定性。',
                    visualisation: '并列展示一个指令下的“偏好回答(chosen)”和“拒绝回答(rejected)”。模型会并行计算它生成这两个回答的概率。DPO损失函数的核心动画将展示：它会“奖励”模型提高对chosen回答的概率，同时“惩罚”模型提高对rejected回答的概率。',
                    impact: 'DPO正迅速成为RLHF的有力替代方案，因其更简单、稳定且效果相当，是当前对齐领域的研究热点。'
                }
            },
            { id: 'orpo', title: 'ORPO (Odds Ratio Preference Optimization)', status: 'planned',
                description: 'DPO的最新变体，巧妙地将指令微调（SFT）和偏好对齐（DPO）结合在一个损失函数中。',
                details: {
                    purpose: '解决SFT后模型可能会“过度拟合”标准答案，导致创造性下降的问题。ORPO在对齐偏好的同时，惩罚了模型对“偏好回答”的过高置信度。',
                    visualisation: '在DPO的可视化基础上增加一步。除了比较“偏好”和“拒绝”回答的概率，损失函数还会单独惩罚“偏好”回答的概率，如果它过高的话。动画会显示一个“惩罚项”，当模型对偏好回答的概率超过某个阈值时，该惩罚项会变大。',
                    impact: '展示了对齐技术领域的最新进展，即如何在一个统一的框架下更优雅地平衡“学会”和“学好”两个目标。'
                }
            }
        ]
    },
    // ... 其他12个分类保持完整，这里仅为简洁省略 ...
    {
        category: '9. 归一化层 (Normalization)',
        description: '通过对网络激活值进行重新缩放，来稳定和加速深度神经网络的训练过程，是构建深度模型的“稳定器”。',
        items: [
            { id: 'layernorm', title: 'LayerNorm', status: 'completed',
                description: '在特征维度上对每个样本独立进行归一化，是Transformer的标配。',
                details: {
                    purpose: '解决BatchNorm对批次大小的依赖，保证信息流在深层网络中的稳定性。',
                    visualisation: '在一个`InteractiveVector`上分步执行：1) 计算均值和方差。2) 根据公式进行归一化。3) 与可学习的gamma和beta进行乘加。',
                    impact: '将复杂的归一化公式分解为直观的几何变换（平移和缩放）。'
                }
            },
            { id: 'rmsnorm', title: 'RMSNorm', status: 'completed',
                description: 'LayerNorm的简化版，去掉了中心化（减均值），计算更高效。',
                details: {
                    purpose: '在保持归一化效果的同时，提升计算效率，是Llama等现代模型的选择。',
                    visualisation: '与LayerNorm对比，动画会跳过计算均值和减去均值的步骤，直接计算均方根（RMS）进行缩放。',
                    impact: '直观展示了在保证性能的前提下，对经典模块进行“简化提效”的工程思想。'
                }
            }
        ]
    },
    {
        category: '10. 经典神经网络 (Classic Neural Networks)',
        description: '可视化深度学习领域的经典基石模型，理解它们的结构和核心机制是学习现代架构的基础。',
        items: [
            { id: 'cnn', title: 'CNN (Convolutional Neural Network)', status: 'planned',
                description: '分步动画演示卷积（Convolution）和池化（Pooling）操作。',
                details: {
                    purpose: '通过局部感受野和参数共享，高效地从图像等网格状数据中提取特征。',
                    visualisation: '在一个输入特征图上，一个代表卷积核的半透明矩阵会滑动扫描，高亮感受野并动画展示乘加过程，在输出图上生成一个像素。',
                    impact: '将抽象的卷积运算分解为具体、可重复的“滑动窗口”计算，彻底揭示CNN提取视觉特征的原理。'
                }

            },
            { id: 'lstm', title: 'LSTM (Long Short-Term Memory)', status: 'planned',
                description: '可视化长短期记忆网络如何通过“门控”机制处理序列数据，解决长程依赖问题。',
                details: {
                    purpose: '通过内部的“细胞状态”和“遗忘门、输入门、输出门”来选择性地记忆、更新和输出信息。',
                    visualisation: '一个展开的时间步视图。在单元内部，动画会清晰展示三个门如何通过Sigmoid/Tanh计算，并分别作用于细胞状态和隐藏状态。门的“开”和“关”会用阀门或开关的图标来形象表示。',
                    impact: '彻底揭示LSTM如何实现长期记忆，将抽象的门控机制翻译成直观的“信息阀门”控制。'
                }
            }
        ]
    },
    {
        category: '11. 架构模块 (Architecture Modules)',
        description: '将基础组件组合成更大、可复用的结构单元，如ResNet中的残差块或ViT中的图像切片模块。',
        items: [
            { id: 'residual_block', title: 'ResNet (Residual Block)', status: 'planned',
                description: '可视化残差网络的核心思想——残差连接（或跳跃连接）。',
                details: {
                    purpose: '通过允许信息“跳过”一层或多层，直接流向更深层，极大地缓解了梯度消失问题，使得训练千层网络成为可能。',
                    visualisation: '数据流`x`会分裂成两条路径。一条流经主路（卷积层），另一条直接绕过（旁路）。在终点，主路的输出`F(x)`和旁路的`x`会通过一个动画化的加法操作汇合。',
                    impact: '这是一个革命性的思想。可视化能让学习者清晰地看到这条“信息高速公路”的存在，直观理解模型为何能构建得如此之深。'
                }
            },
            { id: 'vision_transformer_module', title: 'ViT Module (Patching & Embedding)', status: 'planned',
                description: '可视化视觉Transformer如何将图像处理为一系列“词块”（Patches）。',
                details: {
                    purpose: '将Transformer在NLP领域的成功迁移到CV，通过全局注意力替代CNN的局部感受野。',
                    visualisation: '动画的第一步是展示一张输入图像被分割成一个个网格（Patches）。然后，每个Patch被“压平”成一个向量，并送入Transformer Encoder。',
                    impact: '清晰地展示了“万物皆可序列化”的思想，让学习者明白Transformer的普适性。'
                }
            }
        ]
    },
    {
        category: '12. 量化与压缩 (Quantization & Compression)',
        description: '在模型训练完成后，通过量化、剪枝等技术压缩模型大小、加速推理，使其更易于部署。',
        items: [
            { id: 'quantization', title: 'Quantization (INT8/INT4)', status: 'planned',
                description: '可视化模型权重从高精度浮点数（FP32）转换为低精度整数（INT8/4）。',
                details: {
                    purpose: '显著减小模型体积和内存占用，并利用硬件对整数运算的加速来提升推理速度。',
                    visualisation: '动画展示一个FP32的权重值（如0.123456）如何通过缩放因子和零点被映射到一个INT8值（如58）。',
                    impact: '量化是让大模型能够在消费级硬件上运行的关键技术。'
                }
            },
            { id: 'gptq', title: 'GPTQ', status: 'planned',
                description: '一种先进的事后量化（PTQ）方法，通过逐列量化和考虑海森矩阵来获得更高的精度。',
                details: {
                    purpose: '在无需重新训练的情况下，实现接近无损的4-bit量化，效果远超朴素的舍入量化。',
                    visualisation: '对比朴素量化，GPTQ的动画会展示它如何逐列地、迭代地更新未量化的权重，以补偿当前列量化带来的误差。',
                    impact: '展示了量化技术领域的深度和复杂性，不仅仅是简单的数值类型转换。'
                }
            },
            { id: 'pruning', title: 'Pruning (Unstructured)', status: 'planned',
                description: '可视化模型剪枝，即移除模型中数值接近于零的不重要权重。',
                details: {
                    purpose: '在保持性能基本不变的前提下，减小模型参数量和计算量。',
                    visualisation: '在一个权重矩阵上，动画展示数值小的权重（通常由颜色深浅表示）被“剪掉”并置为零的过程，形成一个稀疏矩阵。',
                    impact: '一种经典的压缩技术，直观展示了模型参数的“冗余性”。'
                }
            }
        ]
    },
    {
        category: '13. 可视化工具 (Visualization Tools)',
        description: '一系列用于检查、调试和理解模型内部状态与行为的元可视化组件。它们是这个项目用来“看见”AI内部世界的“显微镜”和“示波器”。',
        items: [
            { id: 'attention_heatmap', title: 'AttentionHeatmap', status: 'completed',
                description: '以热力图的形式可视化注意力权重矩阵，展示模型对词的关注度分布。',
                details: {
                    purpose: '提供一种直观的方式来解释Transformer的决策过程，看看模型到底“在看哪里”。',
                    visualisation: '一个N×N的交互式热力图。用户可以切换不同的注意力头来观察它们学到的不同关注模式（如关注下一个词、关注标点等）。',
                    impact: '最经典、最直观的Transformer可解释性工具，是分析模型行为的有力武器。'
                }
            },
            { id: 'computation_graph', title: 'ComputationGraph', status: 'planned',
                description: '一个终极的、可交互的计算图，用户可以使用所有基础组件自由搭建、运行和检查自定义的模型架构。',
                details: {
                    purpose: '提供一个“所见即所得”的AI模型实验平台，让用户不仅能理解现有模型，更能创造和调试自己的模型变体。',
                    visualisation: '一个基于`DraggableNode`和`AnimatedFlow`构建的画布。用户可以从组件库拖拽组件（如`MHA`, `FFN`）到画布上，连接它们，然后点击“运行”来观察数据流动。',
                    impact: '这是本项目的终极目标。它将从一个“模型解释器”升华为一个“模型创造器”，为AI教育和研究提供一个前所未有的、完全可视化的交互式沙盒环境。'
                }
            }
        ]
    }
];

const ComponentItemCard: React.FC<{ item: ComponentItem }> = ({ item }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const statusText = {
        completed: '已完成',
        'in-progress': '进行中',
        planned: '计划中',
    };
    const hasDetails = item.details.purpose || (item.details.nitpicks && item.details.nitpicks.length > 0);

    return (
        <div className={`component-card status-${item.status.replace('-', '')}`}>
            <div className="card-header" onClick={() => hasDetails && setIsExpanded(!isExpanded)}>
                <div className="card-title-status">
                    <h4 className="card-title">{item.title}</h4>
                    <span className={`status-badge ${item.status}`}>{statusText[item.status]}</span>
                </div>
                {hasDetails && (
                    <button className={`expand-toggle ${isExpanded ? 'expanded' : ''}`}>
                        <span>▼</span>
                    </button>
                )}
            </div>
            <div className="card-content">
                <p className="component-description">{item.description}</p>
            </div>
            {hasDetails && (
                <div className={`card-details ${isExpanded ? 'expanded' : ''}`}>
                    <div className="details-section">
                        <h4>🎯 目的 (Purpose)</h4>
                        <p>{item.details.purpose}</p>
                    </div>

                    <div className="details-section">
                        <h4>🚀 可视化构想 (Visualisation)</h4>
                        <p>{item.details.visualisation}</p>
                    </div>

                    <div className="details-section">
                        <h4>💡 对初学者价值 (Impact)</h4>
                        <p>{item.details.impact}</p>
                    </div>

                    {item.details.nitpicks && item.details.nitpicks.length > 0 && (
                        <div className="details-section">
                            <h4>🔍 吹毛求疵 (优化方向)</h4>
                            <ul className="details-section nitpick-list">
                                {item.details.nitpicks.map((note, index) => (
                                    <li key={index} dangerouslySetInnerHTML={{ __html: note.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
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
        setTimeout(() => setOverallProgress(newProgress), 100);
    }, []);

    return (
        <div className="page-scroll-container">
            <div className="directory-page-container">
                <div className="directory-header">
                    <h2>组件蓝图与开发计划</h2>
                    <p>
                        这是一个动态的开发文档，记录了所有组件的开发状态以及我们“吹毛求疵”出的潜在优化方向。我们的目标是构建一个能够让**只有深度学习和线性代数基础的读者也能清晰理解**的AI可视化平台。
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