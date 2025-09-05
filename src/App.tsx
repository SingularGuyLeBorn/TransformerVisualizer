// FILE: src/App.tsx
import React, { useState, useCallback, useEffect } from 'react';
import { Controls } from './components/Controls';
import { Viz } from './components/Viz';
import { Explanation } from './components/Explanation';
import { useTransformer } from './hooks/useTransformer';
import { ElementIdentifier, HighlightSource, HighlightState, TransformerData } from './types';
import { MATRIX_NAMES } from './config/matrixNames';

// Helper to create backward highlight state
const createBackwardHighlight = (element: ElementIdentifier, transformerData: TransformerData, dims: any, currentHighlight: HighlightState): HighlightState => {
    const { name, row, col, isInternal } = element;
    let newSources: HighlightSource[] = [];
    let newTarget: ElementIdentifier | null = element;
    let activeComponent: string | null = null;
    let activeResidual: string | null = null;

    if (name.startsWith('residual.')) {
        const [, resId, type] = name.split('.');
        activeResidual = resId;
        const layerIdx = 0; // Simplified for this app
        const LN = MATRIX_NAMES.layer(layerIdx);
        if (resId === 'res1') {
            activeComponent = 'add_norm_1';
            newSources.push({ name: LN.encoder_input, row: -1, col: -1, highlightRow: true, highlightCol: true });
            newSources.push({ name: LN.mha_output, row: -1, col: -1, highlightRow: true, highlightCol: true });
        } else if (resId === 'res2') {
            activeComponent = 'add_norm_2';
            newSources.push({ name: LN.add_norm_1_output, row: -1, col: -1, highlightRow: true, highlightCol: true });
            newSources.push({ name: LN.ffn_output, row: -1, col: -1, highlightRow: true, highlightCol: true });
        }
        return { target: null, sources: newSources, activeComponent, activeResidual };
    }

    const layerIdxMatch = name.match(/encoder\.(\d+)/);
    const layerIdx = layerIdxMatch ? parseInt(layerIdxMatch[1], 10) : 0;
    const headIdxMatch = name.match(/h(\d+)/);
    const headIdx = headIdxMatch ? parseInt(headIdxMatch[1], 10) : 0;

    const LN = MATRIX_NAMES.layer(layerIdx);
    const HN = MATRIX_NAMES.head(layerIdx, headIdx);

    // Component Activation Logic
    const baseName = isInternal ? name.replace('.internal', '') : name;
    if (Object.values(MATRIX_NAMES.head(layerIdx, headIdx)).includes(baseName) || baseName === LN.mha_output || baseName === LN.Wo || baseName === LN.encoder_input) {
        activeComponent = 'mha';
    } else if (baseName === MATRIX_NAMES.inputEmbeddings || baseName === MATRIX_NAMES.posEncodings || baseName === MATRIX_NAMES.encoderInput) {
        activeComponent = 'input_embed';
    } else if (baseName === LN.add_norm_1_output) {
        activeComponent = 'add_norm_1';
    } else if (baseName === LN.add_norm_2_output) {
        activeComponent = 'add_norm_2';
    } else if (Object.values(LN).includes(baseName) && (baseName.includes('.ffn.') || baseName.includes('add_norm_1_output'))) {
         activeComponent = 'ffn';
    }

     // Backward Tracing Logic
    if (isInternal) {
        newTarget = { name, row, col, isInternal: true };
        if (baseName === HN.AttentionWeights) {
            newSources.push({ name: HN.ScaledScores, row, col: -1, highlightRow: true });
            newSources.push({ name, row, col: -1, isInternal: true });
        } else if (baseName === LN.Activated) {
            newSources.push({ name: LN.Intermediate, row, col });
        }
    } else if (name === MATRIX_NAMES.encoderInput) {
        newSources.push({ name: MATRIX_NAMES.inputEmbeddings, row, col });
        newSources.push({ name: MATRIX_NAMES.posEncodings, row, col });
    } else if (name === LN.encoder_input) {
        newSources.push({ name: layerIdx > 0 ? MATRIX_NAMES.layer(layerIdx - 1).add_norm_2_output : MATRIX_NAMES.encoderInput, row, col });
    } else if (name === HN.Q || name === HN.K || name === HN.V) {
        const type = name.split('.').pop()!;
        newSources.push({ name: LN.encoder_input, row, col: -1, highlightRow: true });
        newSources.push({ name: HN[`W${type.toLowerCase()}` as 'Wq'|'Wk'|'Wv'], row: -1, col, highlightCol: true });
    } else if (name === HN.Scores) {
        newSources.push({ name: HN.Q, row, col: -1, highlightRow: true });
        newSources.push({ name: HN.K, row: col, col: -1, highlightRow: true });
    } else if (name === HN.ScaledScores) {
        newSources.push({ name: HN.Scores, row, col });
    } else if (name === HN.AttentionWeights) {
        newSources.push({ name: HN.ScaledScores, row, col: -1, highlightRow: true });
        newSources.push({ name: `${HN.AttentionWeights}.internal`, row, col, isInternal: true });
    } else if (name === HN.HeadOutput) {
        newSources.push({ name: HN.AttentionWeights, row, col: -1, highlightRow: true });
        newSources.push({ name: HN.V, row: -1, col, highlightCol: true });
    } else if (name === LN.mha_output) {
        for (let h = 0; h < dims.h; h++) {
            newSources.push({ name: MATRIX_NAMES.head(layerIdx, h).HeadOutput, row, col: -1, highlightRow: true });
        }
        newSources.push({ name: LN.Wo, row: -1, col, highlightCol: true });
    } else if (name === LN.add_norm_1_output) {
        newSources.push({ name: LN.encoder_input, row, col: -1, highlightRow: true });
        newSources.push({ name: LN.mha_output, row, col: -1, highlightRow: true });
    } else if (name === LN.Intermediate || name === LN.Activated) {
        newSources.push({ name: LN.add_norm_1_output, row, col: -1, highlightRow: true });
        newSources.push({ name: LN.W1, row: -1, col, highlightCol: true });
        newSources.push({ name: LN.b1, row: 0, col });
        if (name === LN.Activated) {
             newSources.push({ name: `${LN.Activated}.internal`, row, col, isInternal: true });
        }
    } else if (name === LN.ffn_output) {
        newSources.push({ name: LN.Activated, row, col: -1, highlightRow: true });
        newSources.push({ name: LN.W2, row: -1, col, highlightCol: true });
        newSources.push({ name: LN.b2, row: 0, col });
    } else if (name === LN.add_norm_2_output) {
        newSources.push({ name: LN.add_norm_1_output, row, col: -1, highlightRow: true });
        newSources.push({ name: LN.ffn_output, row, col: -1, highlightRow: true });
    }

    return { target: newTarget, sources: newSources, activeComponent, activeResidual };
};

