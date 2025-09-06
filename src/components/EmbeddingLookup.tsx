// FILE: src/components/EmbeddingLookup.tsx
import React, { useRef, useEffect, useState } from 'react';
import { TransformerData, HighlightState, ElementIdentifier, Matrix as MatrixType } from '../types';
import { Matrix } from './Matrix';
import { Token } from './Token';

interface EmbeddingLookupProps {
    mode: 'token-to-vector' | 'id-to-token';
    tokens: ElementIdentifier[];
    embeddingMatrix: MatrixType;
    matrixName: string;
    vocab?: TransformerData['vocab']; // For id-to-token mode
    outputVectors?: MatrixType; // For token-to-vector mode
    outputMatrixName?: string;
    highlight: HighlightState;
    onElementClick: (element: ElementIdentifier) => void;
}

export const EmbeddingLookup: React.FC<EmbeddingLookupProps> = ({
    mode,
    tokens,
    embeddingMatrix,
    matrixName,
    vocab,
    outputVectors,
    outputMatrixName,
    highlight,
    onElementClick
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [lines, setLines] = useState<any[]>([]);

    useEffect(() => {
        const calculateLines = () => {
            if (!containerRef.current) return;

            const newLines: any[] = [];
            const tokenElements = Array.from(containerRef.current.querySelectorAll('.token-container'));
            const matrixRowElements = Array.from(containerRef.current.querySelectorAll(`.matrix-grid[data-name="${matrixName}"] .matrix-element`));
            const outputElements = Array.from(containerRef.current.querySelectorAll(mode === 'token-to-vector' ? `.matrix-wrapper[data-name="${outputMatrixName}"]` : '.token-container.output-token'));

            const matrixGridEl = containerRef.current.querySelector(`.matrix-wrapper[data-name="${matrixName}"]`);
            if (!matrixGridEl) return;
            const matrixRect = matrixGridEl.getBoundingClientRect();
            const containerRect = containerRef.current.getBoundingClientRect();

            tokens.forEach((token, index) => {
                const tokenId = token.tokenId!;
                const isHighlighted = highlight.sources.some(s => s.name === 'inputToken' && s.row === index) ||
                                      highlight.target?.name === 'inputToken' && highlight.target?.row === index ||
                                      highlight.sources.some(s => s.name === 'outputProbabilities' && s.row === index) ||
                                      highlight.target?.name === 'outputToken' && highlight.target?.row === index;

                const tokenEl = tokenElements[index];

                // Find the corresponding matrix row element (might be virtualized)
                // Added null check for containerRef.current here to satisfy TypeScript
                const matrixRowEl = containerRef.current?.querySelector(`.matrix-element[data-row="${tokenId}"]`);
                const outputEl = outputElements[index];

                if (tokenEl && matrixRowEl && outputEl) {
                    const tokenRect = tokenEl.getBoundingClientRect();
                    const matrixRowRect = matrixRowEl.getBoundingClientRect();
                    const outputRect = outputEl.getBoundingClientRect();

                    // From Token to Matrix
                    const startX1 = tokenRect.right - containerRect.left;
                    const startY1 = tokenRect.top + tokenRect.height / 2 - containerRect.top;
                    const endX1 = matrixRect.left - containerRect.left;
                    const endY1 = matrixRowRect.top + matrixRowRect.height / 2 - containerRect.top;

                    // From Matrix to Output
                    const startX2 = matrixRect.right - containerRect.left;
                    const startY2 = endY1; // Same Y as the matrix row
                    const endX2 = outputRect.left - containerRect.left;
                    const endY2 = outputRect.top + outputRect.height / 2 - containerRect.top;

                    newLines.push({
                        id: `line-${index}`,
                        path1: `M ${startX1} ${startY1} C ${startX1 + 50} ${startY1} ${endX1 - 50} ${endY1} ${endX1} ${endY1}`,
                        path2: `M ${startX2} ${startY2} C ${startX2 + 50} ${startY2} ${endX2 - 50} ${endY2} ${endX2} ${endY2}`,
                        highlighted: isHighlighted
                    });
                }
            });
            setLines(newLines);
        };
        // Recalculate on highlight change or initial render
        calculateLines();
        // Also good to recalculate on resize if the layout is responsive
        window.addEventListener('resize', calculateLines);
        return () => window.removeEventListener('resize', calculateLines);
    }, [highlight, tokens, matrixName, outputMatrixName, mode]);


    return (
        <div className="embedding-lookup-container" ref={containerRef}>
            <svg className="embedding-lookup-svg">
                {lines.map(line => (
                    <React.Fragment key={line.id}>
                        <path d={line.path1} className={line.highlighted ? 'highlighted' : ''} />
                        <path d={line.path2} className={line.highlighted ? 'highlighted' : ''} />
                    </React.Fragment>
                ))}
            </svg>

            {/* Input Column */}
            <div className="embedding-lookup-column">
                {tokens.map((token, i) => (
                    mode === 'token-to-vector'
                        ? <Token key={i} tokenStr={token.tokenStr!} tokenId={token.tokenId!} position={i} name={token.name} highlight={highlight} onElementClick={onElementClick} />
                        : <div key={i} style={{height: '59px', display: 'flex', alignItems: 'center', fontFamily: 'monospace'}}>ID: {token.tokenId}</div> // Placeholder for IDs
                ))}
            </div>

            {/* Vocabulary Matrix Column */}
            <div className="embedding-lookup-vocab" data-name={matrixName}>
                 <Matrix name={matrixName} data={embeddingMatrix} highlight={highlight} onElementClick={onElementClick} />
            </div>


            {/* Output Column */}
            <div className="embedding-lookup-column">
                 {mode === 'token-to-vector' && outputVectors && outputMatrixName ? (
                    <Matrix name={outputMatrixName} data={outputVectors} highlight={highlight} onElementClick={onElementClick} />
                 ) : (
                    tokens.map((token, i) => (
                         <Token key={i} tokenStr={token.tokenStr!} tokenId={token.tokenId!} position={i} name={token.name} highlight={highlight} onElementClick={onElementClick} />
                    ))
                 )}
            </div>
        </div>
    );
};
// END OF FILE: src/components/EmbeddingLookup.tsx