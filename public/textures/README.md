# Texture Files Structure

This directory contains texture images for each scooter model and design variant.

## Directory Structure

```
textures/
├── vision/          # Honda Vision textures
│   ├── neon.png
│   ├── holo.png
│   ├── carbon.png
│   └── racing.png
├── lead/            # Honda Lead textures
│   ├── neon.png
│   ├── holo.png
│   └── carbon.png
├── sh/              # Honda SH textures
│   ├── neon.png
│   ├── holo.png
│   ├── carbon.png
│   └── racing.png
├── pcx/             # Honda PCX textures
│   ├── neon.png
│   ├── holo.png
│   └── carbon.png
└── nvx/             # Yamaha NVX textures
    ├── neon.png
    ├── holo.png
    ├── carbon.png
    └── racing.png
```

## Adding Textures

1. Create texture images for each design (PNG format recommended)
2. Name them according to the design ID in `config/scooters.js`
3. Place them in the appropriate model directory
4. Update the texture paths in `config/scooters.js` if needed

## Texture Requirements

- **Format**: PNG or JPG
- **Resolution**: 2048x2048 or higher recommended
- **UV Mapping**: Ensure textures match your 3D model's UV layout
- **File Size**: Optimize for web (use compression tools if needed)

## Material Variants Alternative

Instead of texture swapping, you can use material variants in your GLB models:

1. Export your GLB with material variants defined
2. Each variant should have a unique name (e.g., "neon-blade", "holo-lines")
3. Update `config/scooters.js` to use `variant` instead of `texture`
4. The model-viewer component will automatically switch variants


