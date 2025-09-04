# generate_project.py
import os
import textwrap

# A dictionary where keys are file paths and values are the content of the files.
# Using textwrap.dedent to remove leading whitespace from multiline strings.
project_files = {
    "public/index.html": textwrap.dedent("""\
    <!DOCTYPE html>
    <html lang="zh-CN">
      <head>
        <meta charset="utf-8" />
        <link rel="icon" href="%PUBLIC_URL%/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#000000" />
        <meta
          name="description"
          content="Web site created using create-react-app"
        />
        <title>终极 Transformer 深度探索器</title>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css" integrity="sha384-n8MVd4RsNIU0KOVEMVIUpuyN_Y5KEWadMqs_c2CYDxGK9eSBvjaQRDsvwuCrznvR" crossorigin="anonymous">
      </head>
      <body>
        <noscript>You need to enable JavaScript to run this app.</noscript>
        <div id="root"></div>
      </body>
    </html>
    """),

    "public/favicon.ico": """iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACJElEQVR42nWSP0xcURDGf+/dxQu1EBCDDUIYBQuKIGiQYVAkQkLBgI2VdYyklV2wYGNhYyM2thY2NgT5BwQCKshQIVlYxAKxEBIEEiSEBAJEw967e88bC9wNvHnzm3nz/2+GEAB+d0xIeD45pDk/P8kLwSMEgNuS87OTk5OTk/+31Rz+s25v7/3d88vT01OhcAhCUDR0mQ6f7y9eX53fXDs62NlZm5ub/3ZlZW1s3t/b2d07Mj09/XJ+fnFxcXFxcfE/BH8AhkMhCAIRAY8xNoPDYTCZTCgUCo1GIxKJZPv7h/v7h1+vX+3v71++fPnu3Jz5/OULFy+f/vbt25s3b46NjX1+fnFxcfE/TBNEMfFWsVismUwmEolEKhVKpVIoFErB4XA4DAaDdbNZrFYrFArFZrNFo9FkMllkMvnFixe/fv36/PlzT09Pz8/P5+bm4uPj4+Pj4+Li4m8mP260C4WizWazWCwWi8VisVgsFovFYrFYLBaLxY2NDY/Ph8PhcLlcLpfL5bLZbDaPx7OysvL+/XvPz8/Ly8v3799/fX394uLi8+fPHz58+ODg4Ojo6Ozs7M3NTUxMvHnz5s2bNz8/Pz09PbW1tbe3t6dOnfrixYvv379vbW29fv26s7NzYmLi4uLi/zGb2+12uVwul8vlcv1+v9/v9/v9fr/f7/f7/f43EASCTCbTabTBYDAajQYCAf/r9Xq9Xv8/AB5sHwDD0L+zAAAAAElFTkSuQmCC""",

    "package.json": textwrap.dedent("""\
    {
      "name": "transformer-visualizer-pro",
      "version": "0.1.0",
      "private": true,
      "dependencies": {
        "@testing-library/jest-dom": "^5.17.0",
        "@testing-library/react": "^13.4.0",
        "@testing-library/user-event": "^13.5.0",
        "@types/jest": "^27.5.2",
        "@types/node": "^16.18.96",
        "@types/react": "^18.2.75",
        "@types/react-dom": "^18.2.24",
        "katex": "^0.16.9",
        "react": "^18.2.0",
        "react-dom": "^18.2.0",
        "react-katex": "^3.0.1",
        "react-scripts": "5.0.1",
        "typescript": "^4.9.5",
        "web-vitals": "^2.1.4"
      },
      "scripts": {
        "start": "react-scripts start",
        "build": "react-scripts build",
        "test": "react-scripts test",
        "eject": "react-scripts eject"
      },
      "eslintConfig": {
        "extends": [
          "react-app",
          "react-app/jest"
        ]
      },
      "browserslist": {
        "production": [
          ">0.2%",
          "not dead",
          "not op_mini all"
        ],
        "development": [
          "last 1 chrome version",
          "last 1 firefox version",
          "last 1 safari version"
        ]
      },
      "devDependencies": {
        "@types/katex": "^0.16.7",
        "@types/react-katex": "^3.0.4"
      }
    }
    """),

    "tsconfig.json": textwrap.dedent("""\
    {
      "compilerOptions": {
        "target": "es5",
        "lib": [
          "dom",
          "dom.iterable",
          "esnext"
        ],
        "allowJs": true,
        "skipLibCheck": true,
        "esModuleInterop": true,
        "allowSyntheticDefaultImports": true,
        "strict": true,
        "forceConsistentCasingInFileNames": true,
        "noFallthroughCasesInSwitch": true,
        "module": "esnext",
        "moduleResolution": "node",
        "resolveJsonModule": true,
        "isolatedModules": true,
        "noEmit": true,
        "jsx": "react-jsx"
      },
      "include": [
        "src"
      ]
    }
    """),

    ".gitignore": textwrap.dedent("""\
    # See https://help.github.com/articles/ignoring-files/ for more about ignoring files.
    # dependencies
    /node_modules
    /.pnp
    .pnp.js
    # testing
    /coverage
    # production
    /build
    # misc
    .DS_Store
    .env.local
    .env.development.local
    .env.test.local
    .env.production.local
    npm-debug.log*
    yarn-debug.log*
    yarn-error.log*
    """),

    "src/index.tsx": textwrap.dedent("""\
    import React from 'react';
    import ReactDOM from 'react-dom/client';
    import App from './App';
    import './App.css';

    const root = ReactDOM.createRoot(
      document.getElementById('root') as HTMLElement
    );
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    """),

    "src/types.ts": textwrap.dedent("""\
    export type Matrix = number[][];
    export type Vector = number[];

    export interface ElementIdentifier {
      name: string; // e.g., "encoder.0.mha.h0.Q"
      row: number;
      col: number;
    }

    export interface HighlightSource extends ElementIdentifier {
      highlightRow?: boolean;
      highlightCol?: boolean;
    }

    export interface HighlightState {
      activeComponent: string | null; // e.g., "encoder.0.mha"
      target: ElementIdentifier | null;
      sources: HighlightSource[];
    }

    export interface AttentionHeadData {
      Wq: Matrix;
      Wk: Matrix;
      Wv: Matrix;
      Q: Matrix;
      K: Matrix;
      V: Matrix;
      Scores: Matrix;
      ScaledScores: Matrix;
      AttentionWeights: Matrix;
      HeadOutput: Matrix;
    }

    export interface MultiHeadAttentionData {
        heads: AttentionHeadData[];
        Wo: Matrix;
        Output: Matrix;
    }

    export interface FFNData {
        W1: Matrix;
        b1: Vector;
        Intermediate: Matrix;
        Activated: Matrix;
        W2: Matrix;
        b2: Vector;
        Output: Matrix;
    }

    export interface EncoderLayerData {
        mha: MultiHeadAttentionData;
        add_norm_1_in_residual: Matrix;
        add_norm_1_in_sublayer: Matrix;
        add_norm_1_out: Matrix;
        ffn: FFNData;
        add_norm_2_in_residual: Matrix;
        add_norm_2_in_sublayer: Matrix;
        add_norm_2_out: Matrix;
    }

    export interface TransformerData {
        inputEmbeddings: Matrix;
        posEncodings: Matrix;
        encoderInput: Matrix;
        encoderLayers: EncoderLayerData[];
    }
    """),

    "src/App.css": textwrap.dedent("""\
    :root {
      --highlight-color: #c0392b;
      --highlight-bg: rgba(192, 57, 43, 0.08);
      --border-color: #dcdfe6;
      --bg-color: #f5f7fa;
      --text-color: #303133;
      --arrow-color: #888;
      --component-bg: #ffffff;
      --component-header-bg: #f8f9fa;
      --residual-bg: #f0f4c3;
      --residual-border: #dce775;

      /* Highlighting */
      --highlight-target-bg: #e63946;
      --highlight-target-color: #ffffff;
      --highlight-source-bg: #1d3557;
      --highlight-source-color: #f1faee;
      --highlight-formula-bg: #fefae0;
      --highlight-formula-border: #fca311;
      --highlight-vector-bg: rgba(69, 123, 157, 0.2);
    }

    html {
      scroll-behavior: smooth;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
      background-color: var(--bg-color);
      color: var(--text-color);
      margin: 0;
      font-size: 15px;
    }

    #root {
        height: 100vh;
        width: 100vw;
        overflow: hidden;
    }

    .app-container {
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    h1 {
      text-align: center;
      color: #000;
      margin: 0;
      padding: 20px 0;
      background-color: var(--component-bg);
      border-bottom: 1px solid var(--border-color);
      flex-shrink: 0; /* Prevent title from shrinking */
    }

    .main-layout {
      display: flex;
      gap: 20px;
      flex-grow: 1; /* Allow layout to fill remaining space */
      overflow: hidden;
      padding: 20px;
      min-height: 0; /* Important for flex children scrolling */
    }

    .column {
      flex: 1;
      background: var(--component-bg);
      border-radius: 12px;
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
      overflow-y: auto; /* THIS IS THE KEY FOR SCROLLING */
      min-height: 0;
    }

    .column-content {
      padding: 20px;
    }

    .column.left-column {
      flex: 1.4;
    }

    .column h2 {
      font-size: 1.6em;
      margin: -20px -20px 20px -20px;
      padding: 20px 20px 15px 20px;
      text-align: center;
      color: #000;
      position: sticky;
      top: -21px; /* Adjust to hide top border */
      background: inherit;
      z-index: 10;
      border-bottom: 1px solid var(--border-color);
      border-radius: 12px 12px 0 0;
    }

    /* --- Left Column: Viz --- */
    .diagram-component {
      border: 2px solid var(--border-color);
      border-radius: 10px;
      margin-bottom: 15px;
      background-color: #fdfdfd;
      transition: all 0.3s ease;
    }

    .component-header {
      background-color: var(--component-header-bg);
      padding: 8px 15px;
      font-weight: bold;
      font-size: 1.1em;
      border-bottom: 1px solid var(--border-color);
      border-radius: 8px 8px 0 0;
    }
    .component-body {
      padding: 15px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 15px;
    }

    .arrow-down {
      width: 100%;
      text-align: center;
      font-size: 24px;
      color: var(--arrow-color);
      margin: 5px 0;
    }

    /* --- Matrix Styles --- */
    .matrix-wrapper {
        position: relative;
    }
    .matrix-container {
      display: inline-block;
      border: 1px solid #ccc;
      padding: 5px;
      border-radius: 4px;
      background-color: #f9f9f9;
      position: relative;
    }
    .matrix-grid {
      display: grid;
      gap: 3px;
    }

    .matrix-element {
      width: 45px;
      height: 25px;
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: #fff;
      border: 1px solid #e0e0e0;
      border-radius: 2px;
      font-family: monospace;
      font-size: 0.8em;
      cursor: pointer;
      transition: all 0.2s ease-in-out;
      position: relative;
      z-index: 2;
    }

    .matrix-element:hover {
      transform: scale(1.1);
      border-color: #007bff;
      box-shadow: 0 0 5px rgba(0,123,255,0.5);
      z-index: 5;
    }

    .matrix-element.source {
      background-color: var(--highlight-source-bg);
      color: var(--highlight-source-color);
      border-color: var(--highlight-source-bg);
    }
    .matrix-element.target {
      background-color: var(--highlight-target-bg);
      color: var(--highlight-target-color);
      border-color: var(--highlight-target-bg);
    }

    .vector-highlight-overlay {
        position: absolute;
        background-color: var(--highlight-vector-bg);
        border: 1px solid var(--highlight-source-bg);
        border-radius: 3px;
        z-index: 1;
        pointer-events: none;
        transition: all 0.2s ease;
    }

    .matrix-label {
      text-align: center;
      font-weight: bold;
      margin-top: 8px;
      font-family: monospace;
      font-size: 1.1em;
    }

    .op-symbol {
        font-size: 2em;
        font-weight: bold;
        color: #909399;
    }

    /* --- Right Column: Explanation --- */
    .math-block {
      margin-bottom: 25px;
      padding: 20px;
      border: 2px solid var(--border-color);
      border-radius: 12px;
      background: #fff;
      transition: all 0.3s ease;
    }
    .math-block.active {
      border-color: var(--highlight-formula-border) !important;
      box-shadow: 0 0 30px var(--highlight-bg) !important;
      transform: scale(1.01);
      background-color: var(--highlight-formula-bg);
    }
    .math-block h3 {
      margin: -20px -20px 15px -20px;
      padding: 15px 20px;
      font-size: 1.25em;
      color: #000;
      border-bottom: 1px solid #eee;
      border-radius: 12px 12px 0 0;
      background-color: var(--component-header-bg);
    }
    .math-block p, .math-block li, .math-block h5 {
        line-height: 1.7;
        margin: 1em 0;
    }
    .math-block h5 {
        font-size: 1.1em;
    }
    .math-block code {
       background-color: #e9ecef;
       padding: 2px 5px;
       border-radius: 4px;
       font-family: monospace;
    }

    .formula-display {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 15px;
        flex-wrap: wrap;
        margin: 20px 0;
        padding: 10px;
        overflow-x: auto;
    }
    .katex-display {
        margin: 0 !important;
    }

    /* Controls */
    .controls-container {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 15px 20px;
      background-color: var(--component-bg);
      border-bottom: 1px solid var(--border-color);
      gap: 30px;
      flex-shrink: 0; /* Prevent controls from shrinking */
    }
    .control-group {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .control-group label {
      font-size: 0.9em;
      margin-bottom: 5px;
      color: #606266;
    }
    .control-group input {
      width: 60px;
      padding: 6px;
      border: 1px solid var(--border-color);
      border-radius: 4px;
      text-align: center;
      font-size: 1em;
    }
    .d_k-value {
        width: 60px;
        padding: 6px;
        border: 1px solid transparent;
        border-radius: 4px;
        text-align: center;
        font-size: 1em;
        font-weight: bold;
        background-color: #f0f2f5;
    }
    """),

    "src/App.tsx": textwrap.dedent("""\
    import React, { useState, useCallback } from 'react';
    import { Controls } from './components/Controls';
    import { Viz } from './components/Viz';
    import { Explanation } from './components/Explanation';
    import { useTransformer } from './hooks/useTransformer';
    import { ElementIdentifier, HighlightSource, HighlightState, TransformerData } from './types';

    function App() {
      const [dims, setDims] = useState({ 
          d_model: 8, 
          h: 2, 
          seq_len: 3,
          n_layers: 1, 
          d_ff: 32
      });
      const [highlight, setHighlight] = useState<HighlightState>({ target: null, sources: [], activeComponent: null });

      const transformerData: TransformerData | null = useTransformer(dims);

      const handleElementClick = useCallback((element: ElementIdentifier) => {
          if (!transformerData) return;

          const { name, row, col } = element;
          const parts = name.split('.'); 

          let newSources: HighlightSource[] = [];
          const activeComponent = parts.slice(0, 3).join('.'); 

          const layerIdx = parseInt(parts[1], 10);
          const componentType = parts[2];
          const layerData = transformerData.encoderLayers[layerIdx];

          if (componentType === 'mha' && parts.length > 3) {
            const headIdx = parseInt(parts[3].replace('h', ''), 10);
            const matrixName = parts[4];
            const d_k = dims.d_model / dims.h;

            switch (matrixName) {
                case 'Q': case 'K': case 'V':
                    const weightMatrixName = `W${matrixName.toLowerCase()}`;
                    for(let i=0; i<dims.d_model; i++) {
                        newSources.push({ name: layerData.mha.heads[headIdx][weightMatrixName as keyof typeof layerData.mha.heads[0]], row: i, col, highlightCol: true });
                        newSources.push({ name: layerData.add_norm_1_in_residual, row, col: i, highlightRow: true });
                    }
                    break;
                case 'Scores':
                    for(let i=0; i < d_k; i++) {
                         newSources.push({ name: `encoder.${layerIdx}.mha.h${headIdx}.Q`, row, col: i, highlightRow: true });
                         newSources.push({ name: `encoder.${layerIdx}.mha.h${headIdx}.K`, row: col, col: i, highlightRow: true });
                    }
                    break;
                case 'HeadOutput':
                    for(let i=0; i < dims.seq_len; i++) {
                        newSources.push({ name: `encoder.${layerIdx}.mha.h${headIdx}.AttentionWeights`, row, col: i, highlightRow: true });
                        newSources.push({ name: `encoder.${layerIdx}.mha.h${headIdx}.V`, row: i, col, highlightCol: true });
                    }
                    break;
            }
          } else if (componentType === 'add_norm_1' || componentType === 'add_norm_2') {
             const matrixType = parts[3];
             if (matrixType === 'out') {
                 const residualInputName = `${activeComponent}_in_residual`;
                 const sublayerInputName = `${activeComponent}_in_sublayer`;
                 for(let i=0; i < dims.d_model; i++) {
                     newSources.push({ name: residualInputName, row, col: i, highlightRow: true });
                     newSources.push({ name: sublayerInputName, row, col: i, highlightRow: true });
                 }
             }
          } else if (componentType === 'ffn' && parts.length > 3) {
              const matrixName = parts[3];
              if (matrixName === 'Output') {
                  const inputMatrixName = `encoder.${layerIdx}.add_norm_1_out`;
                  for(let i=0; i < dims.d_model; i++) {
                      newSources.push({ name: inputMatrixName, row, col: i, highlightRow: true});
                  }
              }
          }

          const newHighlightState: HighlightState = {
              target: element,
              sources: newSources,
              activeComponent: activeComponent
          };
          setHighlight(newHighlightState);

          setTimeout(() => {
              const explanationEl = document.getElementById(`math_${activeComponent}`);
              if (explanationEl) {
                  explanationEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }
          }, 0);

      }, [transformerData, dims]);

      if (!transformerData) {
          return <div>Loading or Invalid Dimensions... (d_model must be divisible by h)</div>
      }

      return (
        <div className="app-container">
          <h1>终极 Transformer 深度探索器 (极简版)</h1>
          <Controls dims={dims} setDims={setDims} />
          <div className="main-layout">
            <div className="column left-column">
              <div className="column-content">
                  <h2>模型结构与数据流</h2>
                  <Viz 
                    data={transformerData} 
                    highlight={highlight}
                    onElementClick={handleElementClick} 
                  />
              </div>
            </div>
            <div className="column right-column">
               <div className="column-content">
                  <h2>数学原理</h2>
                  <Explanation 
                    dims={dims} 
                    highlight={highlight}
                  />
               </div>
            </div>
          </div>
        </div>
      );
    }

    export default App;
    """),

    "src/components/Controls.tsx": textwrap.dedent("""\
    import React from 'react';

    interface ControlsProps {
      dims: { d_model: number; h: number, seq_len: number, n_layers: number, d_ff: number };
      setDims: (dims: { d_model: number; h: number, seq_len: number, n_layers: number, d_ff: number }) => void;
    }

    export const Controls: React.FC<ControlsProps> = ({ dims, setDims }) => {

      const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        let newDims = { ...dims, [id]: parseInt(value, 10) || 1 };

        // Ensure d_model is divisible by h
        if (id === 'h') {
            if (newDims.d_model % newDims.h !== 0) {
                 newDims.d_model = Math.max(newDims.h, Math.ceil(newDims.d_model / newDims.h) * newDims.h);
            }
        }
        if (id === 'd_model') {
             if (newDims.d_model % newDims.h !== 0) {
                 let best_h = 1;
                 for (let i = 1; i <= newDims.d_model; i++) {
                     if (newDims.d_model % i === 0) {
                        if (Math.abs(i - newDims.h) < Math.abs(best_h - newDims.h)) {
                           best_h = i;
                        }
                     }
                 }
                 newDims.h = best_h;
             }
        }

        // Ensure d_ff is a multiple of d_model
        if(id === 'd_model') {
            newDims.d_ff = newDims.d_model * 4;
        }

        setDims(newDims);
      };

      const d_k = dims.d_model % dims.h === 0 ? dims.d_model / dims.h : 'N/A';

      return (
        <div className="controls-container">
          <div className="control-group">
            <label htmlFor="seq_len">序列长度 (seq_len)</label>
            <input type="number" id="seq_len" value={dims.seq_len} onChange={handleInputChange} min="2" max="5" />
          </div>
          <div className="control-group">
            <label htmlFor="d_model">模型维度 (d_model)</label>
            <input type="number" id="d_model" value={dims.d_model} onChange={handleInputChange} step={1} min={2} max="16"/>
          </div>
          <div className="control-group">
            <label htmlFor="h">注意力头数 (h)</label>
            <input type="number" id="h" value={dims.h} onChange={handleInputChange} min="1" max={dims.d_model}/>
          </div>
          <div className="control-group">
            <label htmlFor="n_layers">层数 (N)</label>
            <input type="number" id="n_layers" value={dims.n_layers} onChange={handleInputChange} min="1" max="3"/>
          </div>
           <div className="control-group">
            <label>键/查询维度 (d_k)</label>
            <div className="d_k-value">{d_k}</div>
          </div>
        </div>
      );
    };
    """),

    "src/components/Viz.tsx": textwrap.dedent("""\
    import React from 'react';
    import { TransformerData, HighlightState, ElementIdentifier } from '../types';
    import { EncoderLayer } from './EncoderLayer';
    import { Matrix } from './Matrix';
    import { InlineMath } from 'react-katex';

    interface VizProps {
        data: TransformerData;
        highlight: HighlightState;
        onElementClick: (element: ElementIdentifier) => void;
    }

    export const Viz: React.FC<VizProps> = ({ data, highlight, onElementClick }) => {
        return (
            <div>
                <div className="diagram-component">
                    <div className="component-header">Input Embedding & Positional Encoding</div>
                    <div className="component-body">
                        <Matrix name="inputEmbeddings" data={data.inputEmbeddings} highlight={highlight} onElementClick={onElementClick} />
                        <div className="op-symbol">+</div>
                        <Matrix name="posEncodings" data={data.posEncodings} highlight={highlight} onElementClick={onElementClick} />
                    </div>
                </div>

                <div className="arrow-down">↓</div>

                <div className="diagram-component">
                    <div className="component-header">Encoder Input (<InlineMath math="Z_0" />)</div>
                    <div className="component-body">
                         <Matrix name="encoderInput" data={data.encoderInput} highlight={highlight} onElementClick={onElementClick} />
                    </div>
                </div>

                {data.encoderLayers.map((layer, i) => (
                    <EncoderLayer
                        key={i}
                        layerIndex={i}
                        data={layer}
                        highlight={highlight}
                        onElementClick={onElementClick}
                    />
                ))}
            </div>
        );
    };
    """),

    "src/components/EncoderLayer.tsx": textwrap.dedent("""\
    import React from 'react';
    import { EncoderLayerData, HighlightState, ElementIdentifier } from '../types';
    import { MultiHeadAttention } from './MultiHeadAttention';
    import { AddNorm } from './AddNorm';
    import { FeedForward } from './FeedForward';

    interface EncoderLayerProps {
      layerIndex: number;
      data: EncoderLayerData;
      highlight: HighlightState;
      onElementClick: (element: ElementIdentifier) => void;
    }

    export const EncoderLayer: React.FC<EncoderLayerProps> = ({ layerIndex, data, highlight, onElementClick }) => {
      const baseName = `encoder.${layerIndex}`;
      return (
        <>
            <div className="arrow-down">↓</div>
            <div className="diagram-component">
                <div className="component-header" style={{backgroundColor: '#e3f2fd'}}>Encoder Layer {layerIndex + 1}</div>
                <div className="component-body" style={{padding: '5px'}}>

                    <MultiHeadAttention
                        baseName={`${baseName}.mha`}
                        data={data.mha}
                        highlight={highlight}
                        onElementClick={onElementClick}
                    />

                    <AddNorm 
                        baseName={`${baseName}.add_norm_1`}
                        inputResidual={data.add_norm_1_in_residual}
                        inputSublayer={data.add_norm_1_in_sublayer}
                        output={data.add_norm_1_out}
                        highlight={highlight}
                        onElementClick={onElementClick}
                    />

                    <FeedForward
                        baseName={`${baseName}.ffn`}
                        data={data.ffn}
                        highlight={highlight}
                        onElementClick={onElementClick}
                    />

                    <AddNorm 
                        baseName={`${baseName}.add_norm_2`}
                        inputResidual={data.add_norm_2_in_residual}
                        inputSublayer={data.add_norm_2_in_sublayer}
                        output={data.add_norm_2_out}
                        highlight={highlight}
                        onElementClick={onElementClick}
                    />
                </div>
            </div>
        </>
      );
    };
    """),

    "src/components/DecoderLayer.tsx": textwrap.dedent("""\
    // This file is intentionally left blank for this version,
    // as the focus is on a complete and correct Encoder implementation.
    export {};
    """),

    "src/components/MultiHeadAttention.tsx": textwrap.dedent("""\
    import React from 'react';
    import { MultiHeadAttentionData, HighlightState, ElementIdentifier } from '../types';
    import { Matrix } from './Matrix';
    import { InlineMath } from 'react-katex';

    interface MHAProps {
        baseName: string;
        data: MultiHeadAttentionData;
        highlight: HighlightState;
        onElementClick: (element: ElementIdentifier) => void;
    }

    export const MultiHeadAttention: React.FC<MHAProps> = ({ baseName, data, highlight, onElementClick }) => {
        // Simplified to show only the first head's details for clarity
        const headData = data.heads[0];
        const headBaseName = `${baseName}.h0`;

        return (
            <div className="diagram-component">
                <div className="component-header">Multi-Head Attention</div>
                <div className="component-body">
                    <p>Input (from previous layer)</p>
                    <div className="arrow-down">↓</div>

                    {/* Q, K, V Generation */}
                    <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: '15px'}}>
                       <span>Q = Z × Wq →</span>
                       <Matrix name={`${headBaseName}.Wq`} data={headData.Wq} highlight={highlight} onElementClick={onElementClick} />
                       <Matrix name={`${headBaseName}.Q`} data={headData.Q} highlight={highlight} onElementClick={onElementClick} />
                    </div>
                     <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: '15px', marginTop: '10px'}}>
                       <span>K = Z × Wk →</span>
                       <Matrix name={`${headBaseName}.Wk`} data={headData.Wk} highlight={highlight} onElementClick={onElementClick} />
                       <Matrix name={`${headBaseName}.K`} data={headData.K} highlight={highlight} onElementClick={onElementClick} />
                    </div>
                     <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: '15px', marginTop: '10px'}}>
                       <span>V = Z × Wv →</span>
                       <Matrix name={`${headBaseName}.Wv`} data={headData.Wv} highlight={highlight} onElementClick={onElementClick} />
                       <Matrix name={`${headBaseName}.V`} data={headData.V} highlight={highlight} onElementClick={onElementClick} />
                    </div>

                    <div className="arrow-down">↓</div>
                    <p>Scaled Dot-Product Attention (Head 1)</p>

                    <div style={{display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', justifyContent: 'center'}}>
                        <Matrix name={`${headBaseName}.Q`} data={headData.Q} highlight={highlight} onElementClick={onElementClick} />
                        <InlineMath math="\\times" />
                        <Matrix name={`${headBaseName}.K`} data={headData.K} highlight={highlight} onElementClick={onElementClick} isTransposed={true}/>
                         <InlineMath math="\\rightarrow" />
                        <Matrix name={`${headBaseName}.Scores`} data={headData.Scores} highlight={highlight} onElementClick={onElementClick}/>
                        <InlineMath math="\\xrightarrow{\\text{scale & softmax}}" />
                        <Matrix name={`${headBaseName}.AttentionWeights`} data={headData.AttentionWeights} highlight={highlight} onElementClick={onElementClick}/>
                         <InlineMath math="\\times" />
                        <Matrix name={`${headBaseName}.V`} data={headData.V} highlight={highlight} onElementClick={onElementClick} />
                         <InlineMath math="=" />
                        <Matrix name={`${headBaseName}.HeadOutput`} data={headData.HeadOutput} highlight={highlight} onElementClick={onElementClick}/>
                    </div>

                    <div className="arrow-down">↓</div>
                    <p>Concat & Final Projection</p>

                     <div style={{display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', justifyContent: 'center'}}>
                       <Matrix name={`${headBaseName}.HeadOutput`} data={headData.HeadOutput} highlight={highlight} onElementClick={onElementClick} />
                       <InlineMath math="..." />
                       <Matrix name={`${baseName}.Wo`} data={data.Wo} highlight={highlight} onElementClick={onElementClick} />
                       <InlineMath math="=" />
                       <Matrix name={`${baseName}.Output`} data={data.Output} highlight={highlight} onElementClick={onElementClick} />
                    </div>
                </div>
            </div>
        );
    };
    """),

    "src/components/AddNorm.tsx": textwrap.dedent("""\
    import React from 'react';
    import { Matrix as MatrixType, HighlightState, ElementIdentifier } from '../types';
    import { Matrix } from './Matrix';
    import { InlineMath } from 'react-katex';

    interface AddNormProps {
        baseName: string;
        inputResidual: MatrixType;
        inputSublayer: MatrixType;
        output: MatrixType;
        highlight: HighlightState;
        onElementClick: (element: ElementIdentifier) => void;
    }

    export const AddNorm: React.FC<AddNormProps> = ({ baseName, inputResidual, inputSublayer, output, highlight, onElementClick }) => {
        return (
             <div className="diagram-component">
                <div className="component-header">Add & LayerNorm</div>
                <div className="component-body">
                    <div style={{display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', justifyContent: 'center'}}>
                        <Matrix name={`${baseName}_in_residual`} data={inputResidual} highlight={highlight} onElementClick={onElementClick} />
                        <div className="op-symbol">+</div>
                        <Matrix name={`${baseName}_in_sublayer`} data={inputSublayer} highlight={highlight} onElementClick={onElementClick} />
                    </div>
                    <div className="arrow-down"><InlineMath math="\\rightarrow \\text{LayerNorm} \\rightarrow" /></div>
                    <Matrix name={`${baseName}_out`} data={output} highlight={highlight} onElementClick={onElementClick} />
                </div>
            </div>
        );
    };
    """),

    "src/components/FeedForward.tsx": textwrap.dedent("""\
    import React from 'react';
    import { FFNData, HighlightState, ElementIdentifier } from '../types';
    import { Matrix } from './Matrix';
    import { InlineMath } from 'react-katex';

    interface FFNProps {
        baseName: string;
        data: FFNData;
        highlight: HighlightState;
        onElementClick: (element: ElementIdentifier) => void;
    }

    export const FeedForward: React.FC<FFNProps> = ({ baseName, data, highlight, onElementClick }) => {
        return (
            <div className="diagram-component">
                <div className="component-header">Feed-Forward Network</div>
                <div className="component-body">
                    <p>Input (from Add & Norm)</p>
                    <div className="arrow-down">↓</div>
                    <div style={{display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', justifyContent: 'center'}}>
                        <span>Linear 1 & ReLU →</span>
                        <Matrix name={`${baseName}.W1`} data={data.W1} highlight={highlight} onElementClick={onElementClick} />
                        <Matrix name={`${baseName}.Activated`} data={data.Activated} highlight={highlight} onElementClick={onElementClick} />
                    </div>
                     <div style={{display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '10px'}}>
                        <span>Linear 2 →</span>
                        <Matrix name={`${baseName}.W2`} data={data.W2} highlight={highlight} onElementClick={onElementClick} />
                        <Matrix name={`${baseName}.Output`} data={data.Output} highlight={highlight} onElementClick={onElementClick} />
                    </div>
                </div>
            </div>
        );
    };
    """),

    "src/components/Matrix.tsx": textwrap.dedent("""\
    import React from 'react';
    import { Element } from './Element';
    import { Matrix as MatrixType, HighlightState, ElementIdentifier } from '../types';
    import { InlineMath } from 'react-katex';

    interface MatrixProps {
      name: string;
      data: MatrixType;
      highlight: HighlightState;
      onElementClick: (element: ElementIdentifier) => void;
      isTransposed?: boolean;
    }

    export const Matrix: React.FC<MatrixProps> = ({ name, data, highlight, onElementClick, isTransposed = false }) => {
      if (!data || data.length === 0 || data[0].length === 0) {
        return <div>Invalid matrix data for {name}</div>;
      }

      const rows = isTransposed ? data[0].length : data.length;
      const cols = isTransposed ? data.length : data[0].length;

      const gridTemplateColumns = `repeat(${cols}, auto)`;

      const vectorHighlights = highlight.sources
        .filter(s => s.name === name && (s.highlightRow || s.highlightCol))
        .map((s, i) => {
           const elementWidth = 45;
           const elementHeight = 25;
           const gap = 3;

           let style: React.CSSProperties = {};
           const r = s.highlightRow ? s.row : 0;
           const c = s.highlightCol ? s.col : 0;
           const numRows = s.highlightRow ? 1 : rows;
           const numCols = s.highlightCol ? 1 : cols;

           style.width = `calc(${numCols} * (${elementWidth}px + ${gap}px) - ${gap}px)`;
           style.height = `calc(${numRows} * (${elementHeight}px + ${gap}px) - ${gap}px)`;
           style.top = `${r * (elementHeight + gap) + 5}px`;
           style.left = `${c * (elementWidth + gap) + 5}px`;

           return <div key={`${s.name}-${r}-${c}-${i}`} className="vector-highlight-overlay" style={style} />;
        });


      return (
        <div className="matrix-wrapper">
          <div className="matrix-container">
            {vectorHighlights}
            <div className="matrix-grid" style={{ gridTemplateColumns }}>
              {Array.from({ length: rows }).map((_, r) => (
                <React.Fragment key={`row-${r}`}>
                {Array.from({ length: cols }).map((_, c) => {
                  const originalRow = isTransposed ? c : r;
                  const originalCol = isTransposed ? r : c;
                  const value = data[originalRow][originalCol];

                  return (
                    <Element
                      key={`${name}-${originalRow}-${originalCol}`}
                      name={name}
                      row={originalRow}
                      col={originalCol}
                      value={value}
                      highlight={highlight}
                      onElementClick={onElementClick}
                    />
                  );
                })}
                </React.Fragment>
              ))}
            </div>
          </div>
          <div className="matrix-label"><InlineMath>{`${name.split('.').pop()}${isTransposed ? '^T' : ''}`}</InlineMath></div>
        </div>
      );
    };
    """),

    "src/components/Element.tsx": textwrap.dedent("""\
    import React from 'react';
    import { HighlightState, ElementIdentifier } from '../types';

    interface ElementProps {
      name: string;
      row: number;
      col: number;
      value: number;
      highlight: HighlightState;
      onElementClick: (element: ElementIdentifier) => void;
    }

    export const Element: React.FC<ElementProps> = React.memo(({ name, row, col, value, highlight, onElementClick }) => {

      const isTarget = highlight.target?.name === name && highlight.target?.row === row && highlight.target?.col === col;
      const isSource = highlight.sources.some(s => s.name === name && s.row === row && s.col === col);

      const className = `matrix-element ${isTarget ? 'target' : ''} ${isSource ? 'source' : ''}`;

      const handleClick = () => {
        onElementClick({ name, row, col });
      };

      return (
        <div className={className} onClick={handleClick}>
          {value.toFixed(2)}
        </div>
      );
    });
    """),

    "src/components/Explanation.tsx": textwrap.dedent("""\
    import React from 'react';
    import 'katex/dist/katex.min.css';
    import { BlockMath, InlineMath } from 'react-katex';
    import { SymbolicMatrix } from './SymbolicMatrix';
    import { HighlightState } from '../types';

    interface ExplanationProps {
        dims: { d_model: number; h: number, seq_len: number, n_layers: number, d_ff: number };
        highlight: HighlightState;
    }

    interface MathBlockProps {
        id: string;
        title: string;
        children: React.ReactNode;
        highlight: HighlightState;
    }

    const MathBlock: React.FC<MathBlockProps> = ({ id, title, children, highlight }) => {
        const isActive = highlight.activeComponent ? id.includes(highlight.activeComponent) : false;
        return (
            <div id={`math_${id}`} className={`math-block ${isActive ? 'active' : ''}`}>
                <h3>{title}</h3>
                {children}
            </div>
        );
    };

    export const Explanation: React.FC<ExplanationProps> = ({ dims, highlight }) => {
        const d_k = dims.d_model / dims.h;

        const renderMatrixProduct = (
            A_name: string, B_name: string, C_name: string, 
            A_prefix: string, B_prefix: string, C_prefix: string,
            a_rows: number, a_cols: number, 
            b_rows: number, b_cols: number, 
            b_transpose: boolean = false
        ) => {
          return (
             <div className="formula-display">
                <SymbolicMatrix name={A_name} prefix={A_prefix} rows={a_rows} cols={a_cols} highlight={highlight} />
                <BlockMath math="\\times" />
                <SymbolicMatrix name={B_name} prefix={B_prefix} rows={b_rows} cols={b_cols} highlight={highlight} transpose={b_transpose} />
                <BlockMath math="=" />
                <SymbolicMatrix name={C_name} prefix={C_prefix} rows={a_rows} cols={b_cols} highlight={highlight} />
            </div>
          )
        }

        return (
            <div>
                 <MathBlock id="input_embed" title="输入嵌入 (Input Embedding)" highlight={highlight}>
                    <BlockMath math="Z_0 = \\text{Embedding}(X) + \\text{PE}(X)" />
                    <p>此步骤将输入的文本序列转换为模型可以处理的、包含位置信息的数值向量。我们以一个序列 (长度={dims.seq_len}) 为例，当前模型维度 <InlineMath math={`d_{model}=${dims.d_model}`} />。</p>
                    <h5>1. 向量嵌入 (Embedding)</h5>
                    <p>首先，通过一个大型的、可学习的嵌入表，将每个词元的 ID 转换为一个稠密向量。结果是一个矩阵，每一行代表一个词。</p>
                    <div className="formula-display">
                        <SymbolicMatrix name="inputEmbeddings" rows={dims.seq_len} cols={dims.d_model} prefix="e" highlight={highlight} />
                    </div>
                    <h5>2. 位置编码 (Positional Encoding)</h5>
                    <p>接下来，我们创建一个同样大小的位置编码矩阵。该矩阵根据固定的 <InlineMath math="\\sin" /> 和 <InlineMath math="\\cos" /> 函数生成。</p>
                    <div className="formula-display">
                        <SymbolicMatrix name="posEncodings" rows={dims.seq_len} cols={dims.d_model} prefix="pe" highlight={highlight} />
                    </div>
                 </MathBlock>

                 <MathBlock id="encoder.0.mha" title="编码器：多头注意力 (Multi-Head Attention)" highlight={highlight}>
                    <BlockMath math={`\\text{MultiHead}(Z) = \\text{Concat}(\\text{head}_0, ..., \\text{head}_{${dims.h-1}})W^O`} />
                     <p>多头注意力的核心思想是将输入拆分到 <InlineMath math={`h=${dims.h}`} /> 个“子空间”中并行处理，最后再将结果融合。这允许模型从不同角度关注信息。下方以单个头为例展示详细计算。</p>

                    <h5>为单个头生成 Q, K, V</h5>
                    <p>输入矩阵 <InlineMath math="Z" /> (来自上一层) 与该头专属的权重矩阵 <InlineMath math="W^Q, W^K, W^V" /> 相乘，得到Q, K, V矩阵。</p>
                    <BlockMath math={`Q = Z W^Q, \\quad K = Z W^K, \\quad V = Z W^V`} />
                    {renderMatrixProduct('Z', 'Wq', 'Q', 'z', 'w^q', 'q', dims.seq_len, dims.d_model, dims.d_model, d_k)}

                    <h5>计算注意力分数</h5>
                    <p>通过将 Query 矩阵与转置后的 Key 矩阵相乘，我们得到一个注意力分数矩阵。</p>
                    <BlockMath math="\\text{Scores} = Q K^T" />
                    {renderMatrixProduct('Q', 'K', 'Scores', 'q', 'k', 's', dims.seq_len, d_k, d_k, dims.seq_len, true)}

                    <h5>缩放、Softmax 和加权求和</h5>
                    <BlockMath math={`\\text{head}_i = \\text{softmax}\\left(\\frac{\\text{Scores}}{\\sqrt{d_k}}\\right)V`} />
                    <p>为防止梯度过小，将分数矩阵中的所有元素都除以一个缩放因子 <InlineMath math={`\\sqrt{d_k}`} />。然后，对缩放后的分数矩阵<b>逐行</b>应用 Softmax 函数，将其转换为概率分布（权重）。最后，将得到的权重矩阵与 Value 矩阵 <InlineMath math="V" /> 相乘，得到该注意力头的最终输出。</p>
                 </MathBlock>

                 <MathBlock id="encoder.0.add_norm_1" title="残差连接与层归一化 (Add & Norm)" highlight={highlight}>
                    <BlockMath math="X_{out} = \\text{LayerNorm}(X_{in} + \\text{Sublayer}(X_{in}))" />
                    <p>此步骤将子层（如MHA）的输出 <InlineMath math="\\text{Sublayer}(X_{in})"/> 与其输入 <InlineMath math="X_{in}"/> 进行逐元素相加（残差连接），然后对结果矩阵的每一行进行层归一化。</p>
                    <div className="formula-display">
                        <SymbolicMatrix name="add_norm_1_in_residual" prefix="x" rows={dims.seq_len} cols={dims.d_model} highlight={highlight} />
                        <BlockMath math="+" />
                        <SymbolicMatrix name="add_norm_1_in_sublayer" prefix="m" rows={dims.seq_len} cols={dims.d_model} highlight={highlight} />
                        <BlockMath math="\\xrightarrow{\\text{LayerNorm}}" />
                        <SymbolicMatrix name="add_norm_1_out" prefix="y" rows={dims.seq_len} cols={dims.d_model} highlight={highlight} />
                    </div>
                 </MathBlock>

                  <MathBlock id="encoder.0.ffn" title="前馈神经网络 (Feed-Forward Network)" highlight={highlight}>
                    <BlockMath math="\\text{FFN}(X) = \\text{ReLU}(XW_1 + b_1)W_2 + b_2" />
                    <p>前馈网络 (FFN) 是一个简单的两层全连接神经网络，独立应用于序列中的每个位置。</p>
                    <h5>1. 第一次线性变换 (维度扩展)</h5>
                    <p>输入矩阵首先会经过一个线性层，将其维度从 <InlineMath math={`d_{model}=${dims.d_model}`} /> 扩展到 <InlineMath math={`d_{ff}=${dims.d_ff}`} />。</p>
                    {renderMatrixProduct('X', 'W1', 'H', 'x', 'w_1', 'h', dims.seq_len, dims.d_model, dims.d_model, dims.d_ff)}
                    <h5>2. 第二次线性变换 (维度投影)</h5>
                    <p>经过ReLU激活后，矩阵再通过第二个线性层，将其从 <InlineMath math={`d_{ff}`} /> 投影回 <InlineMath math={`d_{model}`} />。</p>
                    {renderMatrixProduct('H_{act}', 'W2', 'X_{ffn}', 'h\'', 'w_2', 'y', dims.seq_len, dims.d_ff, dims.d_ff, dims.d_model)}
                 </MathBlock>
            </div>
        );
    };
    """),

    "src/components/SymbolicMatrix.tsx": textwrap.dedent("""\
    import React from 'react';
    import { HighlightState } from '../types';
    import { BlockMath } from 'react-katex';

    interface SymbolicMatrixProps {
      name: string;
      rows: number;
      cols: number;
      prefix: string;
      highlight: HighlightState;
      transpose?: boolean;
    }

    export const SymbolicMatrix: React.FC<SymbolicMatrixProps> = ({ name, rows, cols, prefix, highlight, transpose = false }) => {

      const displayRows = transpose ? cols : rows;
      const displayCols = transpose ? rows : cols;

      let matrixString = '';
      for (let r = 0; r < displayRows; r++) {
        for (let c = 0; c < displayCols; c++) {
          const originalRow = transpose ? c : r;
          const originalCol = transpose ? r : c;

          let elementString = `${prefix}_{${originalRow},${originalCol}}`;

          const isTarget = highlight.target?.name === name && highlight.target?.row === originalRow && highlight.target?.col === originalCol;
          const isSource = highlight.sources.some(s => s.name === name && s.row === originalRow && s.col === originalCol);

          if (isTarget) {
            // Correctly escaped backslashes for JS template literal
            elementString = `\\textcolor{#e63946}{\\underline{${elementString}}}`;
          } else if (isSource) {
            // Correctly escaped backslashes for JS template literal
            elementString = `\\textcolor{#1d3557}{\\textit{${elementString}}}`;
          }

          matrixString += elementString;

          if (c < displayCols - 1) {
            matrixString += ' & ';
          }
        }
        if (r < displayRows - 1) {
          matrixString += ' \\\\ ';
        }
      }

      const finalName = name.split('.').pop() || name;

      const bmatrix = `\\begin{pmatrix} ${matrixString} \\end{pmatrix}`;
      const finalFormula = `${finalName.replace(/_/g, '\\_')}${transpose ? '^T' : ''} = ${bmatrix}`;

      return <BlockMath math={finalFormula} />;
    };
    """),

    "src/hooks/useTransformer.ts": textwrap.dedent("""\
    import { useMemo } from 'react';
    import { Matrix, TransformerData, EncoderLayerData, FFNData, MultiHeadAttentionData, AttentionHeadData, Vector } from '../types';

    // --- Utility Functions ---

    const createRandomMatrix = (rows: number, cols: number): Matrix => {
      return Array.from({ length: rows }, () => 
        Array.from({ length: cols }, () => parseFloat((Math.random() * 2 - 1).toFixed(2)))
      );
    };

    const createRandomVector = (size: number): Vector => {
      return Array.from({ length: size }, () => parseFloat((Math.random() * 2 - 1).toFixed(2)));
    }

    const addMatrices = (A: Matrix, B: Matrix): Matrix => {
      return A.map((row, i) => 
        row.map((val, j) => parseFloat((val + B[i][j]).toFixed(2)))
      );
    };

    const multiplyMatrices = (A: Matrix, B: Matrix): Matrix => {
      const rowsA = A.length;
      const colsA = A[0].length;
      const colsB = B[0].length;
      const result: Matrix = Array(rowsA).fill(0).map(() => Array(colsB).fill(0));

      for (let i = 0; i < rowsA; i++) {
        for (let j = 0; j < colsB; j++) {
          let sum = 0;
          for (let k = 0; k < colsA; k++) {
            sum += A[i][k] * B[k][j];
          }
          result[i][j] = parseFloat(sum.toFixed(2));
        }
      }
      return result;
    };

    const scaleMatrix = (A: Matrix, scalar: number): Matrix => {
        return A.map(row => row.map(val => parseFloat((val / scalar).toFixed(2))));
    }

    const softmaxByRow = (A: Matrix): Matrix => {
        return A.map(row => {
            const maxVal = Math.max(...row);
            const exps = row.map(val => Math.exp(val - maxVal));
            const sumExps = exps.reduce((a, b) => a + b, 0);
            return exps.map(exp => parseFloat((exp / sumExps).toFixed(2)));
        });
    }

    const layerNorm = (A: Matrix): Matrix => {
        return A.map(row => {
            const mean = row.reduce((a,b) => a+b, 0) / row.length;
            const variance = row.map(x => (x - mean) ** 2).reduce((a,b) => a+b,0) / row.length;
            const std = Math.sqrt(variance + 1e-5);
            return row.map(x => parseFloat(((x - mean) / std).toFixed(2)));
        });
    }

    const applyReLU = (A: Matrix): Matrix => {
        return A.map(row => row.map(val => Math.max(0, val)));
    }

    const addBias = (A: Matrix, b: Vector): Matrix => {
        return A.map(row => row.map((val, j) => parseFloat((val + b[j]).toFixed(2))));
    }

    // --- Main Hook ---

    interface Dims {
        d_model: number;
        h: number;
        seq_len: number;
        n_layers: number;
        d_ff: number;
    }

    export const useTransformer = (dims: Dims): TransformerData | null => {

      return useMemo(() => {
        try {
            const { d_model, h, seq_len, n_layers, d_ff } = dims;
            if (d_model % h !== 0) return null;
            const d_k = d_model / h;

            const inputEmbeddings = createRandomMatrix(seq_len, d_model);
            const posEncodings: Matrix = Array.from({ length: seq_len }, (_, pos) =>
              Array.from({ length: d_model }, (_, i) => 
                parseFloat((i % 2 === 0 
                  ? Math.sin(pos / (10000 ** (i / d_model)))
                  : Math.cos(pos / (10000 ** ((i - 1) / d_model)))).toFixed(2))
              )
            );
            const encoderInput = addMatrices(inputEmbeddings, posEncodings);

            let currentInput = encoderInput;
            const encoderLayers: EncoderLayerData[] = [];

            for (let i = 0; i < n_layers; i++) {
                // MHA
                const heads: AttentionHeadData[] = [];
                const headOutputs: Matrix[] = [];
                for(let j=0; j < h; j++) {
                    const Wq = createRandomMatrix(d_model, d_k);
                    const Wk = createRandomMatrix(d_model, d_k);
                    const Wv = createRandomMatrix(d_model, d_k);

                    const Q = multiplyMatrices(currentInput, Wq);
                    const K = multiplyMatrices(currentInput, Wk);
                    const V = multiplyMatrices(currentInput, Wv);

                    const K_T: Matrix = Array.from({ length: d_k }, (_, r) => Array.from({ length: seq_len }, (_, c) => K[c][r]));
                    const Scores = multiplyMatrices(Q, K_T);

                    const ScaledScores = scaleMatrix(Scores, Math.sqrt(d_k));
                    const AttentionWeights = softmaxByRow(ScaledScores);
                    const HeadOutput = multiplyMatrices(AttentionWeights, V);

                    heads.push({ Wq, Wk, Wv, Q, K, V, Scores, ScaledScores, AttentionWeights, HeadOutput });
                    headOutputs.push(HeadOutput);
                }
                const ConcatOutput = headOutputs.reduce((acc, current) => acc.map((row, rIdx) => [...row, ...current[rIdx]]), Array(seq_len).fill(0).map(() => []));
                const Wo = createRandomMatrix(d_model, d_model);
                const mhaOutput = multiplyMatrices(ConcatOutput, Wo);
                const mha: MultiHeadAttentionData = { heads, Wo, Output: mhaOutput };

                // Add & Norm 1
                const add_norm_1_in_residual = currentInput;
                const add_norm_1_in_sublayer = mha.Output;
                const add_norm_1_sum = addMatrices(add_norm_1_in_residual, add_norm_1_in_sublayer);
                const add_norm_1_out = layerNorm(add_norm_1_sum);

                // FFN
                const W1 = createRandomMatrix(d_model, d_ff);
                const b1 = createRandomVector(d_ff);
                const Intermediate = addBias(multiplyMatrices(add_norm_1_out, W1), b1);
                const Activated = applyReLU(Intermediate);
                const W2 = createRandomMatrix(d_ff, d_model);
                const b2 = createRandomVector(d_model);
                const ffnOutput = addBias(multiplyMatrices(Activated, W2), b2);
                const ffn: FFNData = { W1, b1, Intermediate, Activated, W2, b2, Output: ffnOutput };

                // Add & Norm 2
                const add_norm_2_in_residual = add_norm_1_out;
                const add_norm_2_in_sublayer = ffn.Output;
                const add_norm_2_sum = addMatrices(add_norm_2_in_residual, add_norm_2_in_sublayer);
                const add_norm_2_out = layerNorm(add_norm_2_sum);

                encoderLayers.push({
                    mha,
                    add_norm_1_in_residual,
                    add_norm_1_in_sublayer,
                    add_norm_1_out,
                    ffn,
                    add_norm_2_in_residual,
                    add_norm_2_in_sublayer,
                    add_norm_2_out
                });

                currentInput = add_norm_2_out;
            }

            return {
                inputEmbeddings,
                posEncodings,
                encoderInput,
                encoderLayers
            };
        } catch (e) {
            console.error("Error during transformer calculation:", e);
            return null;
        }
      }, [dims]);
    };
    """),
}


