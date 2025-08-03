# Splitter Project Documentation

## Project Overview

The Splitter project is a Vue.js 3 application that provides two main image processing features:

1. **Image Splitter** - Splits images into grid parts for poster printing
2. **Standee Creator** - Creates printable standee sheets for tabletop gaming

The application works entirely in the browser using Canvas API and generates high-quality PDFs optimized for A4 printing at 300 DPI.

## Technical Architecture

### Technology Stack

- **Framework**: Vue.js 3.5.18 with Composition API
- **Build Tool**: Vite 7.0.6
- **PDF Generation**: jsPDF 3.0.1
- **State Management**: Pinia 3.0.3
- **Language**: JavaScript/TypeScript
- **Styling**: CSS with scoped styles

### Project Structure

```
splitter/
├── src/
│   ├── App.vue                 # Main application component
│   ├── main.ts                 # Vue app initialization
│   ├── components/             # Reusable Vue components
│   │   ├── AppLayout.vue       # Main layout with tab navigation
│   │   ├── FileUploadArea.vue  # Drag-and-drop file upload component
│   │   ├── MessageDisplay.vue  # Toast notification component
│   │   └── PreviewContainer.vue # Canvas preview wrapper
│   ├── views/                  # Page components
│   │   ├── ImageSplitter.vue   # Image splitting interface
│   │   └── StandeeCreator.vue  # Standee creation interface
│   ├── composables/            # Reusable composition functions
│   │   ├── useFileUpload.js    # File upload handling
│   │   ├── useImageCanvas.js   # Canvas operations for image splitting
│   │   ├── usePdfGeneration.js # PDF generation for split images
│   │   ├── useStandeeLayout.js # Standee sheet layout calculations
│   │   ├── useStandeePdfGeneration.js # PDF generation for standees
│   │   ├── useStandeePreview.js # Standee sheet preview rendering
│   │   └── useStandeeUpload.js # Standee image upload handling
│   ├── router/                 # Vue Router configuration
│   │   └── index.ts            # Route definitions
│   └── assets/                 # Static assets and styles
├── index.html                  # Application entry point
└── architecture-plan.md        # Initial architecture design
```

## Application Components

### Core Layout

- **AppLayout.vue** - Main application layout with header, tab navigation, and router-view for switching between features

### Shared Components

- **FileUploadArea.vue** - Reusable drag-and-drop file upload component with configurable accept types and multiple file support
- **PreviewContainer.vue** - Canvas wrapper component that provides a consistent preview area for both image splitting and standee creation
- **MessageDisplay.vue** - Toast notification component for displaying success, error, and info messages to users

### Views

- **ImageSplitter.vue** - Complete interface for image splitting functionality with grid controls and PDF generation
- **StandeeCreator.vue** - Interface for standee creation with size selection, batch management, and sheet generation

## Routing

The application uses Vue Router for navigation between the two main features:

- **/** - Redirects to `/image-splitter`
- **/image-splitter** - Image Splitter view
- **/standee-creator** - Standee Creator view

Navigation is handled through tab buttons in the AppLayout component with active state styling.

## Key Features

### 1. Image Splitting Functionality

#### Purpose

Splits large images into grid pieces for poster printing across multiple A4 pages.

#### Technical Details

- **Default Grid**: 2x2 (configurable from 1x1 to 10x10)
- **Supported Formats**: JPEG, PNG, WebP, GIF
- **File Size Limit**: 100MB (configurable)
- **Preview Canvas**: 800x800px max display size with 4x quality multiplier
- **Grid Overlay**: Visual feedback with crop marks and grid lines

#### Canvas Operations

- High-quality image rendering with `imageSmoothingQuality: 'high'`
- Grid lines drawn with dashed pattern `[2, 2]`
- Crop marks at corners for precise cutting guides
- 4x quality multiplier for sharp preview rendering

#### PDF Generation

- A4 format (210mm × 297mm)
- One grid piece per page
- Auto-detect orientation (portrait/landscape)
- JPEG compression at 0.92 quality
- L-shaped crop marks with 8mm length, 2mm offset

### 2. Standee Creation Functionality

#### Purpose

Creates printable standee sheets for tabletop gaming with fold lines for standing standees.

#### Technical Details

- **Standee Sizes**:
  - Small: 30mm (3cm)
  - Medium: 45mm (4.5cm)
  - Large: 60mm (6cm)
  - Very-large: 85mm (8.5cm)
  - Colossal: 150mm (15cm)
- **Max Standees**: 50 per batch
- **File Size Limit**: 5MB per standee image

#### Layout Calculations

