// FILE: src/components/AddNorm.tsx
import React from 'react';
import { Matrix as MatrixType, HighlightState, ElementIdentifier } from '../types';
import { Matrix } from './Matrix';
import { InlineMath } from 'react-katex';

interface AddNormProps {
    baseName: string;
    inputResidual: MatrixType;
    inputSublayer: MatrixType;
    output: MatrixType;
    highlight: HighlightState;
    onElementClick: (element: ElementIdentifier) => void;
}

export const AddNorm: React.FC<AddNormProps> = ({ baseName, inputResidual, inputSublayer, output, highlight, onElementClick }) => {
    const isActive = highlight.activeComponent === 'add_norm'; // 检查是否为当前激活的组件
    return (
         <div className={`diagram-component ${isActive ? 'active' : ''}`}> {/* 应用active类 */}
            <div className="component-header">Add & LayerNorm</div>
            <div className="component-body">
                <div style={{display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', justifyContent: 'center'}}>
                    <Matrix name={`${baseName}_in_residual`} data={inputResidual} highlight={highlight} onElementClick={onElementClick} />
                    <div className="op-symbol">+</div>
                    <Matrix name={`${baseName}_in_sublayer`} data={inputSublayer} highlight={highlight} onElementClick={onElementClick} />
                </div>
                <div className="arrow-down"><InlineMath math="\rightarrow \text{LayerNorm} \rightarrow" /></div>
                <Matrix name={`${baseName}_out`} data={output} highlight={highlight} onElementClick={onElementClick} />
            </div>
        </div>
    );
};
// END OF FILE: src/components/AddNorm.tsx