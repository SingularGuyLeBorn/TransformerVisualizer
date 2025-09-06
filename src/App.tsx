// FILE: src/App.tsx
import React, { useState, useCallback, useEffect } from 'react';
import { Controls } from './components/Controls';
import { Viz } from './components/Viz';
import { Explanation } from './components/Explanation';
import { useTransformer } from './hooks/useTransformer';
import { ElementIdentifier, HighlightSource, HighlightState, TransformerData, TooltipState, Vector, Matrix, CalculationComponent, OpType, CalculationStep } from './types';
import { MATRIX_NAMES } from './config/matrixNames';
import { getSymbolParts } from './config/symbolMapping';
import { CalculationTooltip } from "./components/CalculationTooltip";

const getLayerAndHeadIndices = (name: string): [number, number] => {
    const layerIdxMatch = name.match(/\.(encoder|decoder)\.(\d+)/);
    const layerIdx = layerIdxMatch ? parseInt(layerIdxMatch[2], 10) : 0;
    const headIdxMatch = name.match(/\.h(\d+)\./);
    const headIdx = headIdxMatch ? parseInt(headIdxMatch[1], 10) : 0;
    return [layerIdx, headIdx];
};

const getMatrixByName = (name: string, data: TransformerData, l: number, h: number): Matrix | undefined => {
    const LNe = MATRIX_NAMES.layer(l);
    const HNe = MATRIX_NAMES.head(l, h);
    const LNd = MATRIX_NAMES.decoderLayer(l);
    const HNd_masked = MATRIX_NAMES.maskedMhaHead(l, h);
    const HNd_encdec = MATRIX_NAMES.encDecMhaHead(l, h);

    if (name === MATRIX_NAMES.inputEmbeddings) return data.inputEmbeddings;
    if (name === MATRIX_NAMES.posEncodings) return data.posEncodings;
    if (name === MATRIX_NAMES.outputEmbeddings) return data.outputEmbeddings;
    if (name === MATRIX_NAMES.decoderPosEncodings) return data.decoderPosEncodings;
    if (name === MATRIX_NAMES.finalEncoderOutput) return data.finalEncoderOutput;
    if (name === MATRIX_NAMES.finalLinear) return data.finalLinear;

    const encLayer = data.encoderLayers[l];
    if (encLayer) {
        if (name === LNe.encoder_input) return encLayer.encoder_input;
        if (name === LNe.mha_output) return encLayer.mha_output;
        if (name === LNe.add_norm_1_output) return encLayer.add_norm_1_output;
        if (name === LNe.ffn_output) return encLayer.ffn_output;
        if (name === LNe.add_norm_2_output) return encLayer.add_norm_2_output;
        if (name === LNe.Intermediate) return encLayer.ffn.Intermediate;
        if (name === LNe.Activated) return encLayer.ffn.Activated;
        if (name === LNe.W1) return encLayer.ffn.W1; if (name === LNe.b1) return [encLayer.ffn.b1];
        if (name === LNe.W2) return encLayer.ffn.W2; if (name === LNe.b2) return [encLayer.ffn.b2];
        if (name === LNe.Wo) return encLayer.mha.Wo;

        const encHead = encLayer.mha.heads[h];
        if (encHead) {
            if (name === HNe.Wq) return encHead.Wq; if (name === HNe.Wk) return encHead.Wk; if (name === HNe.Wv) return encHead.Wv;
            if (name === HNe.Q) return encHead.Q; if (name === HNe.K) return encHead.K; if (name === HNe.V) return encHead.V;
            if (name === HNe.Scores) return encHead.Scores; if (name === HNe.ScaledScores) return encHead.ScaledScores;
            if (name === HNe.AttentionWeights) return encHead.AttentionWeights; if (name === HNe.HeadOutput) return encHead.HeadOutput;
        }
    }
    const decLayer = data.decoderLayers[l];
    if (decLayer) {
        if (name === LNd.decoder_input) return decLayer.decoder_input;
        if (name === LNd.masked_mha_output) return decLayer.masked_mha_output;
        if (name === LNd.add_norm_1_output) return decLayer.add_norm_1_output;
        if (name === LNd.enc_dec_mha_output) return decLayer.enc_dec_mha_output;
        if (name === LNd.add_norm_2_output) return decLayer.add_norm_2_output;
        if (name === LNd.ffn_output) return decLayer.ffn_output;
        if (name === LNd.add_norm_3_output) return decLayer.add_norm_3_output;
        if (name === LNd.Intermediate) return decLayer.ffn.Intermediate;
        if (name === LNd.Activated) return decLayer.ffn.Activated;
        if (name === LNd.W1) return decLayer.ffn.W1; if (name === LNd.b1) return [decLayer.ffn.b1];
        if (name === LNd.W2) return decLayer.ffn.W2; if (name === LNd.b2) return [decLayer.ffn.b2];
        if (name === LNd.Wo_masked) return decLayer.masked_mha.Wo;
        if (name === LNd.Wo_enc_dec) return decLayer.enc_dec_mha.Wo;

        const maskedMhaHead = decLayer.masked_mha.heads[h];
        if (maskedMhaHead) {
            if (name === HNd_masked.Wq) return maskedMhaHead.Wq; if (name === HNd_masked.Wk) return maskedMhaHead.Wk; if (name === HNd_masked.Wv) return maskedMhaHead.Wv;
            if (name === HNd_masked.Q) return maskedMhaHead.Q; if (name === HNd_masked.K) return maskedMhaHead.K; if (name === HNd_masked.V) return maskedMhaHead.V;
            if (name === HNd_masked.Scores) return maskedMhaHead.Scores; if (name === HNd_masked.ScaledScores) return maskedMhaHead.ScaledScores;
            if (name === HNd_masked.AttentionWeights) return maskedMhaHead.AttentionWeights; if (name === HNd_masked.HeadOutput) return maskedMhaHead.HeadOutput;
        }
        const encDecMhaHead = decLayer.enc_dec_mha.heads[h];
        if (encDecMhaHead) {
            if (name === HNd_encdec.Wq) return encDecMhaHead.Wq; if (name === HNd_encdec.Wk) return encDecMhaHead.Wk; if (name === HNd_encdec.Wv) return encDecMhaHead.Wv;
            if (name === HNd_encdec.Q) return encDecMhaHead.Q; if (name === HNd_encdec.K) return encDecMhaHead.K; if (name === HNd_encdec.V) return encDecMhaHead.V;
            if (name === HNd_encdec.Scores) return encDecMhaHead.Scores; if (name === HNd_encdec.ScaledScores) return encDecMhaHead.ScaledScores;
            if (name === HNd_encdec.AttentionWeights) return encDecMhaHead.AttentionWeights; if (name === HNd_encdec.HeadOutput) return encDecMhaHead.HeadOutput;
        }
    }
    return undefined;
}


