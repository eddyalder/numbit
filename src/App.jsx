import { useState, useCallback, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import Grid from './components/Grid';
import Toolbar from './components/Toolbar';
import Controls from './components/Controls';
import Modal from './components/Modal';
import { getToolPixels } from './utils/tools';
import './App.css';

const DEFAULT_SIZE = 16;
const MAX_HISTORY = 50;

function App() {
    const [size, setSize] = useState(DEFAULT_SIZE);
    const [pixels, setPixels] = useState(Array(DEFAULT_SIZE * DEFAULT_SIZE).fill(null));
    const [activeColor, setActiveColor] = useState('#ffffff');
    const [backgroundColor, setBackgroundColor] = useState('#000000'); // Default black for 8-bit feel
    const [customColors, setCustomColors] = useState([]);
    const [activeTool, setActiveTool] = useState('pen');
    const [isDrawing, setIsDrawing] = useState(false);
    const [history, setHistory] = useState([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const [showGridLines, setShowGridLines] = useState(true);
    const [isClearModalOpen, setIsClearModalOpen] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);

    // Shape drawing state
    const [dragStart, setDragStart] = useState(null);
    const [previewPixels, setPreviewPixels] = useState(null);

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
                if (parsed.backgroundColor) setBackgroundColor(parsed.backgroundColor);
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
        setIsDrawing(true);

        if (['square', 'circle', 'line'].includes(activeTool)) {
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

        if (['square', 'circle', 'line'].includes(activeTool)) {
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

        if (['square', 'circle', 'line'].includes(activeTool) && dragStart !== null && previewPixels) {
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
                    <div className="logo">Numbit</div>
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
                    Are you sure you want to clear the entire board? This action cannot be undone via history if you navigate away.
                </Modal>
            </main>
        </div>
    );
}

export default App;
