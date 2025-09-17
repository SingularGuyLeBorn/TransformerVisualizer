// FILE: src/components/primitives/types.ts

// These types are for the low-level interactive primitive components.

export type Matrix = number[][];
export type Vector = number[];

/**
 * Uniquely identifies a single element within the visualization.
 */
export interface ElementIdentifier {
  name: string; // The unique name of the matrix/vector, e.g., "encoder.0.mha.h0.Q"
  row: number;
  col: number;
  // Optional topic-specific data can be added by extending this interface.
  variant?: string;
}

/**
 * Defines which elements should be highlighted as sources for a target.
 */
export interface HighlightSource extends ElementIdentifier {
  highlightRow?: boolean; // Highlight the entire row
  highlightCol?: boolean; // Highlight the entire column
}

/**
 * Represents the complete highlighting state for the visualization.
 */
export interface HighlightState {
  target: ElementIdentifier | null;
  sources: HighlightSource[];
}
// END OF FILE: src/components/primitives/types.ts