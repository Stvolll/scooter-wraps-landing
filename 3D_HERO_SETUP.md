# 3D Hero Scene Setup Guide

This document explains the new full-screen 3D hero scene implementation using `<model-viewer>`.

## Overview

The homepage features a full-screen 3D hero scene that:

- Occupies the first 100vh (full viewport height)
- Uses `<model-viewer>` web component for 3D rendering
- Includes a soft-lit environment with HDRI lighting
- Scrolls out with parallax effect before revealing content
- Supports dynamic model and design switching

## File Structure

```
scooter-wraps-landing/
├── app/
│   ├── page.tsx              # Main homepage with 3D hero scene
│   └── layout.tsx            # Includes model-viewer script
├── components/
│   └── ScooterViewer.jsx     # 3D viewer component using model-viewer
├── config/
│   └── scooters.js           # Scooter models and designs configuration
├── public/
│   ├── models/               # GLB model files
│   │   ├── honda-vision.glb
│   │   ├── honda-lead.glb
│   │   ├── honda-sh.glb
│   │   ├── honda-pcx.glb
│   │   └── yamaha-nvx.glb
│   ├── textures/             # Texture images for designs
│   │   ├── vision/
│   │   ├── lead/
│   │   ├── sh/
│   │   ├── pcx/
│   │   └── nvx/
│   └── hdr/
│       └── studio.hdr        # Optional HDRI environment
└── types/
    └── model-viewer.d.ts     # TypeScript declarations
```

## Setup Steps

### 1. Install Dependencies

```bash
npm install
```

The `@google/model-viewer` package is already added to `package.json`.

### 2. Add 3D Models

Place your GLB model files in `/public/models/`:

- `honda-vision.glb`
- `honda-lead.glb` (already exists)
- `honda-sh.glb`
- `honda-pcx.glb`
- `yamaha-nvx.glb` (already exists)

### 3. Add Texture Images (Optional)

If using texture-based design switching, place texture images in `/public/textures/{model-id}/`:

- `/textures/vision/neon.png`
- `/textures/vision/holo.png`
- etc.

See `/public/textures/README.md` for details.

### 4. Add HDRI Environment (Optional)

For soft studio lighting, add an HDRI file:

- `/public/hdr/studio.hdr`

See `/public/hdr/README.md` for sources and recommendations.

## Design Switching Methods

### Method 1: Material Variants (Recommended)

1. Export your GLB models with material variants in Blender/glTF
2. Each variant should have a unique name (e.g., "neon-blade", "holo-lines")
3. Update `config/scooters.js` to use `variant` instead of `texture`:

```javascript
designs: [
  {
    id: '01',
    name: 'Neon Blade',
    variant: 'neon-blade', // Use variant name
  },
]
```

4. The model-viewer component will automatically switch variants using the `variant-name` attribute.

### Method 2: Separate Model Files

1. Create separate GLB files for each design:
   - `honda-lead-neon.glb`
   - `honda-lead-holo.glb`
   - etc.

2. Update `config/scooters.js` to point to different model files:

```javascript
designs: [
  {
    id: '01',
    name: 'Neon Blade',
    model: '/models/honda-lead-neon.glb', // Different model file
  },
]
```

3. Update `ScooterViewer.jsx` to use `modelPath` from the design config.

### Method 3: Texture Swapping

Texture swapping is more complex and may not work reliably with all model-viewer versions. It's recommended to use Method 1 or 2 instead.

## Configuration

Edit `/config/scooters.js` to:

- Add new scooter models
- Add new designs for each model
- Configure texture paths or variant names
- Set model file paths

## Features

### Parallax Scroll Effect

The 3D scene scrolls out with a parallax effect:

- Scene is fixed at 100vh
- Transforms upward as user scrolls
- Fades out when scroll passes trigger point (80% of viewport)
- Reveals white content block below

### Model Switching

- Top menu allows switching between 5 scooter models
- No page reload, no scroll reset
- Product cards update automatically
- 3D model switches instantly

### Design Switching

- Click any product card to see design on 3D model
- Updates in real-time
- Uses material variants or texture swapping
- Visual feedback (ring highlight) on selected design

## Troubleshooting

### Model Not Loading

- Check file path in `config/scooters.js`
- Ensure GLB file exists in `/public/models/`
- Check browser console for errors
- Verify GLB file is valid (not corrupted)

### Design Not Switching

- If using variants: Ensure GLB has material variants defined
- If using textures: Check texture file paths
- Check browser console for errors
- Verify design config in `config/scooters.js`

### Performance Issues

- Optimize GLB files (use glTF-Pipeline)
- Compress textures
- Reduce model complexity
- Use material variants instead of texture swapping

### model-viewer Not Loading

- Check network tab for script loading
- Verify script tag in `app/layout.tsx`
- Check browser compatibility (Chrome, Firefox, Safari supported)

## Browser Support

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support (iOS 12+)
- Older browsers: May need polyfills

## Next Steps

1. Add your 3D models to `/public/models/`
2. Configure designs in `/config/scooters.js`
3. Add texture images or set up material variants
4. Test model and design switching
5. Customize styling and animations as needed

## Resources

- [model-viewer Documentation](https://modelviewer.dev/)
- [glTF Specification](https://www.khronos.org/gltf/)
- [Blender glTF Export Guide](https://docs.blender.org/manual/en/latest/addons/import_export/scene_gltf2.html)