const generateTooltipData = (element: ElementIdentifier, transformerData: TransformerData, sources: HighlightSource[], dims: any): TooltipState | null => {
    const { name, row, col } = element;
    const { d_model, h } = dims;
    const d_k = d_model / h;
    const [layerIdx, headIdx] = getLayerAndHeadIndices(name);

    let opType: OpType = 'info';
    let steps: CalculationStep[] = [];
    const targetMatrix = getMatrixByName(name, transformerData, layerIdx, headIdx);
    const targetValue = targetMatrix?.[row]?.[col] ?? 0;

    const baseName = name.split('.').pop() || '';

    // --- Add & Norm ---
    if (baseName.startsWith('add_norm')) {
        opType = 'layernorm';
        const [source1, source2] = sources;
        const matrixA = getMatrixByName(source1.name, transformerData, layerIdx, headIdx);
        const matrixB = getMatrixByName(source2.name, transformerData, layerIdx, headIdx);
        if (!matrixA || !matrixB) return null;

        const valA = matrixA[row][col];
        const valB = matrixB[row][col];
        const sumVal = valA + valB;
        steps.push({ description: "1. Add", a: [valA], b: [valB], op: "+", result: sumVal });

        const preNormRow = matrixA[row].map((v, i) => v + matrixB[row][i]);
        const mean = preNormRow.reduce((a, b) => a + b, 0) / preNormRow.length;
        const variance = preNormRow.map(x => (x - mean) ** 2).reduce((a, b) => a + b, 0) / preNormRow.length;
        const std = Math.sqrt(variance + 1e-5);

        steps.push({ description: "2. Calculate Mean of summed row", op: "Mean", a: preNormRow, result: mean });
        steps.push({ description: "3. Calculate Std Dev of summed row", op: "StdDev", a: preNormRow, result: std });
        steps.push({ description: `4. Normalize: (Sum - Mean) / StdDev`, op: `(${sumVal.toFixed(2)} - ${mean.toFixed(2)}) / ${std.toFixed(2)}`, result: targetValue });
    }
    // --- Matmul + Bias ---
    else if (sources.length === 3) {
        opType = 'matmul_bias';
        const [srcMat, srcWeight, srcBias] = sources;
        const matrixA = getMatrixByName(srcMat.name, transformerData, layerIdx, headIdx);
        const matrixB = getMatrixByName(srcWeight.name, transformerData, layerIdx, headIdx);
        const biasVec = getMatrixByName(srcBias.name, transformerData, layerIdx, headIdx)?.[0];
        if (!matrixA || !matrixB || !biasVec) return null;

        const vecA = matrixA[srcMat.row];
        const vecB = matrixB.map(r => r[srcWeight.col]);
        const dotProduct = vecA.reduce((sum, val, i) => sum + val * vecB[i], 0);
        steps.push({ description: "1. Dot Product", a: vecA, b: vecB, op: "·", result: dotProduct, components: vecA.map((val, i) => ({ a: val, b: vecB[i] })) });

        const bias = biasVec[srcBias.col];
        steps.push({ description: "2. Add Bias", a: [dotProduct], b: [bias], op: "+", result: targetValue });
    }
    // --- Matmul (Standard or Transposed) ---
    else if (sources.length === 2 && sources[0].highlightRow && (sources[1].highlightCol || sources[1].highlightRow)) {
        opType = 'matmul';
        const [source1, source2] = sources;
        const matrixA = getMatrixByName(source1.name, transformerData, layerIdx, headIdx);
        const matrixB = getMatrixByName(source2.name, transformerData, layerIdx, headIdx);
        if (!matrixA || !matrixB) return null;

        const vecA = matrixA[source1.row];
        let vecB: Vector | undefined;
        if (source2.highlightCol) vecB = matrixB.map(r => r[source2.col]); // A * B
        else if (source2.highlightRow) vecB = matrixB[source2.row]; // A * B^T

        if (vecA && vecB) {
            steps.push({ a: vecA, b: vecB, op: '·', result: targetValue, components: vecA.map((val, i) => ({ a: val, b: vecB![i] })) });
        }
    }
    // --- Scaling ---
    else if (baseName === 'ScaledScores') {
        opType = 'scale';
        const sourceMatrix = getMatrixByName(sources[0].name, transformerData, layerIdx, headIdx);
        if (!sourceMatrix) return null;
        const sourceVal = sourceMatrix[row][col];
        const scaleFactor = Math.sqrt(d_k);
        steps.push({ description: `Scale by 1/√dₖ (dₖ=${d_k})`, a: [sourceVal], b: [scaleFactor], op: "/", result: targetValue });
    }
    // --- ReLU ---
    else if (baseName === 'Activated') {
        opType = 'relu';
        const sourceMatrix = getMatrixByName(sources[0].name, transformerData, layerIdx, headIdx);
        if (!sourceMatrix) return null;
        const sourceVal = sourceMatrix[row][col];
        steps.push({ description: "Apply ReLU: max(0, x)", op: `max(0, ${sourceVal.toFixed(2)})`, result: targetValue });
    }
     // --- Softmax ---
    else if (baseName === 'AttentionWeights' || baseName === 'outputProbabilities') {
        opType = 'softmax';
        const sourceMatrix = getMatrixByName(sources[0].name, transformerData, layerIdx, headIdx);
        if (!sourceMatrix) return null;
        const sourceRow = sourceMatrix[row];
        const maxVal = Math.max(...sourceRow.filter(v => isFinite(v)));
        const exps = sourceRow.map(val => isFinite(val) ? Math.exp(val - maxVal) : 0);
        const sumExps = exps.reduce((a, b) => a + b, 0);

        steps.push({ description: "1. Input Row", op: "Row", result: sourceRow });
        steps.push({ description: `2. Exponentiate: exp(x - max)`, op: `exp(${sourceRow[col].toFixed(2)} - ${maxVal.toFixed(2)})`, result: exps[col] });
        steps.push({ description: `3. Sum all exponentiated values`, op: `Sum`, result: sumExps });
        steps.push({ description: `4. Normalize: exp / sum`, op: `${exps[col].toFixed(2)} / ${sumExps.toFixed(2)}`, result: targetValue });
    }


    if (steps.length === 0) return null;

    return { target: element, opType, steps, title: `Calculation for ${getSymbolParts(name).base}[${row},${col}]`, initialPosition: { x: 0, y: 0 } };
};


