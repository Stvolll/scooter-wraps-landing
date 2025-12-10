'use client'

export default function UploadGuide() {
  return (
    <div
      className="p-6 rounded-2xl mb-6"
      style={{
        background: 'rgba(255, 255, 255, 0.06)',
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2) inset',
      }}
    >
      <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
        <span>📋</span> Content Upload Guidelines
      </h3>
      <p className="mb-4 text-white/70">
        Please follow these guidelines for optimal display and performance of your designs.
      </p>

      <div className="space-y-6">
        <div>
          <h4 className="text-lg font-semibold text-[#00FFA9] mb-2">1. Cover Image</h4>
          <ul className="list-disc list-inside space-y-1 text-white/70">
            <li>
              <strong>Purpose:</strong> Main thumbnail for the design list and social sharing.
            </li>
            <li>
              <strong>Format:</strong> JPG, PNG, WebP (preferred).
            </li>
            <li>
              <strong>Resolution:</strong> Optimal 1200x800px (aspect ratio 3:2). Minimum 800x533px.
            </li>
            <li>
              <strong>Size:</strong> Max 500KB. Use WebP for best compression.
            </li>
            <li>
              <strong>Naming:</strong>{' '}
              <code className="text-[#00FFA9]">[design-slug]-cover.webp</code> (e.g.,{' '}
              <code className="text-[#00FFA9]">neon-blade-cover.webp</code>).
            </li>
            <li>
              <strong>Upload Location:</strong> S3 bucket →{' '}
              <code className="text-[#00FFA9]">/images/designs/</code>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-lg font-semibold text-[#00D4FF] mb-2">2. 3D Model (GLB)</h4>
          <ul className="list-disc list-inside space-y-1 text-white/70">
            <li>
              <strong>Purpose:</strong> The actual 3D model of the scooter with the design applied.
            </li>
            <li>
              <strong>Format:</strong> GLB (binary GLTF).
            </li>
            <li>
              <strong>Size:</strong> Max 50MB. Keep it as low as possible for fast loading.
            </li>
            <li>
              <strong>Optimization:</strong> Use{' '}
              <code className="text-[#00D4FF]">gltf-pipeline</code> or{' '}
              <code className="text-[#00D4FF]">gltfpack</code> for Draco compression.
            </li>
            <li>
              <strong>Textures:</strong> Embed textures directly into the GLB or ensure paths are
              relative to the GLB.
            </li>
            <li>
              <strong>Naming:</strong>{' '}
              <code className="text-[#00D4FF]">[scooter-model-slug]-[design-slug].glb</code> (e.g.,{' '}
              <code className="text-[#00D4FF]">honda-vision-neon-blade.glb</code>).
            </li>
            <li>
              <strong>Upload Location:</strong> S3 bucket →{' '}
              <code className="text-[#00D4FF]">/models/</code>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-lg font-semibold text-[#B77EFF] mb-2">3. Texture (for 3D Model)</h4>
          <ul className="list-disc list-inside space-y-1 text-white/70">
            <li>
              <strong>Purpose:</strong> High-resolution texture map applied to the 3D model.
            </li>
            <li>
              <strong>Format:</strong> JPG, PNG, KTX2 (Basis Universal) for best performance.
            </li>
            <li>
              <strong>Resolution:</strong> Optimal 2048x2048px. Power of 2 dimensions are best
              (1024, 2048, 4096).
            </li>
            <li>
              <strong>UV Mapping:</strong> Ensure the 3D model has proper UV unwrapping for the
              texture to apply correctly.
            </li>
            <li>
              <strong>Naming:</strong>{' '}
              <code className="text-[#B77EFF]">[scooter-model-slug]-[design-slug]-texture.png</code>{' '}
              (e.g., <code className="text-[#B77EFF]">honda-vision-neon-blade-texture.png</code>).
            </li>
            <li>
              <strong>Upload Location:</strong> S3 bucket →{' '}
              <code className="text-[#B77EFF]">/textures/</code>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-lg font-semibold text-[#FFB800] mb-2">4. Gallery Images</h4>
          <ul className="list-disc list-inside space-y-1 text-white/70">
            <li>
              <strong>Purpose:</strong> Additional high-quality renders or photos of the design.
            </li>
            <li>
              <strong>Format:</strong> JPG, PNG, WebP (preferred).
            </li>
            <li>
              <strong>Resolution:</strong> Optimal 1920x1080px or similar high-res.
            </li>
            <li>
              <strong>Quantity:</strong> 3-5 images per design is recommended.
            </li>
            <li>
              <strong>Naming:</strong>{' '}
              <code className="text-[#FFB800]">[design-slug]-gallery-[number].webp</code> (e.g.,{' '}
              <code className="text-[#FFB800]">neon-blade-gallery-01.webp</code>).
            </li>
            <li>
              <strong>Upload Location:</strong> S3 bucket →{' '}
              <code className="text-[#FFB800]">/images/designs/</code>
            </li>
          </ul>
        </div>
      </div>

      <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/10">
        <p className="text-white/90 font-medium mb-2">💡 Optimization Tips:</p>
        <ul className="list-disc list-inside space-y-1 text-white/70 text-sm">
          <li>Use WebP for images (smaller size with same quality)</li>
          <li>
            Compress GLB files with <code className="text-[#00FFA9]">gltf-pipeline</code> before
            upload
          </li>
          <li>Textures should be square (power of 2: 512, 1024, 2048, 4096)</li>
          <li>Avoid overly large files - they slow down site loading</li>
          <li>For best performance, use KTX2/Basis Universal format for textures</li>
        </ul>
      </div>

      <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/10">
        <p className="text-white/90 font-medium mb-2">💡 Optimization Tips:</p>
        <ul className="list-disc list-inside space-y-1 text-white/70 text-sm">
          <li>Use WebP for images (smaller size with same quality)</li>
          <li>
            Compress GLB files with <code className="text-[#00FFA9]">gltf-pipeline</code> before
            upload
          </li>
          <li>Textures should be square (power of 2: 512, 1024, 2048, 4096)</li>
          <li>Avoid overly large files - they slow down site loading</li>
          <li>For best performance, use KTX2/Basis Universal format for textures</li>
        </ul>
      </div>

      <div className="mt-6 p-6 rounded-2xl bg-gradient-to-br from-[#00FFA9]/10 to-[#00D4FF]/10 border border-[#00FFA9]/20">
        <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <span>📍</span> Where Your Content Appears on the Site
        </h4>
        <div className="space-y-4 text-white/80 text-sm">
          <div>
            <strong className="text-[#00FFA9]">1. Hero Section (First Screen):</strong>
            <ul className="list-disc list-inside ml-2 mt-1 space-y-1 text-white/70">
              <li>
                <strong>3D Model (GLB)</strong> - Displayed in the interactive 3D viewer at the top
                of the page
              </li>
              <li>
                <strong>Texture</strong> - Applied to the 3D model when a design is selected
              </li>
              <li>
                <strong>Cover Image</strong> - Shown in design cards below the 3D viewer
              </li>
            </ul>
          </div>

          <div>
            <strong className="text-[#00D4FF]">2. Product Experience Section:</strong>
            <ul className="list-disc list-inside ml-2 mt-1 space-y-1 text-white/70">
              <li>
                <strong>&quot;How to Apply&quot;</strong> - Interactive blueprint guide (uses
                model-specific data)
              </li>
              <li>
                <strong>&quot;Production Process&quot;</strong> - Static workflow timeline (no file
                uploads needed)
              </li>
              <li>
                <strong>Bento Grid</strong> - Uses placeholder images for product highlights
                (film-texture-macro.svg, packaging-tube.svg)
              </li>
            </ul>
          </div>

          <div>
            <strong className="text-[#B77EFF]">3. Gallery Section:</strong>
            <ul className="list-disc list-inside ml-2 mt-1 space-y-1 text-white/70">
              <li>
                <strong>Gallery Images</strong> - Displayed in the masonry grid with filters
              </li>
              <li>Used to showcase completed wraps and real installations</li>
              <li>Best practice: Include 3-5 high-quality photos per design</li>
            </ul>
          </div>

          <div>
            <strong className="text-[#FFB800]">4. Other Sections (Static Content):</strong>
            <ul className="list-disc list-inside ml-2 mt-1 space-y-1 text-white/70">
              <li>
                <strong>USP Section</strong> - &quot;Why Choose TXD?&quot; (no file uploads needed)
              </li>
              <li>
                <strong>Process Section</strong> - &quot;How It Works&quot; workflow (no file
                uploads needed)
              </li>
              <li>
                <strong>Testimonials Section</strong> - Customer reviews (managed separately)
              </li>
              <li>
                <strong>FAQ Section</strong> - Frequently asked questions (static content)
              </li>
              <li>
                <strong>CTA Section</strong> - Call-to-action banners (static content)
              </li>
              <li>
                <strong>Contact Section</strong> - Contact form and methods (static content)
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/10">
        <p className="text-white/90 font-medium mb-2">📝 Content Workflow:</p>
        <ol className="list-decimal list-inside space-y-2 text-white/70 text-sm">
          <li>
            <strong>Create Design Entry:</strong> Fill in title, slug, scooter model, price, and
            description
          </li>
          <li>
            <strong>Upload Cover Image:</strong> This appears in design cards on the main page
          </li>
          <li>
            <strong>Upload 3D Model (GLB):</strong> Required for the interactive 3D viewer
          </li>
          <li>
            <strong>Upload Texture:</strong> Applied to the 3D model when design is selected
          </li>
          <li>
            <strong>Upload Gallery Images:</strong> These appear in the Gallery section below
          </li>
          <li>
            <strong>Set Status:</strong> Use the stage checklist to track production progress
            (CREATIVE → MODELING_3D → UV_TEMPLATE → PRINTING → FOR_SALE → SOLD → DELIVERY →
            FEEDBACK)
          </li>
          <li>
            <strong>Publish:</strong> Toggle &quot;Published&quot; to make the design visible on the
            public site
          </li>
        </ol>
      </div>

      <p className="mt-6 text-white/60 text-sm italic">
        All files will be uploaded to the configured S3 bucket. Ensure your file names are unique
        and descriptive.
      </p>
    </div>
  )
}
