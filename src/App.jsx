import { useState, useCallback, useEffect, useRef } from 'react';
import { Menu, X } from 'lucide-react';
import Grid from './components/Grid';
import Toolbar from './components/Toolbar';
import Controls from './components/Controls';
import Modal from './components/Modal';
import CreditWidget from './components/CreditWidget';
import { getToolPixels } from './utils/tools';
import './App.css';

const DEFAULT_SIZE = 16;
const MAX_HISTORY = 50;

function App() {
    const adjustBrightness = (hex, percent) => {
        const num = parseInt(hex.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) + amt;
        const G = (num >> 8 & 0x00FF) + amt;
        const B = (num & 0x0000FF) + amt;
        return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 + (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 + (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
    };

    const [size, setSize] = useState(DEFAULT_SIZE);
    const [pixels, setPixels] = useState(Array(DEFAULT_SIZE * DEFAULT_SIZE).fill(null));
    const [activeColor, setActiveColor] = useState('#ffffff');
    const [backgroundColor, setBackgroundColor] = useState(null); // Default transparent
    const [customColors, setCustomColors] = useState([]);
    const [activeTool, setActiveTool] = useState('pen');
    const [isDrawing, setIsDrawing] = useState(false);
    const [history, setHistory] = useState([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const [showGridLines, setShowGridLines] = useState(true);
    const [isClearModalOpen, setIsClearModalOpen] = useState(false);
    const [isClearPaletteModalOpen, setIsClearPaletteModalOpen] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);

    // Shape drawing state
    const [dragStart, setDragStart] = useState(null);
    const [previewPixels, setPreviewPixels] = useState(null);
    const moveStartPixels = useRef(null);

    useEffect(() => {
        if (history.length === 0) {
            saveToHistory(Array(DEFAULT_SIZE * DEFAULT_SIZE).fill(null));
        }
    }, []);

    useEffect(() => {
        const saved = localStorage.getItem('8bit-art-state');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (parsed.pixels && parsed.size) {
                    setPixels(parsed.pixels);
                    setSize(parsed.size);
                    setHistory([parsed.pixels]);
                    setHistoryIndex(0);
                }
                if (parsed.backgroundColor && parsed.backgroundColor !== '#000000') {
                    setBackgroundColor(parsed.backgroundColor);
                }
                if (parsed.customColors) setCustomColors(parsed.customColors);
            } catch (e) {
                console.error("Failed to load state", e);
            }
        }
        setIsLoaded(true);
    }, []);

    useEffect(() => {
        if (!isLoaded) return;
        const state = { pixels, size, backgroundColor, customColors };
        localStorage.setItem('8bit-art-state', JSON.stringify(state));
    }, [pixels, size, backgroundColor, customColors, isLoaded]);

    const saveToHistory = (newPixels) => {
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(newPixels);
        if (newHistory.length > MAX_HISTORY) {
            newHistory.shift();
        }
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
    };

    const updatePixel = (index, color) => {
        const newPixels = [...pixels];
        newPixels[index] = color;
        setPixels(newPixels);
        return newPixels;
    };

    const getCoordinates = (index) => {
        return { x: index % size, y: Math.floor(index / size) };
    };

    const getIndex = (x, y) => {
        if (x < 0 || x >= size || y < 0 || y >= size) return -1;
        return y * size + x;
    };

    const handlePixelClick = (index) => {
        if (activeTool === 'pipette') {
            const color = pixels[index];
            if (color) setActiveColor(color);
            return;
        }

        setIsDrawing(true);

        if (activeTool === 'move') {
            setDragStart(index);
            moveStartPixels.current = [...pixels];
        } else if (['square', 'circle', 'line'].includes(activeTool)) {
            setDragStart(index);
            const initialShape = {};
            initialShape[index] = activeColor;
            setPreviewPixels(initialShape);
        } else {
            applyTool(index);
        }
    };

    const handlePixelDoubleClick = (index) => {
        updatePixel(index, null);
        saveToHistory(pixels); // Save immediately for double click action
    };

    const handlePixelEnter = (index) => {
        if (!isDrawing) return;

        if (activeTool === 'move' && dragStart !== null && moveStartPixels.current) {
            const start = getCoordinates(dragStart);
            const current = getCoordinates(index);
            const dx = current.x - start.x;
            const dy = current.y - start.y;

            if (dx === 0 && dy === 0) return;

            const newPixels = Array(size * size).fill(null);
            for (let y = 0; y < size; y++) {
                for (let x = 0; x < size; x++) {
                    const oldX = x - dx;
                    const oldY = y - dy;
                    if (oldX >= 0 && oldX < size && oldY >= 0 && oldY < size) {
                        const oldIdx = oldY * size + oldX;
                        newPixels[y * size + x] = moveStartPixels.current[oldIdx];
                    }
                }
            }
            setPixels(newPixels);
        } else if (['square', 'circle', 'line'].includes(activeTool)) {
            if (dragStart !== null) {
                const start = getCoordinates(dragStart);
                const end = getCoordinates(index);
                const pixelsList = getToolPixels(activeTool, start, end);

                const shape = {};
                pixelsList.forEach(p => {
                    const idx = getIndex(p.x, p.y);
                    if (idx !== -1) shape[idx] = activeColor;
                });
                setPreviewPixels(shape);
            }
        } else {
            applyTool(index);
        }
    };

    const handleMouseUp = () => {
        if (!isDrawing) return;

        if (activeTool === 'move') {
            saveToHistory(pixels);
            setDragStart(null);
            moveStartPixels.current = null;
        } else if (['square', 'circle', 'line'].includes(activeTool) && dragStart !== null && previewPixels) {
            const newPixels = [...pixels];
            Object.keys(previewPixels).forEach(key => {
                newPixels[key] = previewPixels[key];
            });
            setPixels(newPixels);
            saveToHistory(newPixels);
            setDragStart(null);
            setPreviewPixels(null);
        } else if (!['square', 'circle', 'line'].includes(activeTool)) {
            saveToHistory(pixels);
        }

        setIsDrawing(false);
    };

    const applyTool = (index) => {
        if (activeTool === 'pen') {
            updatePixel(index, activeColor);
        } else if (activeTool === 'mirror') {
            const { x, y } = getCoordinates(index);
            const mirrorX = size - 1 - x;
            const mirrorIndex = getIndex(mirrorX, y);

            const newPixels = [...pixels];
            newPixels[index] = activeColor;
            if (mirrorIndex !== -1) newPixels[mirrorIndex] = activeColor;
            setPixels(newPixels);
        } else if (activeTool === 'dither') {
            const { x, y } = getCoordinates(index);
            if ((x + y) % 2 === 0) {
                updatePixel(index, activeColor);
            }
        } else if (activeTool === 'spray') {
            const { x, y } = getCoordinates(index);
            const radius = 2;
            const density = 0.3;
            const newPixels = [...pixels];

            for (let dy = -radius; dy <= radius; dy++) {
                for (let dx = -radius; dx <= radius; dx++) {
                    if (Math.random() < density) {
                        const targetX = x + dx;
                        const targetY = y + dy;
                        if (targetX >= 0 && targetX < size && targetY >= 0 && targetY < size) {
                            const targetIdx = getIndex(targetX, targetY);
                            newPixels[targetIdx] = activeColor;
                        }
                    }
                }
            }
            setPixels(newPixels);
        } else if (activeTool === 'shading') {
            const currentColor = pixels[index];
            if (currentColor) {
                // Darken by 20%
                const newColor = adjustBrightness(currentColor, -20);
                updatePixel(index, newColor);
            }
        } else if (activeTool === 'eraser') {
            updatePixel(index, null);
        } else if (activeTool === 'bucket') {
            fillArea(index, activeColor);
        }
    };

    const fillArea = (startIndex, targetColor) => {
        const startColor = pixels[startIndex];
        if (startColor === targetColor) return;

        const newPixels = [...pixels];
        const stack = [startIndex];

        // Safety check for infinite loops if logic fails, though BFS is safe
        const visited = new Set();

        while (stack.length > 0) {
            const idx = stack.pop();
            if (visited.has(idx)) continue;
            visited.add(idx);

            const x = idx % size;
            const y = Math.floor(idx / size);

            if (newPixels[idx] === startColor) {
                newPixels[idx] = targetColor;

                if (x > 0) stack.push(idx - 1);
                if (x < size - 1) stack.push(idx + 1);
                if (y > 0) stack.push(idx - size);
                if (y < size - 1) stack.push(idx + size);
            }
        }
        setPixels(newPixels);
    };

    const undo = () => {
        if (historyIndex > 0) {
            const newIndex = historyIndex - 1;
            setHistoryIndex(newIndex);
            setPixels(history[newIndex]);
        }
    };

    const redo = () => {
        if (historyIndex < history.length - 1) {
            const newIndex = historyIndex + 1;
            setHistoryIndex(newIndex);
            setPixels(history[newIndex]);
        }
    };

    const requestClearBoard = () => {
        setIsClearModalOpen(true);
    };

    const confirmClearBoard = () => {
        const newPixels = Array(size * size).fill(null);
        setPixels(newPixels);
        saveToHistory(newPixels);
        setIsClearModalOpen(false);
    };

    const requestClearPalette = () => {
        setIsClearPaletteModalOpen(true);
    };

    const confirmClearPalette = () => {
        setCustomColors([]);
        setIsClearPaletteModalOpen(false);
    };

    const handleResize = (newSize) => {
        if (newSize < 4 || newSize > 64) return;
        const newPixels = Array(newSize * newSize).fill(null);
        for (let y = 0; y < Math.min(size, newSize); y++) {
            for (let x = 0; x < Math.min(size, newSize); x++) {
                const oldIdx = y * size + x;
                const newIdx = y * newSize + x;
                newPixels[newIdx] = pixels[oldIdx];
            }
        }
        setSize(newSize);
        setPixels(newPixels);
        saveToHistory(newPixels);
    };

    return (
        <div className="app-layout" onMouseUp={handleMouseUp}>
            <aside className={`sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
                <div className="sidebar-header">
                    <div className="logo-container">
                        <img src="/favicon.svg" alt="Numbit Logo" className="logo-icon" />
                        <div className="logo">Numbit</div>
                    </div>
                    <button
                        className="sidebar-close-btn"
                        onClick={() => setIsSidebarOpen(false)}
                        title="Close Sidebar"
                    >
                        <X size={20} />
                    </button>
                </div>
                <Toolbar
                    activeTool={activeTool}
                    setActiveTool={setActiveTool}
                    activeColor={activeColor}
                    setActiveColor={setActiveColor}
                    customColors={customColors}
                    setCustomColors={setCustomColors}
                    undo={undo}
                    redo={redo}
                    canUndo={historyIndex > 0}
                    canRedo={historyIndex < history.length - 1}
                    clearCustomColors={requestClearPalette}
                />
                <Controls
                    size={size}
                    setSize={handleResize}
                    clearBoard={requestClearBoard}
                    showGridLines={showGridLines}
                    setShowGridLines={setShowGridLines}
                    backgroundColor={backgroundColor}
                    setBackgroundColor={setBackgroundColor}
                    pixels={pixels}
                    width={size}
                    height={size}
                />
            </aside>
            <main className="main-content">
                {(!isSidebarOpen || window.innerWidth <= 768) && (
                    <button
                        className="sidebar-open-btn"
                        onClick={() => setIsSidebarOpen(true)}
                        title="Open Sidebar"
                    >
                        <Menu size={24} />
                    </button>
                )}
                <Grid
                    width={size}
                    height={size}
                    pixels={pixels}
                    previewPixels={previewPixels}
                    backgroundColor={backgroundColor}
                    onPixelClick={handlePixelClick}
                    onPixelEnter={handlePixelEnter}
                    onPixelDoubleClick={handlePixelDoubleClick}
                    isDrawing={isDrawing}
                    showGridLines={showGridLines}
                />
                <Modal
                    isOpen={isClearModalOpen}
                    title="Clear Board"
                    onConfirm={confirmClearBoard}
                    onCancel={() => setIsClearModalOpen(false)}
                    confirmText="Clear"
                    isDanger={true}
                >
                    Are you sure you want to clear the entire board? This action cannot be undone.
                </Modal>
                <Modal
                    isOpen={isClearPaletteModalOpen}
                    title="Clear Palette"
                    onConfirm={confirmClearPalette}
                    onCancel={() => setIsClearPaletteModalOpen(false)}
                    confirmText="Clear Palette"
                    isDanger={true}
                >
                    Are you sure you want to remove all custom colors? This action cannot be undone.
                </Modal>
                <CreditWidget />
            </main>
        </div >
    );
}

export default App;
