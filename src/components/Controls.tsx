// FILE: src/components/Controls.tsx
import React, { useState, useCallback, useEffect, useRef } from 'react';

interface ControlsProps {
  dims: { d_model: number; h: number, seq_len: number, n_layers: number, d_ff: number };
  setDims: (dims: { d_model: number; h: number, seq_len: number, n_layers: number, d_ff: number }) => void;
  inputText: string;
  setInputText: (text: string) => void;
}

export const Controls: React.FC<ControlsProps> = ({ dims, setDims, inputText, setInputText }) => {
  const [isControlsVisible, setIsControlsVisible] = useState(true);
  const panelRef = useRef<HTMLDivElement>(null);

  // [REMOVED] Dragging logic is no longer needed
  // const [position, setPosition] = useState(...);
  // const dragData = useRef(...);
  // const handleMouseDown = useCallback(...);
  // const handleMouseMove = useCallback(...);
  // const handleMouseUp = useCallback(...);
  // useEffect for mouse events...

  const handleDimChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    let newDims = { ...dims, [id]: parseInt(value, 10) || 1 };

    // Ensure d_model is divisible by h
    if (id === 'h') {
        if (newDims.d_model % newDims.h !== 0) {
             newDims.d_model = Math.max(newDims.h, Math.ceil(newDims.d_model / newDims.h) * newDims.h);
        }
    }
    if (id === 'd_model') {
         if (newDims.d_model % newDims.h !== 0) {
             let best_h = 1;
             for (let i = 1; i <= newDims.d_model; i++) {
                 if (newDims.d_model % i === 0) {
                    if (Math.abs(i - newDims.h) < Math.abs(best_h - newDims.h)) {
                       best_h = i;
                    }
                 }
             }
             newDims.h = best_h;
         }
    }

    if(id === 'd_model') {
        newDims.d_ff = newDims.d_model * 4;
    }

    setDims(newDims);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setInputText(e.target.value);
  }

  const d_k = dims.d_model % dims.h === 0 ? dims.d_model / dims.h : 'N/A';

  // [REMOVED] Inline style for positioning is now handled by CSS
  // const panelStyle: React.CSSProperties = { ... };

  return (
    <div ref={panelRef} className={`controls-panel ${!isControlsVisible ? 'collapsed' : ''}`}>
      {/* [REMOVED] onMouseDown handler for dragging */}
      <div className="controls-panel-header">
        <button className="controls-toggle-btn" onClick={() => setIsControlsVisible(!isControlsVisible)}>
          {isControlsVisible ? '×' : '⚙️'}
        </button>
      </div>
      <div className="controls-container">
        <div className="control-group">
          <label htmlFor="inputText">输入文本 (Encoder Input)</label>
          <input type="text" id="inputText" value={inputText} onChange={handleInputChange} />
        </div>
        <div className="control-group">
          <label htmlFor="seq_len">解码器长度 (Decoder Len)</label>
          <input type="number" id="seq_len" value={dims.seq_len} onChange={handleDimChange} min="1" max="4" />
        </div>
        <div className="control-group">
          <label htmlFor="d_model">模型维度 (d_model)</label>
          <input type="number" id="d_model" value={dims.d_model} onChange={handleDimChange} step={1} min={2} max="16"/>
        </div>
        <div className="control-group">
          <label htmlFor="h">注意力头数 (h)</label>
          <input type="number" id="h" value={dims.h} onChange={handleDimChange} min="1" max={dims.d_model}/>
        </div>
        <div className="control-group">
          <label htmlFor="n_layers">层数 (N)</label>
          <input type="number" id="n_layers" value={dims.n_layers} onChange={handleDimChange} min="1" max="3"/>
        </div>
        <div className="control-group">
          <label>键/查询维度 (d_k)</label>
          <div className="d_k-value">{d_k}</div>
        </div>
      </div>
    </div>
  );
};
// END OF FILE: src/components/Controls.tsx