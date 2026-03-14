import type { IMaterialProcessor, Material } from './IMaterialProcessor'
import { TextureMaterial } from '@/domain'
import { generateMaterialId } from '../utils/idGenerator'
import fs from 'fs'
import path from 'path'

export class TextureProcessor implements IMaterialProcessor {
  readonly type = 'texture' as const

  async process(file: File | Buffer, filePath?: string): Promise<Material> {
    // Ensure uploads/textures directory exists
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'textures')
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }

    let buffer: Buffer
    let filename: string

    // Handle different input types
    if (file instanceof File) {
      // Browser File object
      const arrayBuffer = await file.arrayBuffer()
      buffer = Buffer.from(arrayBuffer)
      filename = file.name || `texture-${Date.now()}.jpg`
    } else if (file instanceof Buffer) {
      // Already a Buffer
      buffer = file
      filename = `texture-${Date.now()}.jpg`
    } else {
      throw new Error('Invalid file type for TextureProcessor')
    }

    // If filePath is provided and it's an absolute path to an existing file, copy it
    if (filePath && fs.existsSync(filePath) && path.isAbsolute(filePath)) {
      // Copy file from source location
      const sourceBuffer = fs.readFileSync(filePath)
      const sourceFilename = path.basename(filePath)
      const targetPath = path.join(uploadDir, sourceFilename)
      
      fs.writeFileSync(targetPath, sourceBuffer)
      filename = sourceFilename
      buffer = sourceBuffer
      
      console.log(`[TextureProcessor] Copied texture from ${filePath} to ${targetPath}`)
    } else {
      // Save buffer to uploads directory
      const timestamp = Date.now()
      const ext = path.extname(filename) || '.jpg'
      const finalFilename = `${timestamp}-${filename.replace(/[^a-zA-Z0-9.-]/g, '-')}`
      const targetPath = path.join(uploadDir, finalFilename)
      
      fs.writeFileSync(targetPath, buffer)
      filename = finalFilename
      
      console.log(`[TextureProcessor] Saved texture to ${targetPath}`)
    }

    // Detect format from filename
    const ext = path.extname(filename).toLowerCase().slice(1)
    const format = ['jpg', 'jpeg', 'png', 'webp'].includes(ext) ? ext as 'jpg' | 'png' | 'webp' : 'jpg'

    // TODO: Get actual dimensions from image
    // For now, use default dimensions
    const width = 2048
    const height = 2048

    const url = `/uploads/textures/${filename}`
    const id = generateMaterialId('texture')

    return new TextureMaterial(id, {
      url,
      width,
      height,
      format,
    })
  }
}