const createBackwardHighlight = (element: ElementIdentifier, transformerData: TransformerData, dims: any): { highlight: HighlightState } => {
    const { name, row, col } = element;
    let newSources: HighlightSource[] = [];
    let newTarget: ElementIdentifier | null = element;
    let activeComponent: string | null = null;
    let activeResidual: string | null = null;

    const [layerIdx] = getLayerAndHeadIndices(name);
    const LNe = MATRIX_NAMES.layer(layerIdx);
    const LNd = MATRIX_NAMES.decoderLayer(layerIdx);

    if (name.includes('mha')) activeComponent = name.includes('masked') ? 'masked_mha' : name.includes('enc_dec') ? 'enc_dec_mha' : 'mha';
    else if (name.includes('ffn')) activeComponent = name.includes('decoder') ? 'ffn_dec' : 'ffn';
    else if (name.includes('add_norm_1')) activeComponent = name.includes('decoder') ? 'add_norm_1_dec' : 'add_norm_1';
    else if (name.includes('add_norm_2')) activeComponent = name.includes('decoder') ? 'add_norm_2_dec' : 'add_norm_2';
    else if (name.includes('add_norm_3')) activeComponent = 'add_norm_3_dec';
    else if (['inputToken', 'embeddingMatrix', 'inputEmbeddings'].includes(name)) activeComponent = 'token_embed';
    else if ([LNe.encoder_input, MATRIX_NAMES.posEncodings].includes(name)) activeComponent = 'input_embed';
    else if ([LNd.decoder_input, MATRIX_NAMES.outputEmbeddings, MATRIX_NAMES.decoderPosEncodings].includes(name)) activeComponent = 'output_embed';
    else if ([MATRIX_NAMES.finalLinear, MATRIX_NAMES.logits, MATRIX_NAMES.outputProbabilities].includes(name)) activeComponent = 'final_output';
    else if (name === 'outputToken') activeComponent = 'decoding';


    if (name.endsWith('.Q') || name.endsWith('.K') || name.endsWith('.V')) {
        const type = name.split('.').pop()!;
        let mhaInput: string;
        if (name.includes('enc_dec_mha')) {
            // [FIXED] K and V come from the encoder, Q from the decoder.
            mhaInput = (type === 'K' || type === 'V') ? MATRIX_NAMES.finalEncoderOutput : LNd.add_norm_1_output;
        } else {
            mhaInput = name.includes('decoder') ? LNd.decoder_input : LNe.encoder_input;
        }
        const W_matrix = name.replace(`.${type}`, `.W${type.toLowerCase()}`);
        newSources.push({ name: mhaInput, row, col: -1, highlightRow: true });
        newSources.push({ name: W_matrix, row: -1, col, highlightCol: true });
    } else if (name.endsWith('.Scores')) {
        const Q_matrix = name.replace('.Scores', '.Q');
        const K_matrix = name.replace('.Scores', '.K');
        newSources.push({ name: Q_matrix, row, col: -1, highlightRow: true });
        newSources.push({ name: K_matrix, row: col, col: -1, highlightRow: true });
    } else if (name.endsWith('.ScaledScores')) {
        newSources.push({ name: name.replace('.ScaledScores', '.Scores'), row, col });
    } else if (name.endsWith('.AttentionWeights')) {
        newSources.push({ name: name.replace('.AttentionWeights', '.ScaledScores'), row, col: -1, highlightRow: true });
    } else if (name.endsWith('.HeadOutput')) {
        newSources.push({ name: name.replace('.HeadOutput', '.AttentionWeights'), row, col: -1, highlightRow: true });
        newSources.push({ name: name.replace('.HeadOutput', '.V'), row: -1, col, highlightCol: true });
    } else if (name.endsWith('.mha.output')) {
        // [FIXED] Correctly construct Wo and HeadOutput names
        const base = name.substring(0, name.lastIndexOf('.'));
        const Wo_matrix = `${base}.Wo`;
        for (let h = 0; h < dims.h; h++) {
            newSources.push({ name: `${base}.h${h}.HeadOutput`, row, col: -1, highlightRow: true });
        }
        newSources.push({ name: Wo_matrix, row: -1, col, highlightCol: true });
    } else if (name.endsWith('.ffn.Intermediate')) {
        const ffnInput = name.includes('decoder') ? LNd.add_norm_2_output : LNe.add_norm_1_output;
        const W1_matrix = name.replace('.Intermediate', '.W1');
        const b1_vec = name.replace('.Intermediate', '.b1');
        newSources.push({ name: ffnInput, row, col: -1, highlightRow: true });
        newSources.push({ name: W1_matrix, row: -1, col, highlightCol: true });
        newSources.push({ name: b1_vec, row: 0, col });
    } else if (name.endsWith('.ffn.Activated')) {
        newSources.push({ name: name.replace('.Activated', '.Intermediate'), row, col });
    } else if (name.endsWith('.ffn.output')) {
        const W2_matrix = name.replace('.output', '.W2');
        const b2_vec = name.replace('.output', '.b2');
        newSources.push({ name: name.replace('.output', '.Activated'), row, col: -1, highlightRow: true });
        newSources.push({ name: W2_matrix, row: -1, col, highlightCol: true });
        newSources.push({ name: b2_vec, row: 0, col });
    } else if (name.endsWith('.add_norm_1_output')) {
        const input1 = name.includes('decoder') ? LNd.decoder_input : LNe.encoder_input;
        const input2 = name.includes('decoder') ? LNd.masked_mha_output : LNe.mha_output;
        newSources.push({ name: input1, row, col });
        newSources.push({ name: input2, row, col });
    } else if (name.endsWith('.add_norm_2_output')) {
        const input1 = name.includes('decoder') ? LNd.add_norm_1_output : LNe.add_norm_1_output;
        const input2 = name.includes('decoder') ? LNd.enc_dec_mha_output : LNe.ffn_output;
        newSources.push({ name: input1, row, col });
        newSources.push({ name: input2, row, col });
    } else if (name.endsWith('.add_norm_3_output')) {
        newSources.push({ name: LNd.add_norm_2_output, row, col });
        newSources.push({ name: LNd.ffn_output, row, col });
    } else if (name.endsWith('.encoder_input')) {
        if (layerIdx > 0) newSources.push({ name: MATRIX_NAMES.layer(layerIdx - 1).add_norm_2_output, row, col });
        else { newSources.push({ name: MATRIX_NAMES.inputEmbeddings, row, col }); newSources.push({ name: MATRIX_NAMES.posEncodings, row, col }); }
    } else if (name.endsWith('.decoder_input')) {
        if (layerIdx > 0) newSources.push({ name: MATRIX_NAMES.decoderLayer(layerIdx - 1).add_norm_3_output, row, col });
        else { newSources.push({ name: MATRIX_NAMES.outputEmbeddings, row, col }); newSources.push({ name: MATRIX_NAMES.decoderPosEncodings, row, col }); }
    } else if (name === MATRIX_NAMES.logits) {
        newSources.push({ name: MATRIX_NAMES.decoderLayer(dims.n_layers - 1).add_norm_3_output, row, col: -1, highlightRow: true });
        newSources.push({ name: MATRIX_NAMES.finalLinear, row: -1, col, highlightCol: true });
    } else if (name === MATRIX_NAMES.outputProbabilities) {
        newSources.push({ name: MATRIX_NAMES.logits, row, col: -1, highlightRow: true });
    }

    return { highlight: { target: newTarget, sources: newSources, activeComponent, activeResidual, destinations: [] } };
};

