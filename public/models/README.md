# 3D Model Files

This directory contains GLB model files for each scooter.

## Required Models

Place the following GLB files in this directory:

- `honda-vision.glb` - Honda Vision 3D model
- `honda-lead.glb` - Honda Lead 3D model (already exists)
- `honda-sh.glb` - Honda SH 3D model
- `honda-pcx.glb` - Honda PCX 3D model
- `yamaha-nvx.glb` - Yamaha NVX 3D model (already exists)

## Model Requirements

- **Format**: GLB (binary glTF) - recommended for web
- **File Size**: Optimize for web (aim for < 5MB per model)
- **Geometry**: Clean, optimized mesh
- **Materials**: Use PBR materials (Metallic-Roughness workflow)
- **Textures**: Embed textures in GLB or reference external files

## Material Variants (Recommended)

For design switching, export your models with material variants:

1. In Blender/your 3D software, create material variants for each design
2. Name variants clearly (e.g., "neon-blade", "holo-lines", "carbon-fiber")
3. Export as GLB with variants enabled
4. The model-viewer component will switch variants automatically

## Alternative: Separate Model Files

If material variants aren't available, you can:
1. Create separate GLB files for each design (e.g., `honda-lead-neon.glb`, `honda-lead-holo.glb`)
2. Update `config/scooters.js` to point to different model files per design
3. The component will load the appropriate model when design changes

## Optimization Tips

- Use glTF-Pipeline to optimize models: `gltf-pipeline -i input.glb -o output.glb`
- Compress textures before embedding
- Remove unused materials and nodes
- Use Draco compression for geometry if needed