def create_project():
    """
    Creates the project structure and files in the current directory.
    """
    print("开始生成项目文件...")
    project_root = os.path.dirname(os.path.abspath(__file__))
    print(f"项目根目录设置为: {project_root}")

    for file_path, content in project_files.items():
        full_path = os.path.join(project_root, file_path)
        dir_name = os.path.dirname(full_path)
        if not os.path.exists(dir_name):
            os.makedirs(dir_name)
            print(f"  创建目录: {dir_name}")

        print(f"  写入文件: {full_path}")
        if file_path.endswith('.ico'):
            import base64
            with open(full_path, 'wb') as bf:
                bf.write(base64.b64decode(content))
        else:
            with open(full_path, 'w', encoding='utf-8') as f:
                f.write(content)

    print("\\n项目文件生成完毕！\\n")
    print("--- 后续步骤 ---")
    print("1. 请确保您已经安装了 Node.js 和 npm。")
    print("2. 在您的终端中，导航到项目目录:")
    print(f"   cd {project_root}")
    print("3. 安装项目依赖 (这可能需要几分钟):")
    print("   npm install")
    print("4. 启动开发服务器:")
    print("   npm start")
    print("5. 您的浏览器应该会自动打开 http://localhost:3000 查看应用。")
    print("--------------------\\n")


if __name__ == "__main__":
    create_project()