// Helper to create forward highlight state
const createForwardHighlight = (element: ElementIdentifier, transformerData: TransformerData, dims: any): HighlightState => {
    const { name, row, col } = element;
    let newDestinations: HighlightSource[] = [];
    let newSources: HighlightSource[] = [{...element}];
    let activeComponent: string | null = null;

    const layerIdxMatch = name.match(/encoder\.(\d+)/);
    const layerIdx = layerIdxMatch ? parseInt(layerIdxMatch[1], 10) : 0;
    const headIdxMatch = name.match(/h(\d+)/);
    const headIdx = headIdxMatch ? parseInt(headIdxMatch[1], 10) : 0;

    const LN = MATRIX_NAMES.layer(layerIdx);
    const HN = MATRIX_NAMES.head(layerIdx, headIdx);

    // Forward Tracing Logic
    if (name === MATRIX_NAMES.inputEmbeddings || name === MATRIX_NAMES.posEncodings) {
        newDestinations.push({ name: MATRIX_NAMES.encoderInput, row, col });
        activeComponent = 'input_embed';
    } else if (name === MATRIX_NAMES.encoderInput) {
        newDestinations.push({ name: LN.encoder_input, row, col });
        activeComponent = 'input_embed';
    } else if (name === LN.encoder_input) {
        newDestinations.push({ name: HN.Q, row, col: -1, highlightRow: true });
        newDestinations.push({ name: HN.K, row, col: -1, highlightRow: true });
        newDestinations.push({ name: HN.V, row, col: -1, highlightRow: true });
        newDestinations.push({ name: LN.add_norm_1_output, row, col });
        activeComponent = 'mha';
    } else if (name === HN.Q) {
        newDestinations.push({ name: HN.Scores, row, col: -1, highlightRow: true });
        activeComponent = 'mha';
    } else if (name === HN.K) {
        newDestinations.push({ name: HN.Scores, row: -1, col: row, highlightCol: true });
        activeComponent = 'mha';
    } else if (name === HN.V) {
        newDestinations.push({ name: HN.HeadOutput, row: -1, col, highlightCol: true });
        activeComponent = 'mha';
    }
    // ... and so on for all other matrices

    return { target: element, sources: [], destinations: newDestinations, activeComponent, activeResidual: null };
};


function App() {
  const [dims, setDims] = useState({
      d_model: 8,
      h: 2,
      seq_len: 3,
      n_layers: 1,
      d_ff: 32
  });
  const [highlight, setHighlight] = useState<HighlightState>({ target: null, sources: [], activeComponent: null, activeResidual: null });

  const transformerData: TransformerData | null = useTransformer(dims);

  useEffect(() => {
    if (highlight.activeComponent) {
      const explanationEl = document.getElementById(`math_${highlight.activeComponent}`);
      if (explanationEl) {
          setTimeout(() => {
              explanationEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }, 100);
      }
    }
  }, [highlight.activeComponent]);

  const handleElementClick = useCallback((element: ElementIdentifier) => {
      if (!transformerData) return;
      setHighlight(createBackwardHighlight(element, transformerData, dims, highlight));
  }, [transformerData, dims, highlight]);

  const handleSymbolClick = useCallback((element: ElementIdentifier) => {
    if (!transformerData) return;
    setHighlight(createForwardHighlight(element, transformerData, dims));
  }, [transformerData, dims]);

  if (!transformerData) {
      return <div>正在加载或维度设置无效... (d_model 必须能被 h 整除)</div>
  }

  return (
    <div className="app-container">
      <h1>终极 Transformer 深度探索器 (编码器篇)</h1>
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
                onSymbolClick={handleSymbolClick}
              />
           </div>
        </div>
      </div>
    </div>
  );
}

export default App

// END OF FILE: src/App.tsx