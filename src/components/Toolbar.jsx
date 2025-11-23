import React from 'react';
import { Pen, Eraser, PaintBucket, Undo, Redo, Square, Circle, Minus, Plus, Trash2, Pipette, Move, FlipHorizontal, Grid3X3, SprayCan, Moon } from 'lucide-react';
import './Toolbar.css';

const TOOLS = [
    { id: 'pen', icon: Pen, label: 'Pen' },
    { id: 'eraser', icon: Eraser, label: 'Eraser' },
    { id: 'line', icon: Minus, label: 'Line' },
    { id: 'square', icon: Square, label: 'Rectangle' },
    { id: 'circle', icon: Circle, label: 'Circle' },
    { id: 'mirror', icon: FlipHorizontal, label: 'Mirror Pen' },
    { id: 'dither', icon: Grid3X3, label: 'Dither Pen' },
    { id: 'spray', icon: SprayCan, label: 'Spray Paint' },
    { id: 'shading', icon: Moon, label: 'Shading' },
    { id: 'bucket', icon: PaintBucket, label: 'Fill' },
    { id: 'pipette', icon: Pipette, label: 'Picker' },
    { id: 'move', icon: Move, label: 'Move' },
];

const PRESET_COLORS = [
    '#ffffff', '#000000', '#ef4444', '#f97316', '#f59e0b', '#84cc16',
    '#10b981', '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#d946ef',
    '#f43f5e', '#78350f', '#71717a'
];

const BRUSH_SIZES = [1, 2, 3, 4];

const BRUSH_TOOLS = ['pen', 'eraser', 'mirror', 'dither', 'shading'];
const SHAPE_TOOLS = ['square', 'circle', 'line'];

const Toolbar = ({ activeTool, setActiveTool, activeColor, setActiveColor, customColors, setCustomColors, undo, redo, canUndo, canRedo, clearCustomColors, brushSize, setBrushSize, shapeFillMode, setShapeFillMode }) => {

    const addCustomColor = () => {
        if (!customColors.includes(activeColor)) {
            setCustomColors([...customColors, activeColor]);
        }
    };

    const showBrushSize = BRUSH_TOOLS.includes(activeTool);
    const showShapeOptions = SHAPE_TOOLS.includes(activeTool);

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

            {/* Tool Options - Conditionally show brush size or shape options */}
            {(showBrushSize || showShapeOptions) && (
                <div className="tool-options-container">
                    {showBrushSize && (
                        <div className="tool-options-content">
                            <div className="section-title">Brush Size</div>
                            <div className="brush-size-selector">
                                {BRUSH_SIZES.map(size => (
                                    <button
                                        key={size}
                                        className={`brush-size-btn ${brushSize === size ? 'active' : ''}`}
                                        onClick={() => setBrushSize(size)}
                                        title={`${size}x${size} pixels`}
                                    >
                                        <div
                                            className="brush-size-preview"
                                            style={{
                                                width: `${4 + size * 3}px`,
                                                height: `${4 + size * 3}px`
                                            }}
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {showShapeOptions && (
                        <div className="tool-options-content">
                            <div className="section-title">Fill Mode</div>
                            <div className="shape-fill-selector">
                                <button
                                    className={`fill-mode-btn ${shapeFillMode === 'filled' ? 'active' : ''}`}
                                    onClick={() => setShapeFillMode('filled')}
                                    title="Filled"
                                >
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                        <rect x="6" y="6" width="12" height="12" fill="currentColor" />
                                    </svg>
                                </button>
                                <button
                                    className={`fill-mode-btn ${shapeFillMode === 'outline' ? 'active' : ''}`}
                                    onClick={() => setShapeFillMode('outline')}
                                    title="Outline"
                                >
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                        <rect x="6" y="6" width="12" height="12" stroke="currentColor" strokeWidth="2" fill="none" />
                                    </svg>
                                </button>
                                <button
                                    className={`fill-mode-btn ${shapeFillMode === 'dashed' ? 'active' : ''}`}
                                    onClick={() => setShapeFillMode('dashed')}
                                    title="Dashed"
                                >
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                        <rect x="6" y="6" width="12" height="12" stroke="currentColor" strokeWidth="2" strokeDasharray="2,2" fill="none" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

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
                    <div className="custom-header">
                        <div className="section-title" style={{ marginBottom: 0 }}>Custom</div>
                        <button className="clear-palette-btn" onClick={clearCustomColors} title="Clear Palette">
                            <Trash2 size={12} />
                        </button>
                    </div>
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
