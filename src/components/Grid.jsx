import React, { useState, useEffect, useRef } from 'react';
import './Grid.css';

const Grid = ({ width, height, pixels, previewPixels, backgroundColor, onPixelClick, onPixelEnter, onPixelDoubleClick, isDrawing, showGridLines = true }) => {
    const gridRef = useRef(null);

    const style = {
        display: 'grid',
        gridTemplateColumns: `repeat(${width}, 1fr)`,
        gridTemplateRows: `repeat(${height}, 1fr)`,
        width: `min(100%, calc((100vh - 4rem) * ${width / height}))`,
        aspectRatio: `${width} / ${height}`,
        border: '1px solid var(--border)',
        backgroundColor: backgroundColor || 'transparent',
    };

    // Helper function to get pixel index from touch event
    const getPixelIndexFromTouch = (touch) => {
        const element = document.elementFromPoint(touch.clientX, touch.clientY);
        if (element && element.classList.contains('pixel')) {
            const pixelElements = Array.from(gridRef.current.querySelectorAll('.pixel'));
            return pixelElements.indexOf(element);
        }
        return -1;
    };

    // Handle touch start
    const handleTouchStart = (e, index) => {
        e.preventDefault();
        onPixelClick(index);
    };

    // Handle touch move
    const handleTouchMove = (e) => {
        e.preventDefault();
        if (e.touches.length > 0) {
            const touch = e.touches[0];
            const index = getPixelIndexFromTouch(touch);
            if (index !== -1) {
                onPixelEnter(index);
            }
        }
    };

    return (
        <div className="grid-container">
            <div
                className={`pixel-grid ${showGridLines ? 'show-lines' : ''}`}
                style={style}
                ref={gridRef}
            >
                {pixels.map((color, index) => {
                    // If there is a preview color for this pixel, use it, otherwise use the committed color
                    const displayColor = (previewPixels && previewPixels[index] !== undefined)
                        ? previewPixels[index]
                        : color;

                    return (
                        <div
                            key={index}
                            className="pixel"
                            style={{ backgroundColor: displayColor || 'transparent' }}
                            onMouseDown={(e) => {
                                e.preventDefault();
                                onPixelClick(index);
                            }}
                            onMouseEnter={(e) => {
                                onPixelEnter(index);
                            }}
                            onDoubleClick={(e) => {
                                e.preventDefault();
                                onPixelDoubleClick(index);
                            }}
                            onTouchStart={(e) => handleTouchStart(e, index)}
                            onTouchMove={handleTouchMove}
                        />
                    );
                })}
            </div>
        </div>
    );
};

export default Grid;
