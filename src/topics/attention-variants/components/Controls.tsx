// FILE: src/topics/attention-variants/components/Controls.tsx
import React, { useState, useRef } from 'react';
import { useDraggableAndResizable } from '../../../hooks/useDraggableAndResizable';

interface ControlsProps {
    dims: {
        n_q_heads: number;
        n_kv_heads: number;
        d_head: number;
        d_c: number;
        d_c_prime: number;
        d_rope: number;
    };
    setDims: React.Dispatch<React.SetStateAction<any>>;
}

export const Controls: React.FC<ControlsProps> = ({ dims, setDims }) => {
    const [isCollapsed, setIsCollapsed] = useState(true);
    const panelRef = useRef<HTMLDivElement>(null);
    const { position, size, dragHandleProps, resizeHandleProps } = useDraggableAndResizable({
        x: window.innerWidth - 450,
        y: 90,
        width: 420,
        height: 320, // Increased height for new controls
    }, panelRef);

    const handleDimChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        const numValue = parseInt(value, 10);

        setDims((prevDims: any) => {
            const newDims = { ...prevDims, [id]: numValue };

            if (id === 'n_q_heads') {
                if (numValue % newDims.n_kv_heads !== 0) {
                    let new_kv_heads = newDims.n_kv_heads;
                    while(numValue % new_kv_heads !== 0 && new_kv_heads > 1) {
                        new_kv_heads--;
                    }
                    newDims.n_kv_heads = Math.max(1, new_kv_heads);
                }
            }

            if (id === 'n_kv_heads') {
                if (newDims.n_q_heads % numValue !== 0) {
                    newDims.n_q_heads = numValue * Math.round(newDims.n_q_heads / numValue);
                    if (newDims.n_q_heads === 0) newDims.n_q_heads = numValue;
                }
            }

            newDims.d_model = newDims.n_q_heads * newDims.d_head;
            return newDims;
        });
    };

    const panelStyle: React.CSSProperties = {
        position: 'absolute',
        top: position.y,
        left: position.x,
        width: isCollapsed ? 50 : size.width,
        height: isCollapsed ? 50 : 'auto', // Auto height when not collapsed
    };

    return (
        <div ref={panelRef} style={panelStyle} className={`controls-panel ${isCollapsed ? 'collapsed' : ''} resizable-panel`}>
            <div className="panel-header" {...dragHandleProps}>
                <button className="panel-toggle-btn" onClick={() => setIsCollapsed(!isCollapsed)}>
                    {isCollapsed ? '⚙️' : '×'}
                </button>
                {!isCollapsed && <span className="panel-title">Controls</span>}
            </div>
            {!isCollapsed && (
                <div className="controls-container">
                    <div className="control-group">
                        <label htmlFor="n_q_heads">查询头 (N_q)</label>
                        <input type="number" id="n_q_heads" value={dims.n_q_heads} onChange={handleDimChange} step={1} min={1} max={16} />
                    </div>
                    <div className="control-group">
                        <label htmlFor="n_kv_heads">键/值头 (N_kv)</label>
                        <input type="number" id="n_kv_heads" value={dims.n_kv_heads} onChange={handleDimChange} step={1} min={1} max={dims.n_q_heads} />
                    </div>
                    <div className="control-group">
                        <label htmlFor="d_head">头维度 (d_head)</label>
                        <input type="number" id="d_head" value={dims.d_head} onChange={handleDimChange} step={2} min={2} max={32} />
                    </div>
                    <div className="control-group">
                        <label>模型维度 (d_model)</label>
                        <div className="d_k-value">{dims.n_q_heads * dims.d_head}</div>
                    </div>
                    <hr style={{width: '100%', borderTop: '1px solid #eee', margin: '10px 0'}} />
                    <div className="control-group">
                        <label htmlFor="d_c_prime">MLA Q Latent (d'_c)</label>
                        <input type="number" id="d_c_prime" value={dims.d_c_prime} onChange={handleDimChange} step={2} min={2} max={32} />
                    </div>
                    <div className="control-group">
                        <label htmlFor="d_c">MLA KV Latent (d_c)</label>
                        <input type="number" id="d_c" value={dims.d_c} onChange={handleDimChange} step={2} min={2} max={32} />
                    </div>
                    <div className="control-group">
                        <label htmlFor="d_rope">MLA RoPE Dim (d_r)</label>
                        <input type="number" id="d_rope" value={dims.d_rope} onChange={handleDimChange} step={2} min={2} max={dims.d_head} />
                    </div>
                </div>
            )}
            <div className="resize-handle br" {...resizeHandleProps.br}></div>
            <div className="resize-handle t" {...resizeHandleProps.t}></div>
            <div className="resize-handle r" {...resizeHandleProps.r}></div>
            <div className="resize-handle b" {...resizeHandleProps.b}></div>
            <div className="resize-handle l" {...resizeHandleProps.l}></div>
        </div>
    );
};
// END OF FILE: src/topics/attention-variants/components/Controls.tsx