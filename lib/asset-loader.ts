/**
 * Asset Loader Utility
 *
 * Provides functions to load optimized 3D assets with fallbacks
 * Supports CDN/S3 URLs and local development
 */

// CDN configuration (set via environment variables)
const CDN_BASE = process.env.NEXT_PUBLIC_CDN_BASE || ''
const USE_CDN = !!CDN_BASE

/**
 * Get optimized model URL with fallback
 */
export function getModelUrl(modelName: string, useDraco: boolean = true): string {
  const baseName = modelName.replace(/\.glb$/, '')
  const extension = useDraco ? '.draco.glb' : '.glb'

  if (USE_CDN) {
    return `${CDN_BASE}/optimized/models/${baseName}${extension}`
  }

  // Local development - use optimized if available, otherwise original
  return `/optimized/models/${baseName}${extension}`
}

/**
 * Get optimized texture URL with format fallback
 * Returns the best supported format (AVIF > WebP > original)
 */
export function getTextureUrl(
  texturePath: string,
  options: {
    format?: 'avif' | 'webp' | 'original'
    mobile?: boolean
  } = {}
): string {
  const { format = 'auto', mobile = false } = options

  const basePath = texturePath.replace(/\.(jpg|jpeg|png|JPG|JPEG|PNG)$/i, '')
  const baseName = basePath.split('/').pop() || ''
  const dir = basePath.substring(0, basePath.lastIndexOf('/'))

  let fileExtension = ''

  if (format === 'auto') {
    // Browser will choose best supported format via <picture> or fetch with Accept header
    fileExtension = '.avif' // Primary format
  } else if (format === 'avif') {
    fileExtension = '.avif'
  } else if (format === 'webp') {
    fileExtension = '.webp'
  } else {
    // Original format
    const originalExt = texturePath.match(/\.(jpg|jpeg|png|JPG|JPEG|PNG)$/i)?.[0] || '.png'
    fileExtension = originalExt
  }

  if (mobile) {
    fileExtension = '.mobile.webp'
  }

  const fileName = `${baseName}${fileExtension}`

  if (USE_CDN) {
    return `${CDN_BASE}/optimized/textures/${dir}/${fileName}`
  }

  return `/optimized/textures/${dir}/${fileName}`
}

/**
 * Get texture URLs with fallbacks for <picture> element
 */
export function getTextureSources(
  texturePath: string,
  options: {
    mobile?: boolean
    includeOriginal?: boolean
  } = {}
): Array<{ src: string; type: string }> {
  const { mobile = false, includeOriginal = true } = options

  if (mobile) {
    return [
      {
        src: getTextureUrl(texturePath, { format: 'webp', mobile: true }),
        type: 'image/webp',
      },
    ]
  }

  const sources: Array<{ src: string; type: string }> = [
    {
      src: getTextureUrl(texturePath, { format: 'avif' }),
      type: 'image/avif',
    },
    {
      src: getTextureUrl(texturePath, { format: 'webp' }),
      type: 'image/webp',
    },
  ]

  if (includeOriginal) {
    const originalExt = texturePath.match(/\.(jpg|jpeg|png|JPG|JPEG|PNG)$/i)?.[0] || '.png'
    const mimeType =
      originalExt.toLowerCase() === '.jpg' || originalExt.toLowerCase() === '.jpeg'
        ? 'image/jpeg'
        : 'image/png'

    sources.push({
      src: getTextureUrl(texturePath, { format: 'original' }),
      type: mimeType,
    })
  }

  return sources
}

/**
 * Check if browser supports AVIF
 */
export function supportsAVIF(): Promise<boolean> {
  if (typeof window === 'undefined') return Promise.resolve(false)

  return new Promise(resolve => {
    const avif = new Image()
    avif.onload = avif.onerror = () => {
      resolve(avif.height === 2)
    }
    avif.src =
      'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgABogQEAwgMg8f8D///8WfhwB8+ErK42A='
  })
}

/**
 * Get best texture format based on browser support
 */
export async function getBestTextureFormat(): Promise<'avif' | 'webp' | 'original'> {
  if (typeof window === 'undefined') return 'webp'

  const avifSupported = await supportsAVIF()
  if (avifSupported) return 'avif'

  // Check WebP support
  const webpSupported = await new Promise<boolean>(resolve => {
    const webp = new Image()
    webp.onload = webp.onerror = () => {
      resolve(webp.width === 2 && webp.height === 2)
    }
    webp.src =
      'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA'
  })

  if (webpSupported) return 'webp'
  return 'original'
}
