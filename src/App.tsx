// FILE: src/App.tsx
import React, { useState, useCallback, useEffect } from 'react';
import { Controls } from './components/Controls';
import { Viz } from './components/Viz';
import { Explanation } from './components/Explanation';
import { useTransformer } from './hooks/useTransformer';
import { ElementIdentifier, HighlightSource, HighlightState, TransformerData, TooltipState, Vector, Matrix } from './types';
import { MATRIX_NAMES } from './config/matrixNames';
import { getSymbolParts } from './config/symbolMapping';

const getLayerAndHeadIndices = (name: string): [number, number] => {
    const layerIdxMatch = name.match(/\.(encoder|decoder)\.(\d+)/);
    const layerIdx = layerIdxMatch ? parseInt(layerIdxMatch[2], 10) : 0;
    const headIdxMatch = name.match(/\.h(\d+)\./);
    const headIdx = headIdxMatch ? parseInt(headIdxMatch[1], 10) : 0;
    return [layerIdx, headIdx];
};

const getMatrixByName = (name: string, data: TransformerData, l: number, h: number): Matrix | undefined => {
    // This function is a simple helper to get matrix data by its string name.
    // A more robust solution might use a proper data store or a more complex lookup object.
    const LNe = MATRIX_NAMES.layer(l);
    const HNe = MATRIX_NAMES.head(l, h);
    const LNd = MATRIX_NAMES.decoderLayer(l);
    const HNd_masked = MATRIX_NAMES.maskedMhaHead(l, h);
    const HNd_encdec = MATRIX_NAMES.encDecMhaHead(l, h);

    if (name === MATRIX_NAMES.inputEmbeddings) return data.inputEmbeddings;
    if (name === MATRIX_NAMES.posEncodings) return data.posEncodings;
    if (name === LNe.encoder_input) return data.encoderLayers[l]?.encoder_input;
    if (name === HNe.Wq) return data.encoderLayers[l]?.mha.heads[h]?.Wq;
    if (name === HNe.Wk) return data.encoderLayers[l]?.mha.heads[h]?.Wk;
    if (name === HNe.Wv) return data.encoderLayers[l]?.mha.heads[h]?.Wv;
    if (name === HNe.Q) return data.encoderLayers[l]?.mha.heads[h]?.Q;
    if (name === HNe.K) return data.encoderLayers[l]?.mha.heads[h]?.K;
    if (name === LNd.add_norm_1_output) return data.decoderLayers[l]?.add_norm_1_output;
    if (name === HNd_encdec.Wq) return data.decoderLayers[l]?.enc_dec_mha.heads[h]?.Wq;
    if (name === HNd_encdec.Wk) return data.decoderLayers[l]?.enc_dec_mha.heads[h]?.Wk;
    if (name === HNd_encdec.Wv) return data.decoderLayers[l]?.enc_dec_mha.heads[h]?.Wv;
    if (name === MATRIX_NAMES.finalEncoderOutput) return data.finalEncoderOutput;
    // ... add more cases as needed for the tooltip
    return undefined;
}


