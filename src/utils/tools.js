// Tool definitions and logic

export const calculateLine = (start, end, fillMode = 'filled') => {
    const pixels = [];
    let x0 = start.x;
    let y0 = start.y;
    let x1 = end.x;
    let y1 = end.y;

    const dx = Math.abs(x1 - x0);
    const dy = Math.abs(y1 - y0);
    const sx = (x0 < x1) ? 1 : -1;
    const sy = (y0 < y1) ? 1 : -1;
    let err = dx - dy;

    let index = 0;
    while (true) {
        if (fillMode === 'dashed') {
            if (index % 2 === 0) {
                pixels.push({ x: x0, y: y0 });
            }
            index++;
        } else {
            pixels.push({ x: x0, y: y0 });
        }
        if ((x0 === x1) && (y0 === y1)) break;
        const e2 = 2 * err;
        if (e2 > -dy) { err -= dy; x0 += sx; }
        if (e2 < dx) { err += dx; y0 += sy; }
    }
    return pixels;
};

export const calculateRectangle = (start, end, fillMode = 'filled') => {
    const pixels = [];
    const minX = Math.min(start.x, end.x);
    const maxX = Math.max(start.x, end.x);
    const minY = Math.min(start.y, end.y);
    const maxY = Math.max(start.y, end.y);

    if (fillMode === 'filled') {
        // Fill entire rectangle
        for (let y = minY; y <= maxY; y++) {
            for (let x = minX; x <= maxX; x++) {
                pixels.push({ x, y });
            }
        }
    } else {
        // Outline or dashed outline
        for (let y = minY; y <= maxY; y++) {
            for (let x = minX; x <= maxX; x++) {
                const isEdge = (x === minX || x === maxX || y === minY || y === maxY);
                if (isEdge) {
                    if (fillMode === 'dashed') {
                        // Dashed pattern
                        if ((x + y) % 2 === 0) {
                            pixels.push({ x, y });
                        }
                    } else {
                        pixels.push({ x, y });
                    }
                }
            }
        }
    }
    return pixels;
};

export const calculateCircle = (start, end, fillMode = 'filled') => {
    const pixels = [];
    const minX = Math.min(start.x, end.x);
    const maxX = Math.max(start.x, end.x);
    const minY = Math.min(start.y, end.y);
    const maxY = Math.max(start.y, end.y);

    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    const radiusX = (maxX - minX) / 2;
    const radiusY = (maxY - minY) / 2;

    if (fillMode === 'filled') {
        // Fill entire circle
        for (let y = minY; y <= maxY; y++) {
            for (let x = minX; x <= maxX; x++) {
                const dx = (x - centerX) / (radiusX + 0.5);
                const dy = (y - centerY) / (radiusY + 0.5);
                if (dx * dx + dy * dy <= 1) {
                    pixels.push({ x, y });
                }
            }
        }
    } else {
        // Outline or dashed outline
        const threshold = 0.15; // Thickness of the outline
        for (let y = minY; y <= maxY; y++) {
            for (let x = minX; x <= maxX; x++) {
                const dx = (x - centerX) / (radiusX + 0.5);
                const dy = (y - centerY) / (radiusY + 0.5);
                const dist = dx * dx + dy * dy;

                // Check if pixel is on the edge
                if (dist <= 1 && dist >= (1 - threshold)) {
                    if (fillMode === 'dashed') {
                        if ((x + y) % 2 === 0) {
                            pixels.push({ x, y });
                        }
                    } else {
                        pixels.push({ x, y });
                    }
                }
            }
        }
    }
    return pixels;
};

export const getToolPixels = (tool, start, end, fillMode = 'filled') => {
    switch (tool) {
        case 'line': return calculateLine(start, end, fillMode);
        case 'square': return calculateRectangle(start, end, fillMode);
        case 'circle': return calculateCircle(start, end, fillMode);
        default: return [];
    }
};
