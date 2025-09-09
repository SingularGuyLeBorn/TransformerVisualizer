// FILE: src/topics/attention-variants/lib/symbolMapping.ts
interface SymbolParts {
    base: string;
    superscript?: string;
    subscript?: string;
}

export const getSymbolParts = (name: string): SymbolParts => {
    const parts = name.split('.');
    const variant = parts[0] as 'mha' | 'mqa' | 'gqa' | 'mla';
    const conceptualName = parts[parts.length - 1];

    let base: string;
    let superscript: string | undefined;
    let newSubscripts: (string | number)[] = [];

    // Base symbol mapping
    const baseMap: { [key: string]: string } = {
        'input': 'H',
        'wo': 'W', 'Wc': 'W', 'Wc_prime': 'W', 'W_k_rope': 'W',
        'combined': 'H_{cat}',
        'output': 'Z',
        'Q': 'Q', 'K': 'K', 'V': 'V',
        'Scores': 'S', 'Weights': 'A', 'Output': 'H',
        'C_q_prime': 'C', 'C_kv': 'C', 'K_rope': 'K'
    };

    // Default or mapped base
    base = baseMap[conceptualName] || `W_{${conceptualName}}`;

    // Handle existing subscripts in base
    const baseMatch = base.match(/([A-Za-z]+)_\{(.*)\}/);
    if (baseMatch) {
        base = baseMatch[1];
        newSubscripts.push(baseMatch[2]);
    }

    // Handle weight matrices like 'gqa.wq.0' or 'mha.wo'
    if (parts[1] && parts[1].startsWith('w') || conceptualName.startsWith('W_')) {
        base = 'W';
        if (parts[1] === 'wq' || parts[1] === 'wk' || parts[1] === 'wv' || parts[1] === 'W_q_rope' || parts[1] === 'W_v_mla') {
            superscript = conceptualName.includes('q') ? 'Q' : (conceptualName.includes('k') ? 'K' : 'V');
            if(parts[1] === 'W_q_rope') newSubscripts.push('qr');
            if(parts[1] === 'W_v_mla') newSubscripts.push('v');
            if (parts[2]) newSubscripts.push(parts[2]);
        } else if (conceptualName === 'Wc') {
            newSubscripts.push('c');
        } else if (conceptualName === 'Wc_prime') {
            superscript = "'";
            newSubscripts.push('c');
        } else if (conceptualName === 'W_k_rope') {
            newSubscripts.push('kr');
        } else { // wo
            superscript = 'O';
        }
    }

    if(conceptualName === 'C_q_prime') superscript = "'";
    if(conceptualName === 'C_kv') newSubscripts.push('kv');
    if(conceptualName === 'K_rope') newSubscripts.push('rope');


    // Handle head-specific matrices
    if (parts.length === 4 && parts[1] === 'heads') {
        const headIndex = parts[2];
        newSubscripts.push(headIndex);
    }

    // Add variant subscript for final output
    if (conceptualName === 'output') {
        newSubscripts.push(variant.toUpperCase());
    }

    const subscript = newSubscripts.length > 0 ? newSubscripts.join(',') : undefined;

    return { base, superscript, subscript };
};
// END OF FILE: src/topics/attention-variants/lib/symbolMapping.ts