# AI 深度探索专题 (AI Deep Dive Series)

![Framework: React](https://img.shields.io/badge/Framework-React-61DAFB?style=for-the-badge&logo=react)
![Language: TypeScript](https://img.shields.io/badge/Language-TypeScript-3178C6?style=for-the-badge&logo=typescript)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)

**一个旨在通过交互式可视化和深度文章，剖析前沿AI技术的知识平台。**

欢迎来到 AI 深度探索专题！这是一个交互式的 Web 应用，旨在以前所未有的深度和清晰度，可视化并揭示前沿 AI 模型内部的工作原理。无论您是正在学习AI的学生、希望更直观理解模型内部数据流的研究人员，还是寻求高效调试工具的工程师，这个平台都将为您提供强大的支持。我们告别黑盒，让每一个数字的来龙去脉都清晰可见。

---

## ✨ 核心特性

- **🌀 端到端数据流可视化**: 从最初的文本输入到最终的概率输出，跟踪数据在复杂模型架构中每一步的流动和变换。直观地观察矩阵的形状变化、残差连接的合并以及归一化的效果。

- **🔗 全链路溯源与计算分解**: 本平台最具特色的功能。点击任何一个计算结果单元格，系统会立即高亮其所有计算来源（包括行、列或单个单元格），并弹出一个浮窗。浮窗内部分步展示了该数字的详细数学计算过程，无论是矩阵乘法（点积）、Softmax 还是逐元素加法，都一目了然。

- **📖 数值与原理联动学习**: 独特的双栏布局将具体的数值模拟与抽象的数学原理紧密结合。左侧是可交互的矩阵和向量，右侧是对应的数学公式和原理解释。当您点击任一侧的组件时，另一侧会自动滚动并高亮相应部分，建立起理论与实践之间直观的桥梁。

- **⚙️ 动态参数调整**: 通过一个可拖拽、可缩放的控制面板，您可以实时调整模型的关键超参数（如 `d_model`, `n_heads`, `n_layers` 等）。所有可视化界面会立即响应这些变化，让您能够动态探索不同参数对模型结构和数据流的影响，从而深化理解。

- **🧩 模块化专题架构**: 基于 React 构建，代码结构清晰，每个专题都是一个独立的模块。这种设计使得未来可以轻松地扩展新专题，以支持更多模型架构（如 RNN、CNN、Diffusion Models）或新的可视化功能。

## 🚀 当前专题

本平台目前包含以下深度探索专题：

### 1. Transformer 深度探索器
一个完全交互式的可视化工具，带您深入探索 Transformer 模型（Encoder-Decoder 架构）内部的完整数据流动、矩阵变换和数学原理。从文本分词、词嵌入、位置编码，到多层编码器和解码器中的自注意力、交叉注意力、前馈网络，再到最终的概率输出和文本生成，每一步都清晰可见。

### 2. 多头注意力变体：从MHA到MLA
通过并列的数值模拟和理论推导，深入探讨注意力机制从 Multi-Head Attention (MHA)、Multi-Query Attention (MQA)、Grouped-Query Attention (GQA) 到最新的 Multi-head Latent Attention (MLA) 的演进过程。此专题旨在直观地解释这些变体的设计理念、数学实现，以及它们在性能和推理效率（特别是 KV Cache）之间的关键权衡。

## 🛠️ 技术栈

本项目为一个纯前端应用，所有计算都在浏览器端实时完成，无需后端服务，确保了快速响应和数据隐私。

- **核心框架**:
  - [React](https://react.dev/) (使用 Create React App 搭建)
  - [TypeScript](https://www.typescriptlang.org/)
- **路由管理**:
  - [React Router](https://reactrouter.com/)
- **数学渲染**:
  - [KaTeX](https://katex.org/) 用于优美、高性能的数学公式渲染
- **开发与构建**:
  - [pnpm](https://pnpm.io/) 用于高效的前端包管理

## 🚀 本地开发设置

按照以下步骤在您的本地机器上快速运行此项目。

### 先决条件

- [Node.js](https://nodejs.org/) (建议使用 v18 或更高版本)
- [pnpm](https://pnpm.io/installation)

### 1. 克隆仓库

```bash
git clone https://github.com/your-username/ai-deep-dive.git
cd ai-deep-dive
```

### 2. 安装依赖

本项目使用 `pnpm` 进行前端依赖管理，它能提供更快的安装速度和更高效的磁盘空间利用率。

```bash
# 在项目根目录安装所有依赖
pnpm install
```

### 3. 运行项目

一键启动前端开发服务器。

```bash
pnpm start
```

服务启动后，应用将在 `http://localhost:3000` 上运行。现在，您可以在浏览器中打开该地址查看应用。每次保存代码修改后，页面都会自动热重载。

## 📁 项目结构

项目采用模块化的专题结构，旨在实现高内聚、低耦合，便于长期维护和多人协作。

```
src
├── components/         # 全局共享的通用组件 (如 MarkdownRenderer, Visualizers)
├── hooks/              # 全局共享的自定义 Hooks (如 useSplitPane, useDraggableAndResizable)
├── pages/              # 顶层页面组件 (HomePage, TopicPage)
├── topics/             # 核心目录：所有专题模块存放于此
│   ├── index.ts        # 专题注册中心，在此处添加新专题
│   ├── transformer-explorer/ # "Transformer 深度探索器" 专题
│   │   ├── components/     # 该专题独有的组件
│   │   ├── hooks/          # 该专题独有的 Hooks
│   │   ├── lib/            # 该专题的核心计算逻辑 (transformer.ts, tokenizer.ts)
│   │   ├── config/         # 专题配置文件 (matrixNames.ts, symbolMapping.ts)
│   │   ├── TransformerExplorerTopic.tsx  # 专题主入口组件
│   │   └── TransformerExplorerTopic.css  # 专题样式
│   └── attention-variants/ # "多头注意力变体" 专题
│       ├── components/
│       ├── hooks/
│       ├── lib/
│       ├── types.ts
│       ├── AttentionVariantsTopic.tsx
│       └── AttentionVariantsTopic.css
├── App.tsx             # 应用主组件和路由
└── index.tsx           # 应用入口
```

## 🤝 如何贡献

我们热烈欢迎任何形式的贡献！无论是修复拼写错误、优化代码性能，还是添加一个全新的可视化专题。

1.  **Fork** 本仓库到您的 GitHub 账户。
2.  创建一个新的分支 (`git checkout -b feature/your-amazing-feature`)。
3.  进行您的修改并提交 (`git commit -m 'Add some amazing feature'`)。
4.  将您的分支推送到您 Fork 的仓库 (`git push origin feature/your-amazing-feature`)。
5.  在原始仓库页面创建一个 **Pull Request**，并详细描述您的变更。

特别是，要**添加一个新专题**，您只需遵循以下简单步骤：
1.  在 `src/topics/` 目录下创建一个新的专题文件夹，仿照现有专题的结构。
2.  在 `src/topics/index.ts` 文件中导入并注册您的新专题组件。

## 📜 开源许可

本项目采用 [MIT 许可证](LICENSE)。这意味着您可以自由地使用、复制、修改、合并、发布、分发、再许可和/或销售本软件的副本。

## 🧑‍💻 参与人员

- @我自己
- @Gemini2.5Pro From AI Studio