// FILE: src/topics/component-showcase/ComponentShowcaseTopic.tsx
import React, { useState, useCallback } from 'react';
// Import all visualizers and primitives
import { ActivationVisualizer } from '../../components/visualization/ActivationVisualizer/ActivationVisualizer';
import { AttentionVisualizer } from '../../components/visualization/AttentionVisualizer/AttentionVisualizer';
import { FeedForwardVisualizer } from '../../components/visualization/FeedForwardVisualizer/FeedForwardVisualizer';
import { LayerNormVisualizer } from '../../components/visualization/LayerNormVisualizer/LayerNormVisualizer';
import { LoRAVisualizer } from '../../components/visualization/LoRAVisualizer/LoRAVisualizer';
import { MambaVisualizer } from '../../components/visualization/MambaVisualizer/MambaVisualizer';
import { MoEVisualizer } from '../../components/visualization/MoEVisualizer/MoEVisualizer';
import { RMSNormVisualizer } from '../../components/visualization/RMSNormVisualizer/RMSNormVisualizer';
import { ResidualAddVisualizer } from '../../components/visualization/ResidualAddVisualizer/ResidualAddVisualizer';
import { RoPEVisualizer } from '../../components/visualization/RoPEVisualizer/RoPEVisualizer';
import { SFTVisualizer } from '../../components/visualization/SFTVisualizer/SFTVisualizer';
import { AdapterVisualizer } from '../../components/visualization/AdapterVisualizer/AdapterVisualizer';
import { InteractiveTensor } from '../../components/primitives/InteractiveTensor/InteractiveTensor';
// Import supporting components and types
import { ViewToggle, ViewMode } from '../../components/ViewToggle/ViewToggle';
import { CalculationTooltip } from '../../components/CalculationTooltip/CalculationTooltip';
import { TooltipState } from '../../components/CalculationTooltip/types';
import { HighlightState, ElementIdentifier, Matrix, Vector } from '../../components/primitives/types';
// Import CSS for the new layout
import './ComponentShowcaseTopic.css';
import { AttentionVariant, ActivationFunctionType } from '../../components/visualization/types';

// --- Mock Data Generation ---
const createDummyMatrix = (rows: number, cols: number, seed:number = 1): Matrix => Array.from({ length: rows }, (_, r) => Array.from({ length: cols }, (_, c) => parseFloat((Math.sin(r * cols + c + seed) * 2).toFixed(2))));
const createDummyVector = (size: number, seed: number = 2): Vector => Array.from({ length: size }, (_, i) => parseFloat((Math.cos(i + seed) * 2).toFixed(2)));
const createDummyTensor = (depth: number, rows: number, cols: number): number[][][] => Array.from({ length: depth }, (_, d) => createDummyMatrix(rows, cols, d + 3));

// --- Component Registry ---
interface ComponentProps {
    config: any;
    highlight: HighlightState;
    handleInteraction: (element: ElementIdentifier) => void;
}
type ComponentToRender = (props: ComponentProps) => React.ReactElement;

interface ComponentRegistryItem {
    name: string;
    category: string;
    isAvailable: boolean;
    component: ComponentToRender;
}

