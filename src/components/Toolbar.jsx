import React from 'react';
import { Pen, Eraser, PaintBucket, Undo, Redo, Square, Circle, Minus, Plus } from 'lucide-react';
import './Toolbar.css';

const TOOLS = [
    { id: 'pen', icon: Pen, label: 'Pen' },
    { id: 'eraser', icon: Eraser, label: 'Eraser' },
    { id: 'bucket', icon: PaintBucket, label: 'Fill' },
    { id: 'line', icon: Minus, label: 'Line' },
    { id: 'square', icon: Square, label: 'Rectangle' },
    { id: 'circle', icon: Circle, label: 'Circle' },
];

const PRESET_COLORS = [
    '#ffffff', '#000000', '#ef4444', '#f97316', '#f59e0b', '#84cc16',
    '#10b981', '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#d946ef',
    '#f43f5e', '#78350f', '#71717a'
];

const Toolbar = ({ activeTool, setActiveTool, activeColor, setActiveColor, customColors, setCustomColors, undo, redo, canUndo, canRedo }) => {

    const addCustomColor = () => {
        if (!customColors.includes(activeColor)) {
            setCustomColors([...customColors, activeColor]);
        }
    };

    return (
        <div className="toolbar-container">

            <div className="section-title">Tools</div>
            <div className="tools-grid">
                {TOOLS.map(tool => (
                    <button
                        key={tool.id}
                        className={`tool-btn ${activeTool === tool.id ? 'active' : ''}`}
                        onClick={() => setActiveTool(tool.id)}
                        title={tool.label}
                    >
                        <tool.icon size={20} />
                    </button>
                ))}
            </div>

            <div className="history-controls">
                <button className="tool-btn" onClick={undo} disabled={!canUndo} title="Undo">
                    <Undo size={20} />
                </button>
                <button className="tool-btn" onClick={redo} disabled={!canRedo} title="Redo">
                    <Redo size={20} />
                </button>
            </div>

            <div className="section-title">Colors</div>
            <div className="color-picker-container">
                <div className="color-preview" style={{ backgroundColor: activeColor }}>
                    <input
                        type="color"
                        value={activeColor}
                        onChange={(e) => setActiveColor(e.target.value)}
                        className="color-input"
                    />
                </div>
                <div className="hex-code">{activeColor}</div>
                <button className="add-color-btn" onClick={addCustomColor} title="Add to Palette">
                    <Plus size={16} />
                </button>
            </div>

            {customColors.length > 0 && (
                <>
                    <div className="section-title" style={{ marginTop: '0.5rem' }}>Custom</div>
                    <div className="colors-grid">
                        {customColors.map(color => (
                            <button
                                key={color}
                                className={`color-btn ${activeColor === color ? 'active' : ''}`}
                                style={{ backgroundColor: color }}
                                onClick={() => setActiveColor(color)}
                            />
                        ))}
                    </div>
                </>
            )}

            <div className="section-title" style={{ marginTop: '1rem' }}>Presets</div>
            <div className="colors-grid">
                {PRESET_COLORS.map(color => (
                    <button
                        key={color}
                        className={`color-btn ${activeColor === color ? 'active' : ''}`}
                        style={{ backgroundColor: color }}
                        onClick={() => setActiveColor(color)}
                    />
                ))}
            </div>
        </div>
    );
};

export default Toolbar;