const generateTooltipData = (element: ElementIdentifier, transformerData: TransformerData, sources: HighlightSource[], dims: any): TooltipState | null => {
    const { name, row, col } = element;
    const { d_model, h } = dims;

    const [layerIdx, headIdx] = getLayerAndHeadIndices(name);

    let opType: TooltipState['opType'] = 'info';
    let steps: TooltipState['steps'] = [];
    const targetValue = (transformerData as any)[name]?.[row]?.[col] ?? 0;

    // --- Matrix Multiplication ---
    if (sources.length === 2 && sources[0].highlightRow && sources[1].highlightCol) {
        opType = 'matmul';
        const source1 = sources[0];
        const source2 = sources[1];

        const matrixA = getMatrixByName(source1.name, transformerData, layerIdx, headIdx);
        const matrixB = getMatrixByName(source2.name, transformerData, layerIdx, headIdx);

        if (matrixA && matrixB) {
            const vecA = matrixA[source1.row];
            const vecB = matrixB.map(r => r[source2.col]);
            steps.push({
                a: vecA,
                b: vecB,
                op: '·',
                result: targetValue,
                aSymbol: getSymbolParts(source1.name).base,
                bSymbol: getSymbolParts(source2.name).base,
            });
        }
    }
    // --- Element-wise Addition ---
    else if (sources.length === 2 && !sources[0].highlightRow && !sources[1].highlightRow) {
        opType = 'add';
        const source1 = sources[0];
        const source2 = sources[1];

        const matrixA = getMatrixByName(source1.name, transformerData, layerIdx, headIdx);
        const matrixB = getMatrixByName(source2.name, transformerData, layerIdx, headIdx);

        if (matrixA && matrixB) {
            steps.push({
                a: [matrixA[source1.row][source1.col]],
                b: [matrixB[source2.row][source2.col]],
                op: '+',
                result: targetValue,
                aSymbol: getSymbolParts(source1.name).base,
                bSymbol: getSymbolParts(source2.name).base,
            });
        }
    }
    // ... other cases can be added here (softmax, layernorm, etc.)

    if (steps.length === 0) return null; // No calculation to show

    return {
        target: element,
        opType,
        steps,
        title: `Calculation for ${getSymbolParts(name).base}[${row},${col}]`,
    };
};


