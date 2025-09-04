/* START OF FILE: src/App.tsx */
// FILE: src/App.tsx
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

  // ENHANCEMENT: Complete rewrite of the highlighting logic for bi-directional analysis.
  const handleElementClick = useCallback((element: ElementIdentifier) => {
      if (!transformerData) return;

      const { name, row, col } = element;
      const parts = name.split('.');

      let newSources: HighlightSource[] = [];
      let newTarget: ElementIdentifier | null = element;

      // FIX: Active component logic is now generic to support multiple layers
      // and correctly map to the single explanation block on the right.
      let activeComponent: string | null = null;
      const componentType = parts.length > 2 ? parts[2] : parts[0]; // e.g., mha, ffn, inputEmbeddings

      if (['inputEmbeddings', 'posEncodings', 'encoderInput'].includes(componentType)) {
          activeComponent = 'input_embed';
      } else if (componentType === 'mha') {
          activeComponent = 'mha';
      } else if (componentType === 'add_norm_1' || componentType === 'add_norm_2') {
          activeComponent = 'add_norm';
      } else if (componentType === 'ffn') {
          activeComponent = 'ffn';
      }


      const layerIdx = parts.length > 1 && parts[0] === 'encoder' ? parseInt(parts[1], 10) : 0;
      const matrixName = parts[parts.length -1];
      const d_k = dims.d_model / dims.h;

      // --- BACKWARD TRACING: "How was I computed?" (Element-centric style) ---
      if (name === 'encoderInput') {
          newSources.push({ name: 'inputEmbeddings', row, col });
          newSources.push({ name: 'posEncodings', row, col });
      } else if (componentType === 'mha') {
          const headIdx = parseInt(parts[3].replace('h', ''), 10);
          const headBasePath = `encoder.${layerIdx}.mha.h${headIdx}`;
          // The input to MHA is the output of the *previous* Add & Norm layer, or the initial encoder input
          const mhaInputName = layerIdx === 0
              ? `encoderInput`
              : `encoder.${layerIdx-1}.add_norm_2_out`;

          // If we click MHA input, we trace back to Add & Norm 1 output
          if (name.endsWith('add_norm_1_in_residual') && name.startsWith(`encoder.${layerIdx}.mha`)) {
              const prevLayerOutput = layerIdx > 0 ? `encoder.${layerIdx-1}.add_norm_2_out` : 'encoderInput';
              newSources.push({ name: prevLayerOutput, row, col });
          }

          if (['Q', 'K', 'V'].includes(matrixName)) {
              const weightName = `${headBasePath}.W${matrixName.toLowerCase()}`;
              const mhaInput = `encoder.${layerIdx}.add_norm_1_in_residual`; // MHA input is residual from Add&Norm1
              for (let k = 0; k < dims.d_model; k++) {
                  newSources.push({ name: mhaInput, row, col: k, highlightRow: true });
                  newSources.push({ name: weightName, row: k, col: col, highlightCol: true });
              }
          } else if (matrixName === 'Scores') {
              // FIX: Use highlightRow to highlight the entire vectors in Q and K.
              // This is more intuitive than highlighting individual cells.
              newSources.push({ name: `${headBasePath}.Q`, row: row, col: -1, highlightRow: true });
              newSources.push({ name: `${headBasePath}.K`, row: col, col: -1, highlightRow: true }); // K is transposed, so its row `col` becomes a column.
          } else if (matrixName === 'AttentionWeights') {
              // An attention weight is calculated from the entire corresponding row in Scores
               for (let k = 0; k < dims.seq_len; k++) {
                   newSources.push({ name: `${headBasePath}.Scores`, row, col: k, highlightRow: true});
               }
          } else if (matrixName === 'HeadOutput') {
              for (let k = 0; k < dims.seq_len; k++) {
                   newSources.push({ name: `${headBasePath}.AttentionWeights`, row, col: k, highlightRow: true });
              }
              for (let k = 0; k < d_k; k++) {
                   newSources.push({ name: `${headBasePath}.V`, row: -1, col: k, highlightCol: true }); // All rows of V contribute to the output
              }
          } else if (matrixName === 'Output') {
              const woName = `encoder.${layerIdx}.mha.Wo`;
              for (let k = 0; k < dims.d_model; k++) { // d_model = h * d_k
                  const headIdx = Math.floor(k / d_k);
                  const headCol = k % d_k;
                  newSources.push({ name: `encoder.${layerIdx}.mha.h${headIdx}.HeadOutput`, row, col: -1, highlightRow: true });
                  newSources.push({ name: woName, row: k, col: col, highlightCol: true });
              }
          }
      } else if (componentType === 'add_norm_1' || componentType === 'add_norm_2') {
          if (matrixName === 'out') {
              const baseName = parts.slice(0,3).join('.');
              // Element-wise addition, perfect 1-to-1 mapping
              newSources.push({ name: `${baseName}_in_residual`, row, col });
              newSources.push({ name: `${baseName}_in_sublayer`, row, col });
          }
      } else if (componentType === 'ffn') {
          const ffnInputName = `encoder.${layerIdx}.add_norm_1_out`;
          if (matrixName === 'Intermediate' || matrixName === 'Activated') {
              const w1Name = `encoder.${layerIdx}.ffn.W1`;
              for(let k=0; k < dims.d_model; k++) {
                  newSources.push({ name: ffnInputName, row, col: k, highlightRow: true });
                  newSources.push({ name: w1Name, row: k, col: col, highlightCol: true });
              }
          } else if (matrixName === 'Output') {
              const activatedName = `encoder.${layerIdx}.ffn.Activated`;
              const w2Name = `encoder.${layerIdx}.ffn.W2`;
              for(let k=0; k < dims.d_ff; k++) {
                  newSources.push({ name: activatedName, row, col: k, highlightRow: true });
                  newSources.push({ name: w2Name, row: k, col: col, highlightCol: true });
              }
          }
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
/* END OF FILE: src/App.tsx */