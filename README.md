# AI 深度探索专题 (AI Deep Dive Series)

![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)
![Framework: React](https://img.shields.io/badge/Framework-React-blue.svg)
![Language: TypeScript](https://img.shields.io/badge/Language-TypeScript-blueviolet.svg)

**一个旨在通过交互式可视化和深度文章，剖析前沿AI技术的知识平台。**

欢迎来到 AI 深度探索专题！这是一个交互式的 Web 应用，旨在以前所未有的深度和清晰度，可视化并揭示前沿 AI 模型内部的工作原理。无论您是正在学习AI的学生，还是希望更直观地理解模型内部数据流的研究人员，这个平台都将为您提供强大的支持。

---

## 🚀 当前专题

本平台目前包含以下深度探索专题：

### 1. Transformer 深度探索器
一个完全交互式的可视化工具，带您深入探索Transformer模型内部的数据流动、矩阵变换和数学原理。从文本分词到最终的概率输出，点击任何数字，追溯它的计算来源。

### 2. 多头注意力变体：从MHA到MLA
通过并列的数值模拟和理论推导，深入探讨注意力机制从Multi-Head(MHA)、Multi-Query(MQA)、Grouped-Query(GQA)到Multi-head Latent(MLA)的演进过程，直观理解其设计理念以及对KV Cache效率和性能的权衡。

## ✨ 核心特性

- **🌀 端到端数据流可视化**: 从最初的文本输入到最终的概率输出，跟踪数据在复杂模型架构中每一步的流动和变换。
- **🔗 全链路溯源与计算分解**: 点击任何一个计算结果单元格，即可高亮其所有计算来源，并弹出浮窗展示详细、分步的数学计算过程。告别黑盒，理解每一个数字的由来。
- **📖 数值与原理联动学习**: 左侧是具体的数值和矩阵变换，右侧是对应的数学公式和原理解释。点击任何一方的组件，另一方都会同步滚动并高亮，建立直观的联系。
- **⚙️ 动态参数调整**: 通过控制面板实时调整模型的关键维度 (如 `d_model`, `n_heads`, `n_layers` 等)，并立即在界面上看到结构和数据的变化，深化对模型参数影响的理解。
- **🧩 模块化专题架构**: 基于React构建，代码结构清晰，每个专题都是一个独立的模块，便于未来扩展以支持更多模型架构或可视化功能。

## 🛠️ 技术栈

本项目为一个纯前端应用，所有计算都在浏览器端完成，无需后端服务。

- **核心框架**:
  - [React](https://react.dev/) (使用 Create React App 搭建)
  - [TypeScript](https://www.typescriptlang.org/)
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
git clone <your-repository-url>
cd <repository-name>
```

### 2. 安装依赖

本项目使用 `pnpm` 进行前端依赖管理。

```bash
# 在项目根目录安装所有依赖
pnpm install
```

### 3. 运行项目

一键启动前端开发服务器。

```bash
pnpm start
```

服务启动后，应用将在 `http://localhost:3000` 上运行。现在，您可以在浏览器中打开该地址查看应用。

## 📁 项目结构

项目采用模块化的专题结构，便于维护和扩展。

```
src
├── components/         # 全局共享的通用组件 (如 MarkdownRenderer)
├── hooks/              # 全局共享的自定义 Hooks (如 useSplitPane)
├── pages/              # 顶层页面组件 (HomePage, TopicPage)
├── topics/             # 核心目录：所有专题模块存放于此
│   ├── index.ts        # 专题注册中心，在此处添加新专题
│   ├── transformer-explorer/ # "Transformer 深度探索器" 专题
│   │   ├── components/     # 该专题独有的组件
│   │   ├── hooks/          # 该专题独有的 Hooks
│   │   ├── lib/            # 该专题的核心计算逻辑
│   │   ├── config/         # 专题配置文件
│   │   ├── TransformerExplorerTopic.tsx  # 专题主入口组件
│   │   └── TransformerExplorerTopic.css  # 专题样式
│   └── attention-variants/ # "多头注意力变体" 专题
│       ├── components/
│       ├── hooks/
│       ├── lib/
│       ├── AttentionVariantsTopic.tsx
│       └── AttentionVariantsTopic.css
├── App.tsx             # 应用主组件和路由
└── index.tsx           # 应用入口
```

## 🤝 如何贡献

我们欢迎任何形式的贡献！无论是修复Bug、优化代码，还是添加全新的可视化专题。

1.  **Fork** 本仓库
2.  创建一个新的分支 (`git checkout -b feature/your-amazing-feature`)
3.  进行修改并提交 (`git commit -m 'Add some amazing feature'`)
4.  将您的分支推送到 Fork 后的仓库 (`git push origin feature/your-amazing-feature`)
5.  创建一个 **Pull Request**

特别是，要添加一个新专题，您只需：
1.  在 `src/topics/`下创建一个新的专题文件夹。
2.  在 `src/topics/index.ts` 中注册您的新专题。

## 📜 开源许可

本项目采用 [MIT 许可证](LICENSE).

## 🧑‍💻 参与人员

- @我自己
- @Gemini2.5Pro From AI Sstudio
