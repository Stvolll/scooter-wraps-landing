import type { IMaterialProcessor, Material } from './IMaterialProcessor'
import { BackgroundMaterial } from '@/domain'
import { generateMaterialId } from '../utils/idGenerator'

export class BackgroundProcessor implements IMaterialProcessor {
  readonly type = 'background' as const

  async process(file: File | Buffer, filePath?: string): Promise<Material> {
    // Dynamic import for Node.js modules (only available on server)
    const fs = typeof window === 'undefined' ? await import('fs') : null
    const path = typeof window === 'undefined' ? await import('path') : null
    
    if (!fs || !path) {
      throw new Error('BackgroundProcessor can only be used on the server side')
    }
    
    // Ensure uploads/backgrounds directory exists
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'backgrounds')
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }

    let buffer: Buffer
    let filename: string

    // Handle different input types
    if (file instanceof File) {
      const arrayBuffer = await file.arrayBuffer()
      buffer = Buffer.from(arrayBuffer)
      filename = file.name || `background-${Date.now()}.webp`
    } else if (file instanceof Buffer) {
      buffer = file
      filename = `background-${Date.now()}.webp`
    } else {
      throw new Error('Invalid file type for BackgroundProcessor')
    }

    // If filePath is provided and it's an absolute path to an existing file, copy it
    if (filePath && fs.existsSync(filePath) && path.isAbsolute(filePath)) {
      const sourceBuffer = fs.readFileSync(filePath)
      const sourceFilename = path.basename(filePath)
      const targetPath = path.join(uploadDir, sourceFilename)
      
      fs.writeFileSync(targetPath, sourceBuffer)
      filename = sourceFilename
      buffer = sourceBuffer
      
      console.log(`[BackgroundProcessor] Copied background from ${filePath} to ${targetPath}`)
    } else {
      const timestamp = Date.now()
      const ext = path.extname(filename) || '.webp'
      const finalFilename = `${timestamp}-${filename.replace(/[^a-zA-Z0-9.-]/g, '-')}`
      const targetPath = path.join(uploadDir, finalFilename)
      
      fs.writeFileSync(targetPath, buffer)
      filename = finalFilename
      
      console.log(`[BackgroundProcessor] Saved background to ${targetPath}`)
    }

    // Detect format from filename
    const ext = path.extname(filename).toLowerCase().slice(1)
    const format = ['jpg', 'jpeg', 'png', 'webp', 'hdr', 'exr'].includes(ext) 
      ? ext as 'jpg' | 'png' | 'webp' | 'hdr' | 'exr' 
      : 'webp'

    // Detect type based on extension
    const type = ['hdr', 'exr'].includes(ext) ? 'hdri' : 'image'

    const url = `/uploads/backgrounds/${filename}`
    const id = generateMaterialId('background')

    return new BackgroundMaterial(id, {
      type,
      url,
      format,
    })
  }
}

