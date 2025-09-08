// FILE: src/components/CalculationTooltip/types.ts
import { SymbolInfo, Vector } from '../../components/visualizers/types';

// This file defines the standardized, generic types for the unified CalculationTooltip.
// All topics must produce a TooltipState object conforming to this structure.

/**
 * Represents a single element being interacted with.
 */
export interface ElementIdentifier {
  name: string;
  row: number;
  col: number;
  isInternal?: boolean;
  symbol?: string; // The full LaTeX string for the element, e.g., "Z_{final}[1,2]"
}

/**
 * Represents a single component in a dot product calculation (a * b).
 */
export interface CalculationComponent {
    a: number;
    b: number;
}

/**
 * Represents a single step in a calculation breakdown.
 * Can be a matmul, an element-wise op, or a complex function like softmax.
 */
export interface CalculationStep {
    title?: string;
    a: Vector;
    b: Vector;
    op: string;
    result: number;
    aSymbolInfo: SymbolInfo;
    bSymbolInfo: SymbolInfo;
    aLabel?: string;
    bLabel?: string;
    resultLabel?: string;
    // [NEW] For multi-vector sources like in concatenated matmul
    aSources?: { data: Vector, symbolInfo: SymbolInfo }[];
    bSources?: { data: Vector, symbolInfo: SymbolInfo }[];
    components?: CalculationComponent[]; // [FIXED] Re-added for backward compatibility
}

/**
 * The complete state required by the unified CalculationTooltip component.
 */
export interface TooltipState {
    target: ElementIdentifier;
    opType: 'matmul' | 'add' | 'softmax' | 'relu' | 'info';
    steps: CalculationStep[];
    title: string;
}

// END OF FILE: src/components/CalculationTooltip/types.ts