# Transformer 深度探索器 (Transformer Deep Explorer)

欢迎来到 Transformer 深度探索器！这是一个交互式的 Web 应用，旨在以前所未有的深度和清晰度，可视化并揭示 Transformer 模型内部的工作原理。

无论您是正在学习 Transformer 的学生，还是希望更直观地理解模型内部数据流的研究人员，这个工具都将为您提供强大的支持。

## ✨ 核心特性

- **端到端数据流可视化**: 从最初的文本输入到最终的概率输出，跟踪数据在编码器-解码器架构中每一步的流动和变换。
- **交互式计算分解**: 点击任何一个计算结果单元格（无论是矩阵乘法、层归一化还是Softmax），即可查看其详细、分步的数学计算过程。告别黑盒，理解每一个数字的由来。
- **数据与数学原理联动**: 左侧是具体的数值和矩阵变换，右侧是对应的数学公式和原理解释。点击任何一方的组件，另一方都会同步高亮，建立直观的联系。
- **动态参数调整**: 通过控制面板实时调整模型的关键维度（如 `d_model`, `h`, `n_layers`），并立即在界面上看到结构和数据的变化。
- **后端驱动的分词**: 集成 Python 后端，利用强大的 `tokenizers` 库实现如 BPE 等真实的亚词分词算法，让数据处理更贴近实际应用。
- **模块化与可扩展**: 基于 React 和 FastAPI 构建，代码结构清晰，便于未来扩展以支持更多模型架构或可视化功能。

## 🛠️ 技术栈

- **前端**:

  - [React](https://react.dev/) (使用 Create React App 搭建)
  - [TypeScript](https://www.typescriptlang.org/)
  - [KaTeX](https://katex.org/) 用于优美的数学公式渲染

- **后端**:

  - [Python 3.9+](https://www.python.org/)
  - [FastAPI](https://fastapi.tiangolo.com/) 用于构建高性能的 API
  - [Uvicorn](https://www.uvicorn.org/) ASGI 服务器
  - [tokenizers](https://github.com/huggingface/tokenizers) (Hugging Face) 用于专业级的分词处理

- **开发工具**:

  - [pnpm](https://pnpm.io/) 用于前端包管理
  - [concurrently](https://github.com/open-cli-tools/concurrently) 用于同时运行前后端服务


## 🚀 本地开发设置

按照以下步骤在您的本地机器上运行此项目。

### 1. 克隆仓库

```bash
git clone <your-repository-url>
cd <your-repository-name>
```

### 2. 前端环境设置

本项目使用 `pnpm` 进行前端依赖管理。

```bash
# 安装 pnpm (如果尚未安装)
npm install -g pnpm

# 安装前端依赖
pnpm install
```

### 3. 后端环境设置

后端服务基于 Python。强烈建议使用虚拟环境。

```bash
# 1. 在项目根目录，为后端创建虚拟环境
python -m venv backend/.venv

# 2. 激活虚拟环境
#    Windows:
backend\.venv\Scripts\activate
#    macOS / Linux:
#    source backend/.venv/bin/activate

# 激活成功后，您的终端提示符前应出现 (.venv) 标记。

# 3. 在激活的环境中，安装 Python 依赖
pip install "fastapi[all]" tokenizers torch
```

### 4. 运行项目

我们使用 `concurrently` 来一键启动前端和后端两个开发服务器。

在**项目根目录**下，运行以下命令：

```bash
pnpm start
```

这将会：

- 在 `http://localhost:3000` 启动 React 前端应用。
- 在 `http://127.0.0.1:8000` 启动 FastAPI 后端服务。

现在，您可以在浏览器中打开 `http://localhost:3000` 查看应用。前端的 API 请求会自动代理到后端服务，无需额外配置。

### 5. 验证后端 (可选)

要验证后端服务是否独立正常工作，您可以访问
  
`http://127.0.0.1:8000/docs`

您应该能看到 FastAPI 自动生成的交互式 API 文档页面。

## 📜 开源许可

本项目采用 [MIT 许可证](LICENSE)。



### 参与人员

@我自己

@Gemini2.5Pro From AI Sstudio