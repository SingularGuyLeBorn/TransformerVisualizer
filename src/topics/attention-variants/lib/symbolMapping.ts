// FILE: src/topics/attention-variants/lib/symbolMapping.ts
interface SymbolParts {
    base: string;
    superscript?: string;
    subscript?: string;
}

export const getSymbolParts = (name: string): SymbolParts => {
    const parts = name.split('.');
    const variant = parts[0] as 'mha' | 'mqa' | 'gqa';
    const conceptualName = parts[parts.length - 1];

    let base: string;
    let superscript: string | undefined;
    let newSubscripts: (string | number)[] = [];

    // Base symbol mapping
    const baseMap: { [key: string]: string } = {
        'input': 'H',
        'wo': 'W',
        'combined': 'H_{cat}',
        'output': 'Z',
        'Q': 'Q', 'K': 'K', 'V': 'V',
        'Scores': 'S', 'Weights': 'A', 'Output': 'H'
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
    if (parts[1] && parts[1].startsWith('w')) {
        base = 'W';
        if (parts[1].length === 2) { // wq, wk, wv
            superscript = parts[1].charAt(1).toUpperCase();
            if (parts[2]) newSubscripts.push(parts[2]);
        } else { // wo
            superscript = 'O';
        }
    }

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