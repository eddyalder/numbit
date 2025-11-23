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
                        />
                    );
                })}
            </div>
        </div>
    );
};

export default Grid;
