import React from 'react';
import { Download, Trash2, Grid3X3, FileDown, RotateCcw } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import './Controls.css';

const Controls = ({ size, setSize, clearBoard, showGridLines, setShowGridLines, backgroundColor, setBackgroundColor, pixels, width, height }) => {

    const handleExport = async (format) => {
        const gridElement = document.querySelector('.pixel-grid');
        if (!gridElement) return;

        // Temporarily hide grid lines for clean export if desired, or keep them. 
        // Requirement says "export the grid and their work", so keeping lines is probably fine, 
        // but usually art exports don't want lines. Let's ask or assume art-only is better.
        // I'll keep lines if they are on, but maybe users want a clean export.
        // Let's toggle lines off for export to be safe/cleaner.
        const wasShowingLines = gridElement.classList.contains('show-lines');
        if (wasShowingLines) gridElement.classList.remove('show-lines');

        try {
            const canvas = await html2canvas(gridElement, {
                backgroundColor: backgroundColor || null, // Use the selected background color, or null for transparent
                scale: 4, // Higher resolution
            });

            if (format === 'png' || format === 'jpg') {
                const link = document.createElement('a');
                link.download = `8bit-art.${format}`;
                link.href = canvas.toDataURL(`image/${format === 'jpg' ? 'jpeg' : 'png'}`);
                link.click();
            } else if (format === 'pdf') {
                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF({
                    orientation: 'landscape',
                });
                const imgProps = pdf.getImageProperties(imgData);
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
                pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
                pdf.save('8bit-art.pdf');
            }
        } catch (err) {
            console.error("Export failed", err);
        } finally {
            if (wasShowingLines) gridElement.classList.add('show-lines');
        }
    };

    return (
        <div className="controls-container">
            <div className="section-title">Grid Settings</div>

            <div className="control-group">
                <div className="label-row">
                    <label>Size: {size}x{size}</label>
                    <button className="reset-btn" onClick={() => setSize(16)} title="Reset Size">
                        <RotateCcw size={12} />
                    </button>
                </div>
                <input
                    type="range"
                    min="4"
                    max="64"
                    step="4"
                    value={size}
                    onChange={(e) => setSize(parseInt(e.target.value))}
                    className="size-slider"
                />
            </div>

            <div className="control-group">
                <label>Background</label>
                <div className="bg-picker">
                    <div className="bg-option">
                        <input
                            type="radio"
                            id="bg-transparent"
                            name="bg-color"
                            checked={!backgroundColor}
                            onChange={() => setBackgroundColor(null)}
                        />
                        <label htmlFor="bg-transparent">Transparent</label>
                    </div>
                    <div className="bg-option">
                        <input
                            type="radio"
                            id="bg-color"
                            name="bg-color"
                            checked={!!backgroundColor}
                            onChange={() => !backgroundColor && setBackgroundColor('#000000')}
                        />
                        <div className="color-input-wrapper">
                            <input
                                type="color"
                                value={backgroundColor || '#000000'}
                                onChange={(e) => setBackgroundColor(e.target.value)}
                                disabled={!backgroundColor}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="control-group checkbox-group">
                <label htmlFor="grid-lines">Show Grid Lines</label>
                <input
                    type="checkbox"
                    id="grid-lines"
                    checked={showGridLines}
                    onChange={(e) => setShowGridLines(e.target.checked)}
                />
            </div>

            <div className="section-title">Actions</div>
            <div className="actions-grid">
                <button className="action-btn danger" onClick={clearBoard}>
                    <Trash2 size={18} />
                    <span>Clear</span>
                </button>
            </div>

            <div className="section-title">Export</div>
            <div className="export-buttons">
                <button className="action-btn" onClick={() => handleExport('png')}>
                    <Download size={18} />
                    <span>PNG</span>
                </button>
                <button className="action-btn" onClick={() => handleExport('jpg')}>
                    <FileDown size={18} />
                    <span>JPG</span>
                </button>
                <button className="action-btn" onClick={() => handleExport('pdf')}>
                    <FileDown size={18} />
                    <span>PDF</span>
                </button>
            </div>
        </div>
    );
};

export default Controls;