- **Page Margin**: 40mm
- **Standing White Space**: 40mm (for base stability)
- **Fold Gap**: 4mm (between front and back)
- **Grid Gap**: 4mm (between standees)
- **Unit Dimensions**: Standee width × (white space + height + fold gap + height + white space)

#### Standee Sheet Structure

Each standee unit contains:

1. Standing white space (40mm)
2. Flipped standee image (for back)
3. Fold gap (4mm)
4. Original standee image (for front)
5. Standing white space (40mm)

## Recent Changes

### Token to Standee Refactoring

The project recently underwent a comprehensive refactoring to rename "Token" functionality to "Standee" for better clarity:

- Renamed `useTokenLayout.js` → `useStandeeLayout.js`
- Renamed `useTokenPdfGeneration.js` → `useStandeePdfGeneration.js`
- Renamed `useTokenPreview.js` → `useStandeePreview.js`
- Renamed `useTokenUpload.js` → `useStandeeUpload.js`
- Renamed `TokenCreator.vue` → `StandeeCreator.vue`
- Updated all internal references and terminology

### Enhanced Quality for A4 Printing

The project recently underwent significant improvements to enhance standee image quality for A4 printing:

#### Resolution Settings

- **A4 300 DPI Dimensions**: 2480 × 3508 pixels
- **PDF Render Scale**: 8x for maximum quality
- **Canvas Quality Multiplier**: 4x for sharp previews
- **Preview Scale**: 8x constant for consistent rendering

#### Quality Optimizations

1. **Canvas Rendering**:

   ```javascript
   ctx.imageSmoothingEnabled = true;
   ctx.imageSmoothingQuality = 'high';
   ctx.textRenderingOptimization = 'optimizeQuality';
   ```

2. **PDF Generation**:

   - Temporary canvas at A4 300 DPI resolution
   - PNG format for lossless quality
   - No compression in jsPDF (`compress: false`)
   - Image format set to 'NONE' for no additional compression

3. **Standee Scaling**:
   - Precise scaling calculations to fit A4 dimensions
   - Maintains aspect ratio (1:1 for square standees)
   - Padding of 2mm for clean edges

## Technical Decisions

### Canvas-Based Architecture

- **Rationale**: Direct browser support, no external dependencies
- **Benefits**: Real-time preview, client-side processing, privacy
- **Trade-off**: Memory usage for large images

### High-Resolution Rendering

- **8x Scale Factor**: Ensures 300 DPI print quality
- **4x Quality Multiplier**: Sharp previews without performance impact
- **A4 Target Resolution**: Standard for professional printing

### Composables Pattern

- **Modular Design**: Each feature in separate composable
- **Reusability**: Shared logic between image splitting and standee creation
- **Maintainability**: Clear separation of concerns

### Grid-Based Layouts

- **Mathematical Precision**: Exact calculations for margins and gaps
- **Flexibility**: Supports different standee sizes on same principles
- **Print Optimization**: Accounts for cutting tolerances

## Performance Considerations

### Memory Management

- **Preview Optimization**: Limited to 800x800px display
- **Lazy Canvas Creation**: Only creates when needed
- **Cleanup**: Proper canvas disposal after use

### File Size Handling

- **Image Splitter**: 100MB limit to prevent browser crashes
- **Standee Creator**: 5MB per standee, 50 standee maximum
- **Validation**: File size checked before processing

### Rendering Strategy

- **Asynchronous Processing**: Uses setTimeout for non-blocking PDF generation
- **Progress Feedback**: Loading states during generation
- **Error Boundaries**: Try-catch blocks prevent app crashes

## Code Quality Issues

### Debug Code Cleanup Needed

- **StandeeCreator.vue**: Contains multiple `console.log` statements that should be removed for production
  - Lines include container diagnostics, CSS debugging, and processing logs
  - These were added during development for debugging standee preview rendering issues

## Future Considerations

### Potential Enhancements

1. **Web Workers**: Offload heavy processing for better performance
2. **Progressive Enhancement**: Support for more image formats
3. **Batch Processing**: Queue system for multiple PDFs
4. **Custom Page Sizes**: Support beyond A4 format

### Scalability

- **Modular Architecture**: Easy to add new features
- **Composable Pattern**: Facilitates code reuse
- **Clear Interfaces**: Well-defined component boundaries

### Maintenance

- **No External Dependencies**: Only jsPDF for PDF generation
- **Standard Vue Patterns**: Familiar to Vue developers
- **Clear Naming**: Self-documenting code structure

## Browser Compatibility

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

Requires support for:

- Canvas API
- FileReader API
- ES6+ JavaScript features
- CSS Grid and Flexbox
