// FILE: src/topics/attention-variants/lib/symbolMapping.ts
interface SymbolParts {
    base: string;
    superscript?: string;
    subscript?: string;
}

export const getSymbolParts = (name: string): SymbolParts => {
    const parts = name.split('.');
    const variant = parts[0] as 'mha' | 'mqa' | 'gqa';

    // Handle weight matrices like 'gqa.wq.0'
    if (parts.length === 3 && parts[1].startsWith('w')) {
        const type = parts[1].charAt(1).toUpperCase(); // Q, K, V
        const index = parts[2];
        return { base: 'W', superscript: type, subscript: index };
    }

    // Handle 'gqa.wo'
    if (parts.length === 2 && parts[1] === 'wo') {
        return { base: 'W', superscript: 'O' };
    }

    // Handle head-specific matrices like 'mha.heads.0.Q'
    if (parts.length === 4 && parts[1] === 'heads') {
        const headIndex = parts[2];
        const type = parts[3]; // Q, K, V, Scores, Weights, Output

        const baseMap: { [key: string]: string } = {
            'Q': 'Q', 'K': 'K', 'V': 'V',
            'Scores': 'S', 'Weights': 'A', 'Output': 'H'
        };

        return { base: baseMap[type] || '?', subscript: headIndex };
    }

    // Handle top-level matrices like 'mha.input' or 'gqa.output'
    if (parts.length === 2) {
        const type = parts[1];
        if (type === 'input') return { base: 'H' };
        if (type === 'combined') return { base: 'H', subscript: 'cat' };
        if (type === 'output') return { base: 'Z', subscript: variant.toUpperCase() };
    }

    // Default fallback
    return { base: 'X' };
};
// END OF FILE: src/topics/attention-variants/lib/symbolMapping.ts