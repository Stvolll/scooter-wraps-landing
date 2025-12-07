# Setup Guide

## Quick Start

1. **Install dependencies:**
```bash
cd scooter-wraps-landing
npm install
```

2. **Set up environment variables:**
```bash
cp .env.example .env.local
# Edit .env.local with your actual values
```

3. **Add 3D models:**
   - Place optimized GLB files (2-5 MB each) in `public/models/`
   - Required models:
     - `honda-lead.glb`
     - `honda-vision.glb`
     - `honda-airblade.glb`
     - `yamaha-nvx.glb`
     - `vinfast.glb`
     - `vespa.glb`

4. **Add design images:**
   - Place design preview images in `public/designs/`
   - Place texture images in `public/textures/`

5. **Run development server:**
```bash
npm run dev
```

Visit `http://localhost:3000`

## 3D Model Requirements

### Model Optimization

1. **File Size**: Target 2-5 MB per model
2. **Format**: GLB (binary glTF) preferred
3. **Compression**: Use DRACO compression
4. **LODs**: Implement Level of Detail (LOD) for performance
5. **Textures**: 
   - Use compressed textures (JPEG/WebP)
   - Maximum 2048x2048 resolution
   - Optimize texture maps (diffuse, normal, roughness)

### Tools for Optimization

- **Blender**: Export to glTF/GLB with compression
- **glTF-Pipeline**: Command-line tool for optimization
  ```bash
  npm install -g gltf-pipeline
  gltf-pipeline -i input.glb -o output.glb -d
  ```
- **Draco Compression**: Reduce geometry size
- **Texture Compression**: Use tools like `squoosh` or `imagemin`

### Model Structure

Each model should have:
- Clean topology
- UV mapping for texture application
- Named materials for texture swapping
- Proper scale (1 unit = 1 meter)

## Design Assets

### Design Images
- Format: JPEG or WebP
- Size: 1200x1200px minimum
- Aspect ratio: 1:1 (square)
- File naming: `{design-name}.jpg`

### Texture Images
- Format: JPEG or PNG
- Size: 2048x2048px (or appropriate for model)
- File naming: `design-{number}.jpg`

## Payment Integration

### MoMo Wallet

1. Register at [MoMo Developer Portal](https://developers.momo.vn/)
2. Get Partner Code, Access Key, and Secret Key
3. Update `.env.local`:
   ```
   MOMO_PARTNER_CODE=your_code
   MOMO_ACCESS_KEY=your_key
   MOMO_SECRET_KEY=your_secret
   ```
4. Implement payment flow in `app/api/checkout/route.ts`

### ZaloPay

1. Register at [ZaloPay Developer](https://zalopay.vn/developer)
2. Get App ID, Key1, and Key2
3. Update `.env.local`:
   ```
   ZALOPAY_APP_ID=your_app_id
   ZALOPAY_KEY1=your_key1
   ZALOPAY_KEY2=your_key2
   ```
4. Implement payment flow in `app/api/checkout/route.ts`

## Database Setup (Production)

### PostgreSQL Example

```sql
CREATE TABLE orders (
  id VARCHAR(255) PRIMARY KEY,
  design_id VARCHAR(255) NOT NULL,
  payment_method VARCHAR(50) NOT NULL,
  delivery_option VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255),
  address TEXT NOT NULL,
  total_price INTEGER NOT NULL,
  status VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE bookings (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255),
  scooter_model VARCHAR(255) NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  workshop_id VARCHAR(50) NOT NULL,
  timezone VARCHAR(50) NOT NULL,
  notes TEXT,
  status VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Other Platforms

- **Netlify**: Similar to Vercel
- **AWS Amplify**: For AWS infrastructure
- **DigitalOcean App Platform**: For custom deployments

## Performance Checklist

- [ ] Optimize 3D models (2-5 MB each)
- [ ] Compress images (WebP format)
- [ ] Enable CDN for static assets
- [ ] Implement lazy loading
- [ ] Add service worker caching
- [ ] Optimize fonts (subset Vietnamese characters)
- [ ] Minimize JavaScript bundle
- [ ] Enable compression (gzip/brotli)

## SEO Checklist

- [ ] Update meta tags in `app/layout.tsx`
- [ ] Add sitemap.xml
- [ ] Submit to Google Search Console
- [ ] Add Google Analytics
- [ ] Verify structured data
- [ ] Optimize images with alt text
- [ ] Add canonical URLs
- [ ] Set up 404 page

## Testing

### Manual Testing

1. **3D Model Interaction:**
   - Test rotation/swipe on mobile
   - Verify texture switching
   - Check fullscreen mode
   - Test on low-end devices

2. **Checkout Flow:**
   - Test all payment methods
   - Verify form validation
   - Test error handling
   - Check email/SMS notifications

3. **Booking System:**
   - Test date selection
   - Verify time slot availability
   - Check conflict detection
   - Test timezone handling

### Performance Testing

- Use Lighthouse (Chrome DevTools)
- Target: 90+ Performance score
- Test on 3G/4G networks
- Test on various devices

## Troubleshooting

### 3D Models Not Loading

- Check file paths in `public/models/`
- Verify GLB file format
- Check browser console for errors
- Ensure models are optimized

### Payment Not Working

- Verify API keys in `.env.local`
- Check payment gateway logs
- Test in sandbox mode first
- Verify webhook endpoints

### Build Errors

- Clear `.next` folder: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Check TypeScript errors: `npm run lint`

## Support

For issues or questions:
- Email: info@decalwrap.vn
- Check documentation in `README.md`
- Review `PROJECT_STRUCTURE.md` for API details