const componentRegistry: ComponentRegistryItem[] = [
    { name: 'AttentionVisualizer', category: 'Core Visualizations', isAvailable: true, component: (props) => <AttentionVisualizer {...props.config} /> },
    { name: 'MoEVisualizer', category: 'Advanced Architectures', isAvailable: true, component: () => <MoEVisualizer inputToken={createDummyVector(8)} routerLogits={createDummyVector(4)} experts={[createDummyMatrix(8,16),createDummyMatrix(8,16),createDummyMatrix(8,16),createDummyMatrix(8,16)]} k={2} /> },
    { name: 'MambaVisualizer', category: 'Advanced Architectures', isAvailable: true, component: (props) => <MambaVisualizer inputVector={props.config.vector} dt={0.1} a={-0.5} b={0.5} c={1.0} /> },
    { name: 'LoRAVisualizer', category: 'PEFT', isAvailable: true, component: () => <LoRAVisualizer W={createDummyMatrix(12,12)} B={createDummyMatrix(12,4)} A={createDummyMatrix(4,12)} /> },
    { name: 'AdapterVisualizer', category: 'PEFT', isAvailable: true, component: () => <AdapterVisualizer input={createDummyMatrix(4,8)} downProj={createDummyMatrix(8,2)} upProj={createDummyMatrix(2,8)} /> },
    { name: 'SFTVisualizer', category: 'Post-Training', isAvailable: true, component: () => <SFTVisualizer prompt="Translate to French: 'Hello, world!'" completion="Bonjour le monde!" modelPrediction="Bonjour le monde." /> },
    { name: 'ActivationVisualizer', category: 'Core Visualizations', isAvailable: true, component: (props) => (
            <div className="showcase-grid two-columns">
                {(['relu', 'gelu', 'silu', 'swiglu'] as ActivationFunctionType[]).map(type => (
                    <ActivationVisualizer key={type} inputVector={props.config.vector} functionType={type} />
                ))}
            </div>
        )},
    { name: 'Normalization', category: 'Core Visualizations', isAvailable: true, component: (props) => (
            <div className="showcase-grid two-columns">
                <LayerNormVisualizer inputVector={props.config.vector} />
                <RMSNormVisualizer inputVector={props.config.vector} />
            </div>
        )},
    // Add other available components here...
    { name: 'DPOVisualizer', category: 'Post-Training', isAvailable: false, component: () => <></> },
];

const componentCategories = ['Core Visualizations', 'Advanced Architectures', 'PEFT', 'Post-Training'];


export const ComponentShowcaseTopic: React.FC = () => {
    const [selectedComponent, setSelectedComponent] = useState<string | null>('AttentionVisualizer');
    const [highlight, setHighlight] = useState<HighlightState>({ target: null, sources: [] });
    const [tooltip, setTooltip] = useState<TooltipState | null>(null);
    const [viewMode, setViewMode] = useState<ViewMode>('none');

    const [config, setConfig] = useState({
        vector: [0.5, -1.2, 2.1, 0.1, -0.8, 1.5],
        position: 3,
        variant: 'mla' as AttentionVariant,
        seqLen: 8,
        dModel: 32,
        nQHeads: 8,
        dHead: 4,
    });

    const handleInteraction = useCallback((element: ElementIdentifier) => {
        setHighlight({ target: element, sources: [] });
    }, []);

    const renderSelectedComponent = () => {
        if (!selectedComponent) return <div className="welcome-message"><h2>请从左侧选择组件</h2></div>;

        const item = componentRegistry.find(c => c.name === selectedComponent);
        if (item && item.isAvailable) {
            const ComponentToRender = item.component;
            return <ComponentToRender config={config} highlight={highlight} handleInteraction={handleInteraction} />;
        }

        return <div className="welcome-message"><h2>组件正在开发中...</h2></div>;
    };

    return (
        <div className="showcase-layout">
            <aside className="showcase-sidebar">
                <h2 className="sidebar-header">组件列表</h2>
                <ul className="sidebar-list">
                    {componentCategories.map(category => (
                        <li key={category}>
                            <h3 className="sidebar-category-title">{category}</h3>
                            <ul>
                                {componentRegistry
                                    .filter(item => item.category === category)
                                    .map(item => (
                                        <li key={item.name} className="sidebar-item">
                                            <button
                                                className={`${item.isAvailable ? 'available' : 'unavailable'} ${selectedComponent === item.name ? 'active' : ''}`}
                                                onClick={() => item.isAvailable && setSelectedComponent(item.name)}
                                                disabled={!item.isAvailable}
                                            >
                                                {item.name}
                                            </button>
                                        </li>
                                    ))}
                            </ul>
                        </li>
                    ))}
                </ul>
            </aside>
            <main className="showcase-main-content">
                {selectedComponent && <ViewToggle viewMode={viewMode} setViewMode={setViewMode} />}
                {tooltip && <CalculationTooltip tooltip={tooltip} onClose={() => setTooltip(null)} />}
                <div className="component-display-area">
                    {renderSelectedComponent()}
                </div>
            </main>
        </div>
    );
};
// END OF FILE: src/topics/component-showcase/ComponentShowcaseTopic.tsx