// FILE: src/topics/transformer-explorer/lib/symbolMapping.ts
interface SymbolParts {
    base: string;
    superscript?: string;
    subscript?: string;
}

export const getSymbolParts = (name: string): SymbolParts => {
    const conceptualName = name.split('.').pop() || '';
    const nameParts = name.split('.');

    const baseMap: { [key: string]: string } = {
        inputEmbeddings: 'E', posEncodings: 'PE',
        Wq: 'W', Wk: 'W', Wv: 'W', Wo: 'W',
        Q: 'Q', K: 'K', V: 'V',
        Scores: 'S', ScaledScores: "S'", AttentionWeights: 'A', HeadOutput: 'H',
        W1: 'W', b1: 'b', Intermediate: 'H_{ffn}', Activated: 'H_{act}',
        W2: 'W', b2: 'b', ffn_output: 'F',
        outputEmbeddings: 'E_{out}', decoderPosEncodings: 'PE_{dec}',
        finalLinear: 'W_{proj}', logits: 'L', outputProbabilities: 'P',
        embeddingMatrix: 'E_{table}'
    };

    let base = baseMap[conceptualName] || 'X';
    let superscript: string | undefined = undefined;
    let newSubscripts: (string | number)[] = [];

    // Extract existing subscript from base, e.g., H_{ffn} -> base: H, newSubscripts: ['ffn']
    const baseMatch = base.match(/([A-Za-z']+)_\{(.*)\}/);
    if (baseMatch) {
        base = baseMatch[1];
        newSubscripts.push(baseMatch[2]);
    }


    const layerMatch = name.match(/\.(encoder|decoder)\.(\d+)/);
    const headMatch = name.match(/\.h(\d+)\./);
    const layerIndex = layerMatch ? parseInt(layerMatch[2], 10) : undefined;
    const headIndex = headMatch ? parseInt(headMatch[1], 10) : undefined;
    const isDecoder = name.includes('decoder');

    if (conceptualName.startsWith('W')) {
        if (['Wq', 'Wk', 'Wv'].includes(conceptualName)) superscript = conceptualName.charAt(1).toUpperCase();
        else if (conceptualName.includes('Wo')) superscript = 'O';
        else if (conceptualName === 'W1') newSubscripts.push('1');
        else if (conceptualName === 'W2') newSubscripts.push('2');
    } else if (conceptualName.startsWith('b')) {
        newSubscripts.push(conceptualName.charAt(1));
    }

    if (['Q', 'K', 'V', 'Scores', 'ScaledScores', 'AttentionWeights', 'HeadOutput'].includes(conceptualName)) {
        if (headIndex !== undefined) newSubscripts.push(headIndex);
    }

    if (['encoder_input', 'decoder_input'].includes(conceptualName)) {
        base = isDecoder ? 'Y' : 'Z';
        if (layerIndex !== undefined) newSubscripts.push(layerIndex);
    }

    if (conceptualName.startsWith('add_norm_')) {
        const num = conceptualName.split('_').pop()![0];
        base = isDecoder ? 'Y' : 'Z';
        superscript = "'".repeat(parseInt(num, 10));
        if (layerIndex !== undefined) newSubscripts.push(`l${layerIndex}`);
    }

    if (['mha_output', 'masked_mha_output', 'enc_dec_mha_output'].includes(conceptualName)) {
        base = 'M';
        if (conceptualName.includes('masked')) newSubscripts.push('mmha');
        else if (conceptualName.includes('enc_dec')) newSubscripts.push('ed');
        if (layerIndex !== undefined) newSubscripts.push(`l${layerIndex}`);
    }

    const subscript = newSubscripts.length > 0 ? newSubscripts.join(',') : undefined;

    return { base, superscript, subscript };
};
// END OF FILE: src/topics/transformer-explorer/lib/symbolMapping.ts