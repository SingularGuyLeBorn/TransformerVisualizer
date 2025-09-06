// FILE: src/topics/attention-variants/components/Controls.tsx
import React from 'react';
import './Controls.css'; // 使用独立的CSS文件

interface ControlsProps {
  dims: {
    n_q_heads: number;
    n_kv_heads: number;
    d_head: number;
  };
  setDims: React.Dispatch<React.SetStateAction<any>>;
}

export const Controls: React.FC<ControlsProps> = ({ dims, setDims }) => {
    const handleDimChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        const numValue = parseInt(value, 10);

        setDims((prevDims: any) => {
            const newDims = { ...prevDims, [id]: numValue };

            if (id === 'n_q_heads') {
                if (numValue % newDims.n_kv_heads !== 0) {
                    // 寻找一个能被新 n_q_heads 整除的 n_kv_heads
                    let new_kv_heads = newDims.n_kv_heads;
                    while(numValue % new_kv_heads !== 0) {
                        new_kv_heads--;
                    }
                    newDims.n_kv_heads = Math.max(1, new_kv_heads);
                }
            }

            if (id === 'n_kv_heads') {
                if (newDims.n_q_heads % numValue !== 0) {
                     newDims.n_q_heads = numValue * Math.round(newDims.n_q_heads / numValue);
                }
            }

            newDims.d_model = newDims.n_q_heads * newDims.d_head;
            return newDims;
        });
    };

    return (
        <div className="controls-panel">
            <div className="controls-container" style={{ paddingTop: '15px' }}>
                <div className="control-group">
                    <label htmlFor="n_q_heads">查询头 (N_q_heads)</label>
                    <input type="number" id="n_q_heads" value={dims.n_q_heads} onChange={handleDimChange} step={1} min={1} max={16} />
                </div>
                <div className="control-group">
                    <label htmlFor="n_kv_heads">键/值头 (N_kv_heads)</label>
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
            </div>
        </div>
    );
};
// END OF FILE: src/topics/attention-variants/components/Controls.tsx