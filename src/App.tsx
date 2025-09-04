// FILE: src/App.tsx
import React, { useState, useCallback } from 'react';
import { Controls } from './components/Controls';
import { Viz } from './components/Viz';
import { Explanation } from './components/Explanation';
import { useTransformer } from './hooks/useTransformer';
import { ElementIdentifier, HighlightSource, HighlightState, TransformerData } from './types';
import { MATRIX_NAMES } from './config/matrixNames';

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
      let newTarget: ElementIdentifier | null = element;

      let activeComponent: string | null = null;
      const layerIdx = parts.length > 1 && parts[0] === 'encoder' ? parseInt(parts[1], 10) : 0;
      const LN = MATRIX_NAMES.layer(layerIdx); // Layer Names
      const HN = MATRIX_NAMES.head(layerIdx, 0); // Head Names for head 0

      // [核心修复] 修正重复的 case 标签，并确保 add_norm_1_output 正确映射
      switch (name) {
          case MATRIX_NAMES.inputEmbeddings:
          case MATRIX_NAMES.posEncodings:
          case MATRIX_NAMES.encoderInput:
              activeComponent = 'input_embed';
              break;
          case LN.encoder_input:
              activeComponent = 'mha';
              break;
          case LN.add_norm_1_output:
              // 如果点击的是 add_norm_1_output, 它既是 AddNorm1 的输出，也是 FFN 的输入
              // 默认激活 AddNorm1，因为它是直接产生者
              activeComponent = 'add_norm_1';
              break;
          case LN.ffn_output:
              activeComponent = 'ffn';
              break;
          case LN.add_norm_2_output:
              activeComponent = 'add_norm_2';
              break;
          default:
              if (name.includes('.mha')) activeComponent = 'mha';
              if (name.includes('.ffn')) activeComponent = 'ffn';
      }

      // 当点击 FFN 内部组件时，确保激活 ffn 区块
      if (name.startsWith(`encoder.${layerIdx}.ffn`)) {
          activeComponent = 'ffn';
      }

      const d_k = dims.d_model / dims.h;

      // --- Backward Tracing Logic ---
      if (name === MATRIX_NAMES.encoderInput) {
          newSources.push({ name: MATRIX_NAMES.inputEmbeddings, row, col });
          newSources.push({ name: MATRIX_NAMES.posEncodings, row, col });
      }
      // --- MHA Component ---
      else if (name === HN.Q || name === HN.K || name === HN.V) {
          const matrixType = name.split('.').pop()!;
          // [核心修复] 修正大小写错误 Wq vs wq
          const weightName = HN[matrixType as 'Q' | 'K' | 'V'];
          for (let k = 0; k < dims.d_model; k++) {
              newSources.push({ name: LN.encoder_input, row, col: k, highlightRow: true });
              newSources.push({ name: weightName.replace(matrixType, `W${matrixType.toLowerCase()}`), row: k, col: col, highlightCol: true });
          }
      } else if (name === HN.Scores) {
          newSources.push({ name: HN.Q, row: row, col: -1, highlightRow: true });
          newSources.push({ name: HN.K, row: col, col: -1, highlightRow: true });
      } else if (name === HN.ScaledScores) {
          newSources.push({ name: HN.Scores, row, col });
      } else if (name === HN.AttentionWeights) {
           for (let k = 0; k < dims.seq_len; k++) {
               newSources.push({ name: HN.ScaledScores, row, col: k, highlightRow: true });
           }
      } else if (name === HN.HeadOutput) {
          for (let k = 0; k < dims.seq_len; k++) {
               newSources.push({ name: HN.AttentionWeights, row, col: k, highlightRow: true });
          }
          for (let k = 0; k < d_k; k++) {
               newSources.push({ name: HN.V, row: -1, col: k, highlightCol: true });
          }
      } else if (name === LN.mha_output) {
          for (let k = 0; k < dims.d_model; k++) {
              const headIdx = Math.floor(k / d_k);
              const headName = MATRIX_NAMES.head(layerIdx, headIdx).HeadOutput;
              newSources.push({ name: headName, row, col: -1, highlightRow: true });
              newSources.push({ name: LN.Wo, row: k, col: col, highlightCol: true });
          }
      }
      // --- Add & Norm 1 ---
      else if (name === LN.add_norm_1_output) {
          newSources.push({ name: LN.encoder_input, row, col });
          newSources.push({ name: LN.mha_output, row, col });
      }
      // --- FFN Component ---
      else if (name === LN.Intermediate || name === LN.Activated) {
           for(let k=0; k < dims.d_model; k++) {
               newSources.push({ name: LN.add_norm_1_output, row, col: k, highlightRow: true });
               newSources.push({ name: LN.W1, row: k, col: col, highlightCol: true });
           }
           // Also add bias as a source
           for(let k=0; k < dims.d_ff; k++) {
               newSources.push({ name: LN.b1, row: 0, col: k, highlightRow: true});
           }
      } else if (name === LN.ffn_output) {
           for(let k=0; k < dims.d_ff; k++) {
               newSources.push({ name: LN.Activated, row, col: k, highlightRow: true });
               newSources.push({ name: LN.W2, row: k, col: col, highlightCol: true });
           }
            // Also add bias as a source
           for(let k=0; k < dims.d_model; k++) {
                newSources.push({ name: LN.b2, row: 0, col: k, highlightRow: true});
           }
      }
      // --- Add & Norm 2 ---
      else if (name === LN.add_norm_2_output) {
          newSources.push({ name: LN.add_norm_1_output, row, col });
          newSources.push({ name: LN.ffn_output, row, col });
      }

      const newHighlightState: HighlightState = { target: newTarget, sources: newSources, activeComponent };
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
// END OF FILE: src/App.tsx