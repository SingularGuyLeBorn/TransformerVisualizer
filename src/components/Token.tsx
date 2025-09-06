// FILE: src/components/Token.tsx
import React from 'react';
import { ElementIdentifier, HighlightState } from '../types';

interface TokenProps {
  tokenStr: string;
  tokenId: number;
  position: number;
  name: string; // "inputToken" or "outputToken"
  highlight: HighlightState;
  onElementClick: (element: ElementIdentifier) => void;
}

export const Token: React.FC<TokenProps> = ({
  tokenStr,
  tokenId,
  position,
  name,
  highlight,
  onElementClick,
}) => {
  const isTarget =
    highlight.target?.name === name && highlight.target?.row === position;
  const isSource = highlight.sources.some(
    (s) => s.name === name && s.row === position
  );

  const handleClick = () => {
    onElementClick({ name, row: position, col: -1, tokenStr, tokenId });
  };

  const className = `token-container ${isTarget ? 'target' : ''} ${
    isSource ? 'source' : ''
  }`;

  return (
    <div className={className} onClick={handleClick}>
      <div className="token-text">{tokenStr}</div>
      <div className="token-id">ID: {tokenId}</div>
    </div>
  );
};
// END OF FILE: src/components/Token.tsx