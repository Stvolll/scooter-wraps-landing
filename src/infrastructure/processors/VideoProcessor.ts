import type { IMaterialProcessor, Material } from './IMaterialProcessor'
import { VideoMaterial } from '@/domain'
import { generateMaterialId } from '../utils/idGenerator'
import { VIDEO_THUMBNAIL_TIME } from '@/shared-core'
import fs from 'fs'
import path from 'path'

export class VideoProcessor implements IMaterialProcessor {
  readonly type = 'video' as const

  async process(file: File | Buffer, filePath?: string): Promise<Material> {
    // Ensure uploads/videos directory exists
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'videos')
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
      filename = file.name || `video-${Date.now()}.mp4`
    } else if (file instanceof Buffer) {
      buffer = file
      filename = `video-${Date.now()}.mp4`
    } else {
      throw new Error('Invalid file type for VideoProcessor')
    }

    // If filePath is provided and it's an absolute path to an existing file, copy it
    if (filePath && fs.existsSync(filePath) && path.isAbsolute(filePath)) {
      const sourceBuffer = fs.readFileSync(filePath)
      const sourceFilename = path.basename(filePath)
      const targetPath = path.join(uploadDir, sourceFilename)
      
      fs.writeFileSync(targetPath, sourceBuffer)
      filename = sourceFilename
      buffer = sourceBuffer
      
      console.log(`[VideoProcessor] Copied video from ${filePath} to ${targetPath}`)
    } else {
      const timestamp = Date.now()
      const ext = path.extname(filename) || '.mp4'
      const finalFilename = `${timestamp}-${filename.replace(/[^a-zA-Z0-9.-]/g, '-')}`
      const targetPath = path.join(uploadDir, finalFilename)
      
      fs.writeFileSync(targetPath, buffer)
      filename = finalFilename
      
      console.log(`[VideoProcessor] Saved video to ${targetPath}`)
    }

    // TODO: Generate thumbnail from frame at VIDEO_THUMBNAIL_TIME
    // For now, use placeholder
    const thumbnailFilename = `thumb-${filename.replace(/\.[^.]+$/, '.png')}`
    const thumbnailPath = path.join(thumbnailDir, thumbnailFilename)
    // Placeholder - in production, extract frame from video
    fs.writeFileSync(thumbnailPath, Buffer.from(''))

    // Detect format from filename
    const ext = path.extname(filename).toLowerCase().slice(1)
    const format = ['mp4', 'webm'].includes(ext) ? ext as 'mp4' | 'webm' : 'mp4'

    const url = `/uploads/videos/${filename}`
    const thumbnailUrl = `/uploads/videos/thumbnails/${thumbnailFilename}`
    const id = generateMaterialId('video')

    return new VideoMaterial(id, {
      url,
      duration: 30, // TODO: Get from actual video
      thumbnailUrl,
      format,
    })
  }
}

