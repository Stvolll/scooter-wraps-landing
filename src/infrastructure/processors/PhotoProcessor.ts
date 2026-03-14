import type { IMaterialProcessor, Material } from './IMaterialProcessor'
import { PhotoMaterial } from '@/domain'
import { generateMaterialId } from '../utils/idGenerator'
import { THUMBNAIL_DIMENSIONS } from '@/shared-core'
import fs from 'fs'
import path from 'path'

export class PhotoProcessor implements IMaterialProcessor {
  readonly type = 'photo' as const

  async process(file: File | Buffer, filePath?: string): Promise<Material> {
    // Ensure uploads/photos directory exists
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'photos')
    const thumbnailDir = path.join(uploadDir, 'thumbnails')
    
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }
    if (!fs.existsSync(thumbnailDir)) {
      fs.mkdirSync(thumbnailDir, { recursive: true })
    }

    let buffer: Buffer
    let filename: string

    // Handle different input types
    if (file instanceof File) {
      const arrayBuffer = await file.arrayBuffer()
      buffer = Buffer.from(arrayBuffer)
      filename = file.name || `photo-${Date.now()}.png`
    } else if (file instanceof Buffer) {
      buffer = file
      filename = `photo-${Date.now()}.png`
    } else {
      throw new Error('Invalid file type for PhotoProcessor')
    }

    // If filePath is provided and it's an absolute path to an existing file, copy it
    if (filePath && fs.existsSync(filePath) && path.isAbsolute(filePath)) {
      const sourceBuffer = fs.readFileSync(filePath)
      const sourceFilename = path.basename(filePath)
      const targetPath = path.join(uploadDir, sourceFilename)
      
      fs.writeFileSync(targetPath, sourceBuffer)
      filename = sourceFilename
      buffer = sourceBuffer
      
      console.log(`[PhotoProcessor] Copied photo from ${filePath} to ${targetPath}`)
    } else {
      const timestamp = Date.now()
      const ext = path.extname(filename) || '.png'
      const finalFilename = `${timestamp}-${filename.replace(/[^a-zA-Z0-9.-]/g, '-')}`
      const targetPath = path.join(uploadDir, finalFilename)
      
      fs.writeFileSync(targetPath, buffer)
      filename = finalFilename
      
      console.log(`[PhotoProcessor] Saved photo to ${targetPath}`)
    }

    // TODO: Generate thumbnail (300x200px)
    const thumbnailFilename = `thumb-${filename}`
    const thumbnailPath = path.join(thumbnailDir, thumbnailFilename)
    // For now, just copy the original as thumbnail
    fs.writeFileSync(thumbnailPath, buffer)

    const originalUrl = `/uploads/photos/${filename}`
    const thumbnailUrl = `/uploads/photos/thumbnails/${thumbnailFilename}`
    const id = generateMaterialId('photo')

    return new PhotoMaterial(id, {
      originalUrl,
      thumbnailUrl,
      width: 1920, // TODO: Get from actual image
      height: 1080, // TODO: Get from actual image
    })
  }
}

