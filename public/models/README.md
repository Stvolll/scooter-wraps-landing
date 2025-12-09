# 3D Models Directory

This directory contains 3D model files for scooter visualization.

## Current Models

- `yamaha-nvx.glb` - Yamaha NVX scooter model (11 MB)

## Optimized Models (CDN)

Optimized models with Draco compression are available on CDN:

### Production CDN URLs

Replace these URLs with your actual CDN URLs after uploading optimized assets:

```
https://cdn.example.com/assets/models/yamaha-nvx.draco.glb
```

## Optimization Process

1. **Optimize models:**

   ```bash
   npm run optimize:3d
   ```

   This creates optimized `.draco.glb` files in `public/models/optimized/`

2. **Upload to CDN/S3:**

   ```bash
   npm run upload:cdn
   ```

   Or test without uploading:

   ```bash
   npm run upload:cdn:dry
   ```

3. **Update model paths:**
   - Update `config/scooters.js` to use CDN URLs
   - Replace local paths with CDN URLs

## File Structure

```
public/models/
├── README.md (this file)
├── yamaha-nvx.glb (original, 11 MB)
├── yamaha-nvx.mtl (material file)
├── yamaha-nvx.obj (source file)
└── optimized/
    └── yamaha-nvx.draco.glb (optimized, ~3-5 MB)
```

## CDN Configuration

After uploading to CDN/S3, update the following:

1. **Environment variables** (`.env.local`):

   ```bash
   CDN_BUCKET_NAME=your-bucket-name
   CDN_PREFIX=assets
   AWS_CLOUDFRONT_DOMAIN=d1234567890.cloudfront.net
   ```

2. **Model paths** in `config/scooters.js`:
   ```javascript
   model: process.env.CDN_URL + '/assets/models/yamaha-nvx.draco.glb'
   ```

## Benefits of Optimization

- **Size reduction**: 50-70% smaller files
- **Faster loading**: Reduced bandwidth usage
- **Better performance**: Draco compression for geometry
- **CDN delivery**: Global edge caching

## Notes

- Original `.glb` files remain in repository for reference
- Optimized files should be uploaded to CDN/S3
- Always test optimized models before deploying to production