const createBackwardHighlight = (element: ElementIdentifier, transformerData: TransformerData, dims: any): { highlight: HighlightState, tooltip: TooltipState | null } => {
    const { name, row, col, isInternal } = element;
    let newSources: HighlightSource[] = [];
    let newTarget: ElementIdentifier | null = element;
    let activeComponent: string | null = null;
    let activeResidual: string | null = null;

    if (name.startsWith('residual.')) {
        const [, resId] = name.split('.');
        activeResidual = resId;
        const layerIdx = parseInt(resId.match(/l(\d+)/)?.[1] || '0', 10);
        const part = parseInt(resId.match(/(\d+)$/)?.[1] || '1', 10);

        if (resId.includes('-d')) {
            const LN = MATRIX_NAMES.decoderLayer(layerIdx);
            if(part === 1) { activeComponent = 'add_norm_1_dec'; newSources.push({ name: LN.decoder_input, row: -1, col: -1, highlightRow: true, highlightCol: true }); newSources.push({ name: LN.masked_mha_output, row: -1, col: -1, highlightRow: true, highlightCol: true }); }
            else if (part === 2) { activeComponent = 'add_norm_2_dec'; newSources.push({ name: LN.add_norm_1_output, row: -1, col: -1, highlightRow: true, highlightCol: true }); newSources.push({ name: LN.enc_dec_mha_output, row: -1, col: -1, highlightRow: true, highlightCol: true }); }
            else if (part === 3) { activeComponent = 'add_norm_3_dec'; newSources.push({ name: LN.add_norm_2_output, row: -1, col: -1, highlightRow: true, highlightCol: true }); newSources.push({ name: LN.ffn_output, row: -1, col: -1, highlightRow: true, highlightCol: true }); }
        } else {
            const LN = MATRIX_NAMES.layer(layerIdx);
            if (part === 1) { activeComponent = 'add_norm_1'; newSources.push({ name: LN.encoder_input, row: -1, col: -1, highlightRow: true, highlightCol: true }); newSources.push({ name: LN.mha_output, row: -1, col: -1, highlightRow: true, highlightCol: true }); }
            else if (part === 2) { activeComponent = 'add_norm_2'; newSources.push({ name: LN.add_norm_1_output, row: -1, col: -1, highlightRow: true, highlightCol: true }); newSources.push({ name: LN.ffn_output, row: -1, col: -1, highlightRow: true, highlightCol: true }); }
        }
        return { highlight: { target: null, sources: newSources, activeComponent, activeResidual, destinations: [] }, tooltip: null };
    }

    const [layerIdx, headIdx] = getLayerAndHeadIndices(name);
    const LNe = MATRIX_NAMES.layer(layerIdx);
    const HNe = MATRIX_NAMES.head(layerIdx, headIdx);
    const LNd = MATRIX_NAMES.decoderLayer(layerIdx);
    const HNd_masked = MATRIX_NAMES.maskedMhaHead(layerIdx, headIdx);
    const HNd_encdec = MATRIX_NAMES.encDecMhaHead(layerIdx, headIdx);

    const baseName = isInternal ? name.replace('.internal', '') : name;
    if (name.startsWith('encoder')) {
        if(Object.values(HNe).includes(baseName) || [LNe.mha_output, LNe.Wo, LNe.encoder_input].includes(baseName)) activeComponent = 'mha';
        else if([LNe.add_norm_1_output].includes(baseName)) activeComponent = 'add_norm_1';
        else if([LNe.add_norm_2_output].includes(baseName)) activeComponent = 'add_norm_2';
        else if(baseName.includes('.ffn.')) activeComponent = 'ffn';
    } else if (name.startsWith('decoder')) {
        if(Object.values(HNd_masked).includes(baseName) || [LNd.masked_mha_output, LNd.Wo_masked, LNd.decoder_input].includes(baseName)) activeComponent = 'masked_mha';
        else if(Object.values(HNd_encdec).includes(baseName) || [LNd.enc_dec_mha_output, LNd.Wo_enc_dec, LNd.add_norm_1_output, MATRIX_NAMES.finalEncoderOutput].includes(baseName)) activeComponent = 'enc_dec_mha';
        else if(baseName === LNd.add_norm_1_output) activeComponent = 'add_norm_1_dec';
        else if(baseName === LNd.add_norm_2_output) activeComponent = 'add_norm_2_dec';
        else if(baseName === LNd.add_norm_3_output) activeComponent = 'add_norm_3_dec';
        else if(baseName.includes('.ffn.')) activeComponent = 'ffn_dec';
    } else if (name === 'inputToken' || name === 'embeddingMatrix' || name === 'inputEmbeddings') {
        activeComponent = 'token_embed';
    } else if ([MATRIX_NAMES.posEncodings, MATRIX_NAMES.encoderInput].includes(baseName) || baseName === LNe.encoder_input) {
        activeComponent = 'input_embed';
    } else if ([MATRIX_NAMES.outputEmbeddings, MATRIX_NAMES.decoderPosEncodings, MATRIX_NAMES.decoderInput].includes(baseName) || baseName === LNd.decoder_input) {
        activeComponent = 'output_embed';
    } else if ([MATRIX_NAMES.finalLinear, MATRIX_NAMES.logits].includes(baseName)) {
        activeComponent = 'final_output';
    } else if (name === 'outputProbabilities' || name === 'outputToken') {
        activeComponent = 'decoding';
    }

    if (isInternal) {
        newTarget = { name, row, col, isInternal: true };
        if (baseName.includes('AttentionWeights')) {
            const scaledScoresName = baseName.includes('masked_mha') ? HNd_masked.ScaledScores : baseName.includes('enc_dec_mha') ? HNd_encdec.ScaledScores : HNe.ScaledScores;
            newSources.push({ name: scaledScoresName, row, col: -1, highlightRow: true });
            newSources.push({ name, row, col: -1, isInternal: true });
        } else if (baseName.includes('Activated')) {
            const intermediateName = baseName.includes('decoder') ? LNd.Intermediate : LNe.Intermediate;
            newSources.push({ name: intermediateName, row, col });
        }
    }
    // --- Input ---
    else if (name === 'inputToken') { newSources.push({ name: MATRIX_NAMES.inputEmbeddings, row, col: -1, highlightRow: true }) }
    else if (name === MATRIX_NAMES.inputEmbeddings) { newSources.push({ name: 'inputToken', row, col: -1 }); newSources.push({ name: 'embeddingMatrix', row: transformerData.tokenizedInput[row], col: -1, highlightRow: true }) }
    // --- Encoder ---
    else if (name === LNe.encoder_input) {
        if (layerIdx === 0) {
            newSources.push({ name: MATRIX_NAMES.inputEmbeddings, row, col });
            newSources.push({ name: MATRIX_NAMES.posEncodings, row, col });
        } else {
            newSources.push({ name: MATRIX_NAMES.layer(layerIdx - 1).add_norm_2_output, row, col });
        }
    }
    else if (name === HNe.Q || name === HNe.K || name === HNe.V) { const type = name.split('.').pop()!; newSources.push({ name: LNe.encoder_input, row, col: -1, highlightRow: true }); newSources.push({ name: HNe[`W${type.toLowerCase()}` as 'Wq'|'Wk'|'Wv'], row: -1, col, highlightCol: true }); }
    else if (name === HNe.Scores) { newSources.push({ name: HNe.Q, row, col: -1, highlightRow: true }); newSources.push({ name: HNe.K, row: col, col: -1, highlightRow: true }); }
    else if (name === HNe.ScaledScores) { newSources.push({ name: HNe.Scores, row, col }); }
    else if (name === HNe.AttentionWeights) { newSources.push({ name: HNe.ScaledScores, row, col: -1, highlightRow: true }); newSources.push({ name: `${HNe.AttentionWeights}.internal`, row, col, isInternal: true }); }
    else if (name === HNe.HeadOutput) { newSources.push({ name: HNe.AttentionWeights, row, col: -1, highlightRow: true }); newSources.push({ name: HNe.V, row: -1, col, highlightCol: true }); }
    else if (name === LNe.mha_output) { for (let h = 0; h < dims.h; h++) newSources.push({ name: MATRIX_NAMES.head(layerIdx, h).HeadOutput, row, col: -1, highlightRow: true }); newSources.push({ name: LNe.Wo, row: -1, col, highlightCol: true }); }
    else if (name === LNe.add_norm_1_output) { newSources.push({ name: LNe.encoder_input, row, col }); newSources.push({ name: LNe.mha_output, row, col }); }
    else if (name === LNe.Intermediate || name === LNe.Activated) { newSources.push({ name: LNe.add_norm_1_output, row, col: -1, highlightRow: true }); newSources.push({ name: LNe.W1, row: -1, col, highlightCol: true }); newSources.push({ name: LNe.b1, row: 0, col }); if (name === LNe.Activated) newSources.push({ name: `${LNe.Activated}.internal`, row, col, isInternal: true }); }
    else if (name === LNe.ffn_output) { newSources.push({ name: LNe.Activated, row, col: -1, highlightRow: true }); newSources.push({ name: LNe.W2, row: -1, col, highlightCol: true }); newSources.push({ name: LNe.b2, row: 0, col }); }
    else if (name === LNe.add_norm_2_output) { newSources.push({ name: LNe.add_norm_1_output, row, col }); newSources.push({ name: LNe.ffn_output, row, col }); }
    // --- Decoder ---
    else if (name === LNd.decoder_input) {
        if (layerIdx === 0) {
            newSources.push({ name: MATRIX_NAMES.outputEmbeddings, row, col });
            newSources.push({ name: MATRIX_NAMES.decoderPosEncodings, row, col });
        } else {
            newSources.push({ name: MATRIX_NAMES.decoderLayer(layerIdx - 1).add_norm_3_output, row, col });
        }
    }
    // Masked MHA
    else if (name === HNd_masked.Q || name === HNd_masked.K || name === HNd_masked.V) { const type = name.split('.').pop()!; newSources.push({ name: LNd.decoder_input, row, col: -1, highlightRow: true }); newSources.push({ name: HNd_masked[`W${type.toLowerCase()}` as 'Wq'|'Wk'|'Wv'], row: -1, col, highlightCol: true }); }
    else if (name === HNd_masked.Scores) { newSources.push({ name: HNd_masked.Q, row, col: -1, highlightRow: true }); newSources.push({ name: HNd_masked.K, row: col, col: -1, highlightRow: true }); }
    else if (name === HNd_masked.ScaledScores) { newSources.push({ name: HNd_masked.Scores, row, col }); }
    else if (name === HNd_masked.AttentionWeights) { newSources.push({ name: HNd_masked.ScaledScores, row, col: -1, highlightRow: true }); newSources.push({ name: `${HNd_masked.AttentionWeights}.internal`, row, col, isInternal: true }); }
    else if (name === HNd_masked.HeadOutput) { newSources.push({ name: HNd_masked.AttentionWeights, row, col: -1, highlightRow: true }); newSources.push({ name: HNd_masked.V, row: -1, col, highlightCol: true }); }
    else if (name === LNd.masked_mha_output) { for (let h = 0; h < dims.h; h++) newSources.push({ name: MATRIX_NAMES.maskedMhaHead(layerIdx, h).HeadOutput, row, col: -1, highlightRow: true }); newSources.push({ name: LNd.Wo_masked, row: -1, col, highlightCol: true }); }
    else if (name === LNd.add_norm_1_output) { newSources.push({ name: LNd.decoder_input, row, col }); newSources.push({ name: LNd.masked_mha_output, row, col }); }
    // Encoder-Decoder MHA
    else if (name === HNd_encdec.Q) { newSources.push({ name: LNd.add_norm_1_output, row, col: -1, highlightRow: true }); newSources.push({ name: HNd_encdec.Wq, row: -1, col, highlightCol: true }); }
    else if (name === HNd_encdec.K) { newSources.push({ name: MATRIX_NAMES.finalEncoderOutput, row, col: -1, highlightRow: true }); newSources.push({ name: HNd_encdec.Wk, row: -1, col, highlightCol: true }); }
    else if (name === HNd_encdec.V) { newSources.push({ name: MATRIX_NAMES.finalEncoderOutput, row, col: -1, highlightRow: true }); newSources.push({ name: HNd_encdec.Wv, row: -1, col, highlightCol: true }); }
    else if (name === HNd_encdec.Scores) { newSources.push({ name: HNd_encdec.Q, row, col: -1, highlightRow: true }); newSources.push({ name: HNd_encdec.K, row: col, col: -1, highlightRow: true }); }
    else if (name === HNd_encdec.ScaledScores) { newSources.push({ name: HNd_encdec.Scores, row, col }); }
    else if (name === HNd_encdec.AttentionWeights) { newSources.push({ name: HNd_encdec.ScaledScores, row, col: -1, highlightRow: true }); newSources.push({ name: `${HNd_encdec.AttentionWeights}.internal`, row, col, isInternal: true }); }
    else if (name === HNd_encdec.HeadOutput) { newSources.push({ name: HNd_encdec.AttentionWeights, row, col: -1, highlightRow: true }); newSources.push({ name: HNd_encdec.V, row: -1, col, highlightCol: true }); }
    else if (name === LNd.enc_dec_mha_output) { for (let h = 0; h < dims.h; h++) newSources.push({ name: MATRIX_NAMES.encDecMhaHead(layerIdx, h).HeadOutput, row, col: -1, highlightRow: true }); newSources.push({ name: LNd.Wo_enc_dec, row: -1, col, highlightCol: true }); }
    else if (name === LNd.add_norm_2_output) { newSources.push({ name: LNd.add_norm_1_output, row, col }); newSources.push({ name: LNd.enc_dec_mha_output, row, col }); }
    // Decoder FFN
    else if (name === LNd.Intermediate || name === LNd.Activated) { newSources.push({ name: LNd.add_norm_2_output, row, col: -1, highlightRow: true }); newSources.push({ name: LNd.W1, row: -1, col, highlightCol: true }); newSources.push({ name: LNd.b1, row: 0, col }); if (name === LNd.Activated) newSources.push({ name: `${LNd.Activated}.internal`, row, col, isInternal: true }); }
    else if (name === LNd.ffn_output) { newSources.push({ name: LNd.Activated, row, col: -1, highlightRow: true }); newSources.push({ name: LNd.W2, row: -1, col, highlightCol: true }); newSources.push({ name: LNd.b2, row: 0, col }); }
    else if (name === LNd.add_norm_3_output) { newSources.push({ name: LNd.add_norm_2_output, row, col }); newSources.push({ name: LNd.ffn_output, row, col }); }
    // --- Final Output ---
    else if (name === MATRIX_NAMES.logits) { newSources.push({ name: MATRIX_NAMES.decoderLayer(dims.n_layers - 1).add_norm_3_output, row, col: -1, highlightRow: true}); newSources.push({name: MATRIX_NAMES.finalLinear, row: -1, col, highlightCol: true})}
    else if (name === MATRIX_NAMES.outputProbabilities) { newSources.push({name: MATRIX_NAMES.logits, row, col: -1, highlightRow: true})}
    else if (name === 'outputToken') { newSources.push({ name: 'outputProbabilities', row, col: -1, highlightRow: true }) }

    const highlight = { target: newTarget, sources: newSources, activeComponent, activeResidual, destinations: [] };
    const tooltip = generateTooltipData(element, transformerData, newSources, dims);

    return { highlight, tooltip };
};

