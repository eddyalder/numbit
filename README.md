# Numbit

Numbit is a modern, feature-rich 8-bit art creator built with React and Vite. It provides a clean, dark-themed interface for creating pixel art with ease.

## Features

### Drawing Tools
- **Pen**: Draw individual pixels.
- **Eraser**: Remove pixels.
- **Bucket Fill**: Fill connected areas with color.
- **Shapes**: Drag-to-draw Rectangles, Circles, and Lines.
- **Double-Click**: Quickly remove any pixel.

### Color Management
- **Preset Palette**: A curated selection of vibrant colors.
- **Custom Colors**: Pick any hex color and add it to your custom palette.
- **Background**: Choose between a transparent background or any solid color.

### Grid Controls
- **Resizable Grid**: Adjust canvas size from 4x4 up to 64x64.
- **Grid Lines**: Toggle grid lines on/off for a cleaner preview.
- **Responsive**: The grid automatically scales to fit your screen while maintaining a perfect aspect ratio.

### Persistence & Export
- **Auto-Save**: Your artwork, palette, and settings are automatically saved to local storage.
- **Export**: Download your creation as PNG, JPG, or PDF.

## Tech Stack

- **Framework**: React
- **Build Tool**: Vite
- **Styling**: CSS Variables (Dark Mode)
- **Icons**: Lucide React
- **Export**: html2canvas, jspdf

## Getting Started

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Run Development Server**:
    ```bash
    npm run dev
    ```

3.  **Build for Production**:
    ```bash
    npm run build
    ```

## License

MIT