function App() {
  const [dims, setDims] = useState({ d_model: 8, h: 2, seq_len: 2, n_layers: 1, d_ff: 32 });
  const [inputText, setInputText] = useState("I am a student");
  const [highlight, setHighlight] = useState<HighlightState>({ target: null, sources: [], destinations: [], activeComponent: null, activeResidual: null });
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);

  const transformerData: TransformerData | null = useTransformer(inputText, dims);

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

  const handleInteraction = useCallback((element: ElementIdentifier, event: React.MouseEvent) => {
    if (!transformerData) return;
    const { highlight: newHighlight } = createBackwardHighlight(element, transformerData, dims);

    let newTooltip: TooltipState | null = null;
    if (newHighlight.target && newHighlight.sources.length > 0) {
        newTooltip = generateTooltipData(element, transformerData, newHighlight.sources, dims);
    }

    setHighlight(newHighlight);
    setTooltip(newTooltip);
  }, [transformerData, dims]);

  const handleComponentClick = useCallback((componentId: string) => {
      setHighlight(prev => ({ target: null, sources: [], destinations: [], activeComponent: componentId, activeResidual: null }));
      setTooltip(null);
  }, []);

  const closeTooltip = useCallback(() => setTooltip(null), []);

  if (!transformerData) {
      return <div>正在加载或维度设置无效... (d_model 必须能被 h 整除)</div>
  }

  const explanationDims = {
      ...dims,
      encoder_seq_len: transformerData.encoderInput.length,
      decoder_seq_len: transformerData.decoderInput.length,
  };

  return (
    <div className="app-container">
      <h1>Transformer 深度探索器 (V9.3)</h1>
      <div className="main-layout">
        {tooltip && <CalculationTooltip tooltip={tooltip} onClose={closeTooltip} />}
        <Controls dims={dims} setDims={setDims} inputText={inputText} setInputText={setInputText}/>
        <div className="column left-column">
          <div className="column-content">
              <h2>模型结构与数据流</h2>
               <p style={{textAlign: 'center', margin: '-10px 0 15px 0', fontSize: '0.9em', color: '#555'}}>
                提示: 点击任何计算结果 (红色高亮) 的单元格，即可查看其详细计算过程。
               </p>
              <Viz
                data={transformerData}
                highlight={highlight}
                onElementClick={handleInteraction}
                onComponentClick={handleComponentClick}
              />
          </div>
        </div>
        <div className="column right-column">
           <div className="column-content">
              <h2>数学原理详解</h2>
              <Explanation
                dims={explanationDims}
                highlight={highlight}
                onSymbolClick={handleInteraction}
              />
           </div>
        </div>
      </div>
    </div>
  );
}

export default App;
// END OF FILE: src/App.tsx