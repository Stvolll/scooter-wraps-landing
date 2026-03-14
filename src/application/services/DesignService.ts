import type { IDesignRepository } from '@/domain'
import { Design, TextureMaterial, SupportMaterials, DesignVersion } from '@/domain'
import { DesignRepository } from '@/infrastructure'
import { generateDesignId } from '@/infrastructure/utils/idGenerator'
import { ProcessorRegistry, FileTypeDetector } from '@/infrastructure'
import { bootstrapApp } from '@/infrastructure'

export class DesignService {
  private repository: IDesignRepository
  private processorRegistry: ProcessorRegistry

  constructor(
    repository?: IDesignRepository,
    processorRegistry?: ProcessorRegistry
  ) {
    this.repository = repository || new DesignRepository()
    const bootstrapped = bootstrapApp()
    this.processorRegistry = processorRegistry || bootstrapped.processorRegistry
  }

  async getById(id: string): Promise<Design | null> {
    return this.repository.getById(id)
  }

  async getByModelId(modelId: string): Promise<Design[]> {
    return this.repository.getByModelId(modelId)
  }

  async getAll(): Promise<Design[]> {
    return this.repository.getAll()
  }

  async create(data: {
    modelId: string
    name: string
    mainTextureFile: File | Buffer | string
    photoFiles?: (File | Buffer | string)[]
    videoFiles?: (File | Buffer | string)[]
    backgroundFile?: File | Buffer | string
  }): Promise<Design> {
    // Helper to convert file path to Buffer (for Node.js) or keep as-is
    const getFileBuffer = async (
      file: File | Buffer | string
    ): Promise<File | Buffer> => {
      if (typeof file === 'string') {
        // In Node.js context, read file from path
        if (typeof window === 'undefined') {
          const fs = await import('fs/promises')
          const path = await import('path')
          
          // CRITICAL: Check if string is a URL FIRST (before checking isAbsolute)
          // URLs like /uploads/... start with / but are NOT file paths
          // They should NOT be read as files - they are web paths
          if (file.startsWith('/uploads/') || file.startsWith('/images/') || file.startsWith('/static/') || file.startsWith('/models/')) {
            // This is a URL, not a file path - don't try to read it
            // The processor will handle it or it should be fetched via HTTP
            throw new Error(`Cannot read file from URL: ${file}. Use absolute file path instead.`)
          }
          
          // Check if it's an absolute file path (like /Users/... or C:\...)
          if (path.isAbsolute(file)) {
            // This is an absolute file path - verify it exists and read it
            try {
              await fs.access(file)
              return await fs.readFile(file)
            } catch (error) {
              throw new Error(`File not found: ${file}`)
            }
          }
          
          // Relative path - resolve it
          const resolvedPath = path.resolve(process.cwd(), file)
          try {
            await fs.access(resolvedPath)
            return await fs.readFile(resolvedPath)
          } catch (error) {
            throw new Error(`File not found: ${resolvedPath}`)
          }
        }
        // In browser context, fetch file and convert to Buffer
        const response = await fetch(file)
        const arrayBuffer = await response.arrayBuffer()
        // Use Buffer if available, otherwise use Uint8Array
        if (typeof Buffer !== 'undefined') {
          return Buffer.from(arrayBuffer)
        }
        return new Uint8Array(arrayBuffer) as unknown as Buffer
      }
      return file
    }

    // Process main texture (REQUIRED)
    const textureProcessor = this.processorRegistry.get('texture')
    
    // Check if mainTextureFile is a URL (already uploaded)
    let mainTexture: TextureMaterial
    if (typeof data.mainTextureFile === 'string' && 
        (data.mainTextureFile.startsWith('/uploads/') || 
         data.mainTextureFile.startsWith('/images/') || 
         data.mainTextureFile.startsWith('/static/'))) {
      // This is a URL - create TextureMaterial directly without processing
      const { generateMaterialId } = await import('@/infrastructure/utils/idGenerator')
      const id = generateMaterialId('texture')
      const filename = data.mainTextureFile.split('/').pop() || 'texture.jpg'
      const ext = filename.split('.').pop()?.toLowerCase() || 'jpg'
      const format = ['jpg', 'jpeg', 'png', 'webp'].includes(ext) ? ext as 'jpg' | 'png' | 'webp' : 'jpg'
      
      mainTexture = new TextureMaterial(id, {
        url: data.mainTextureFile,
        width: 2048, // TODO: Get actual dimensions
        height: 2048,
        format,
      })
      console.log(`[DesignService] Created TextureMaterial from URL: ${data.mainTextureFile}`)
    } else {
      // This is a file path or File/Buffer - process it
      const mainTextureFile = await getFileBuffer(data.mainTextureFile)
      mainTexture = (await textureProcessor.process(
        mainTextureFile,
        typeof data.mainTextureFile === 'string' ? data.mainTextureFile : undefined
      )) as TextureMaterial
    }

    // Process optional photos
    const photos = []
    if (data.photoFiles) {
      const photoProcessor = this.processorRegistry.get('photo')
      const { generateMaterialId } = await import('@/infrastructure/utils/idGenerator')
      
      for (const file of data.photoFiles) {
        let photo
        if (typeof file === 'string' && 
            (file.startsWith('/uploads/') || 
             file.startsWith('/images/') || 
             file.startsWith('/static/'))) {
          // This is a URL - create PhotoMaterial directly
          const { PhotoMaterial } = await import('@/domain')
          const id = generateMaterialId('photo')
          photo = new PhotoMaterial(id, {
            originalUrl: file,
            thumbnailUrl: file.replace('/photos/', '/photos/thumbnails/'), // TODO: Generate actual thumbnail
            width: 1920, // TODO: Get actual dimensions
            height: 1080,
          })
          console.log(`[DesignService] Created PhotoMaterial from URL: ${file}`)
        } else {
          // This is a file path or File/Buffer - process it
          const photoFile = await getFileBuffer(file)
          photo = await photoProcessor.process(
            photoFile,
            typeof file === 'string' ? file : undefined
          )
        }
        photos.push(photo)
      }
    }

    // Process optional videos
    const videos = []
    if (data.videoFiles) {
      const videoProcessor = this.processorRegistry.get('video')
      const { generateMaterialId } = await import('@/infrastructure/utils/idGenerator')
      
      for (const file of data.videoFiles) {
        let video
        if (typeof file === 'string' && 
            (file.startsWith('/uploads/') || 
             file.startsWith('/images/') || 
             file.startsWith('/static/'))) {
          // This is a URL - create VideoMaterial directly
          const { VideoMaterial } = await import('@/domain')
          const id = generateMaterialId('video')
          video = new VideoMaterial(id, {
            url: file,
            duration: 30, // TODO: Get actual duration
            thumbnailUrl: file.replace('/videos/', '/videos/thumbnails/'), // TODO: Generate actual thumbnail
            format: 'mp4', // TODO: Detect from file
          })
          console.log(`[DesignService] Created VideoMaterial from URL: ${file}`)
        } else {
          // This is a file path or File/Buffer - process it
          const videoFile = await getFileBuffer(file)
          video = await videoProcessor.process(
            videoFile,
            typeof file === 'string' ? file : undefined
          )
        }
        videos.push(video)
      }
    }

    // Process optional background
    let background
    if (data.backgroundFile) {
      if (typeof data.backgroundFile === 'string' && 
          (data.backgroundFile.startsWith('/uploads/') || 
           data.backgroundFile.startsWith('/images/') || 
           data.backgroundFile.startsWith('/static/'))) {
        // This is a URL - create BackgroundMaterial directly
        const { BackgroundMaterial } = await import('@/domain')
        const { generateMaterialId } = await import('@/infrastructure/utils/idGenerator')
        const id = generateMaterialId('background')
        const filename = data.backgroundFile.split('/').pop() || 'background.webp'
        const ext = filename.split('.').pop()?.toLowerCase() || 'webp'
        const format = ['jpg', 'jpeg', 'png', 'webp', 'hdr', 'exr'].includes(ext) 
          ? ext as 'webp' | 'jpg' | 'png' | 'hdr' | 'exr' 
          : 'webp'
        
        background = new BackgroundMaterial(id, {
          type: 'image', // TODO: Detect HDRI vs image
          url: data.backgroundFile,
          format,
        })
        console.log(`[DesignService] Created BackgroundMaterial from URL: ${data.backgroundFile}`)
      } else {
        // This is a file path or File/Buffer - process it
        const backgroundProcessor = this.processorRegistry.get('background')
        const bgFile = await getFileBuffer(data.backgroundFile)
        background = await backgroundProcessor.process(
          bgFile,
          typeof data.backgroundFile === 'string' ? data.backgroundFile : undefined
        )
      }
    }

    const supportMaterials = new SupportMaterials(
      photos,
      videos,
      background
    )

    // Generate preview URL (from first photo or placeholder)
    const previewImageUrl =
      photos.length > 0
        ? photos[0].payload.thumbnailUrl
        : '/images/placeholder-preview.jpg'

    const design = new Design(
      generateDesignId(),
      data.modelId,
      data.name,
      mainTexture,
      supportMaterials,
      DesignVersion.initial(),
      'draft',
      previewImageUrl,
      new Date(),
      new Date()
    )

    return this.repository.create(design)
  }

  async update(design: Design): Promise<Design> {
    return this.repository.update(design)
  }

  async delete(id: string): Promise<void> {
    return this.repository.delete(id)
  }
}

