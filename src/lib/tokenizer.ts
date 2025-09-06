// FILE: src/lib/tokenizer.ts
/**
 * A simple whitespace tokenizer.
 * Splits text by spaces and removes empty strings.
 * @param text The input string.
 * @returns An array of tokens.
 */
export const whitespaceTokenizer = (text: string): string[] => {
    return text.trim().split(/\s+/).filter(Boolean);
};

// END OF FILE: src/lib/tokenizer.ts