function App() {
  const [dims, setDims] = useState({ d_model: 8, h: 2, seq_len: 2, n_layers: 1, d_ff: 32 });
  const [highlight, setHighlight] = useState<HighlightState>({ target: null, sources: [], destinations: [], activeComponent: null, activeResidual: null });
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const [isControlsVisible, setIsControlsVisible] = useState(false);

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

  const handleInteraction = useCallback((element: ElementIdentifier) => {
    if (!transformerData) return;
    const { highlight: newHighlight, tooltip: newTooltip } = createBackwardHighlight(element, transformerData, dims);
    setHighlight(newHighlight);
    setTooltip(newTooltip);
  }, [transformerData, dims]);

  const handleComponentClick = useCallback((componentId: string) => {
      // Set the active component for scrolling, but clear specific target/source highlights
      setHighlight(prev => ({
          target: null,
          sources: [],
          destinations: [],
          activeComponent: componentId,
          activeResidual: null
      }));
      setTooltip(null);
  }, []);

  const closeTooltip = useCallback(() => setTooltip(null), []);

  if (!transformerData) {
      return <div>正在加载或维度设置无效... (d_model 必须能被 h 整除)</div>
  }

  return (
    <div className="app-container">
      <h1>Transformer 深度探索器 (V6)</h1>
      <div className="main-layout">
        <div className={`controls-panel ${!isControlsVisible ? 'collapsed' : ''}`}>
             <button className="controls-toggle-btn" onClick={() => setIsControlsVisible(!isControlsVisible)}>
                {isControlsVisible ? '×' : '⚙️'}
            </button>
            <Controls dims={dims} setDims={setDims} />
        </div>
        <div className="column left-column">
          <div className="column-content">
              <h2>模型结构与数据流</h2>
              <Viz
                data={transformerData}
                highlight={highlight}
                onElementClick={handleInteraction} // Unified handler
                onComponentClick={handleComponentClick}
                tooltip={tooltip}
                closeTooltip={closeTooltip}
              />
          </div>
        </div>
        <div className="column right-column">
           <div className="column-content">
              <h2>数学原理详解</h2>
              <Explanation
                dims={dims}
                highlight={highlight}
                onSymbolClick={handleInteraction} // Unified handler
              />
           </div>
        </div>
      </div>
    </div>
  );
}

export default App;
// END OF FILE: src/App.tsx