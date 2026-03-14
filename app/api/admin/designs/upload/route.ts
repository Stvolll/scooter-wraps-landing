// app/api/admin/designs/upload/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import { Readable } from 'stream'
import { FileTypeDetector } from '@/lib/utils/FileTypeDetector'
// ✅ FIX: Убрана серверная компрессия GLB - файлы загружаются как есть
// import { compressGLBWithDraco, shouldCompress } from '@/lib/utils/glb-compressor'

// Busboy loader for ESM context (Next.js 16 App Router)
async function getBusboy() {
  try {
    // Try dynamic import first (ESM way)
    const busboyModule = await import('next/dist/compiled/busboy/index.js')
    console.log(`✅ Busboy loaded via dynamic import`)
    return busboyModule.default || busboyModule
  } catch (importError: any) {
    console.warn('⚠️ Dynamic import failed, trying require:', importError.message)
    try {
      // Fallback to require (CommonJS way)
      const { createRequire } = await import('module')
      const require = createRequire(import.meta.url || __filename)
      const busboy = require('next/dist/compiled/busboy')
      console.log(`✅ Busboy loaded via require`)
      return busboy.default || busboy
    } catch (requireError: any) {
      console.error('❌ Both import methods failed:', {
        importError: importError.message,
        requireError: requireError.message
      })
      throw new Error(`Busboy module not available. Import failed: ${importError.message}. Require failed: ${requireError.message}`)
    }
  }
}

// Configure route to handle large file uploads
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60 // 60 seconds timeout

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']
const ALLOWED_MODEL_TYPES = ['model/gltf-binary', 'application/octet-stream']
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm']

// Helper function to parse multipart/form-data using busboy
async function parseMultipartFormData(request: NextRequest): Promise<{ files: File[]; type?: string; folder?: string }> {
  const contentType = request.headers.get('content-type')
  
  console.log('🔍 Parsing multipart form data, Content-Type:', contentType)
  
  if (!contentType) {
    throw new Error('Content-Type header is missing')
  }
  
  if (!contentType.includes('multipart/form-data')) {
    throw new Error(`Content-Type must be multipart/form-data, got: ${contentType}`)
  }
  
  if (!contentType.includes('boundary=')) {
    console.warn('⚠️ Content-Type missing boundary, but continuing...')
  }

  // Load busboy first
  let Busboy: any
  try {
    Busboy = await getBusboy()
  } catch (busboyError: any) {
    throw new Error(`Failed to load busboy: ${busboyError.message}`)
  }

  return new Promise((resolve, reject) => {
    const files: File[] = []
    let type: string | undefined = undefined
    let folder: string | undefined = undefined
    let hasError = false
    let timeout: NodeJS.Timeout | null = null
    
    const busboy = Busboy({ headers: { 'content-type': contentType } })

    busboy.on('file', (name: string, stream: NodeJS.ReadableStream, info: { filename: string; encoding?: string; mimeType?: string }) => {
      const { filename, encoding, mimeType } = info
      console.log(`📄 File field received: ${name}, filename: ${filename}, type: ${mimeType}`)
      
      if (name === 'file' || name === 'files') {
        const chunks: Buffer[] = []
        
        stream.on('data', (chunk: Buffer) => {
          chunks.push(chunk)
        })
        
        stream.on('end', () => {
          const buffer = Buffer.concat(chunks)
          console.log(`📦 File data received: ${buffer.length} bytes`)
          
          const blob = new Blob([buffer], { type: mimeType || 'application/octet-stream' })
          const file = new File([blob], filename, { type: mimeType || 'application/octet-stream' })
          files.push(file)
        })
        
        stream.on('error', (err) => {
          console.error('❌ Error reading file stream:', err)
          hasError = true
          reject(new Error(`File stream error: ${err.message}`))
        })
      }
    })

    busboy.on('field', (name: string, value: string) => {
      console.log(`📋 Field received: ${name} = ${value}`)
      if (name === 'type') {
        type = value
      } else if (name === 'folder') {
        folder = value
      }
    })

    busboy.on('finish', () => {
      if (timeout) clearTimeout(timeout)
      if (hasError) return
      
      if (files.length === 0) {
        reject(new Error('No files found in multipart data'))
        return
      }
      
      console.log(`✅ Multipart parsing complete:`, {
        filesCount: files.length,
        type,
        folder
      })
      
      resolve({ files, type, folder })
    })

    busboy.on('error', (err: Error) => {
      if (timeout) clearTimeout(timeout)
      console.error('❌ Busboy error:', err)
      if (!hasError) {
        hasError = true
        reject(new Error(`Multipart parsing error: ${err.message}`))
      }
    })

    if (!request.body) {
      reject(new Error('Request body is empty'))
      return
    }

    // FIX for Next.js 16: Read body directly without cloning
    // Cloning may cause issues with large files
    const reader = request.body.getReader()
    const nodeStream = new Readable({
      async read() {
        try {
          const { done, value } = await reader.read()
          if (done) {
            this.push(null)
          } else {
            this.push(Buffer.from(value))
          }
        } catch (err) {
          console.error('❌ Error reading from stream:', err)
          this.destroy(err as Error)
        }
      },
    })

    nodeStream.on('error', (err) => {
      if (timeout) clearTimeout(timeout)
      console.error('❌ Node stream error:', err)
      if (!hasError) {
        hasError = true
        reject(new Error(`Stream error: ${err.message}`))
      }
    })

    timeout = setTimeout(() => {
      if (files.length === 0 && !hasError) {
        hasError = true
        reject(new Error('Timeout: No files received within 30 seconds'))
      }
    }, 30000)

    nodeStream.pipe(busboy)
  })
}

export async function POST(req: NextRequest) {
  try {
    console.log('📥 Admin upload request received')
    console.log('Content-Type:', req.headers.get('content-type'))
    console.log('Content-Length:', req.headers.get('content-length'))
    
    // Parse multipart form data directly using busboy (streaming parser)
    // Busboy handles streaming, so we don't need to pre-load the body
    // This is the correct approach for Next.js 16 App Router
    let files: File[]
    let type: string | undefined
    let folder: string | undefined
    
    try {
      const parsed = await parseMultipartFormData(req)
      files = parsed.files
      type = parsed.type
      folder = parsed.folder
    } catch (parseError: any) {
      console.error('❌ Error parsing multipart form data:', parseError)
      console.error('❌ Error details:', {
        message: parseError.message,
        stack: parseError.stack,
        name: parseError.name,
        contentType: req.headers.get('content-type'),
        contentLength: req.headers.get('content-length')
      })
      return NextResponse.json(
        { 
          error: `Failed to parse upload data: ${parseError.message}`,
          type: 'ParseError',
          details: parseError.message,
          contentType: req.headers.get('content-type'),
          contentLength: req.headers.get('content-length')
        },
        { status: 400 }
      )
    }
    
    const uploadedFiles: Array<{
      originalName: string
      fileName: string
      url: string
      size: number
      type: string
    }> = []

    // Process each file
    for (const file of files) {
      console.log(`📦 Processing file: ${file.name}, size: ${file.size} bytes, type: ${file.type}`)

      // Determine file type using FileTypeDetector
      const detectedType = FileTypeDetector.detect(file.name)
      console.log(`🔍 Detected file type: ${detectedType} for file: ${file.name}`)

      // Validate content type
      let contentType = file.type || 'application/octet-stream'
      const filename = file.name
      
      // Для GLB файлов принудительно устанавливаем правильный content type
      if (filename.toLowerCase().endsWith('.glb') || filename.toLowerCase().endsWith('.gltf')) {
        if (!contentType || contentType === 'application/octet-stream') {
          contentType = 'model/gltf-binary'
          console.log(`🔧 [Upload] Setting content type for GLB file: ${contentType}`)
        }
      }
      
      const isImageByExt = filename.match(/\.(jpg|jpeg|png|webp|avif)$/i)
      const isModelByExt = filename.match(/\.(glb|gltf)$/i)
      const isVideoByExt = filename.match(/\.(mp4|webm)$/i)
      
      const isImageByType = ALLOWED_IMAGE_TYPES.includes(contentType)
      const isModelByType = ALLOWED_MODEL_TYPES.includes(contentType) || contentType === 'model/gltf-binary'
      const isVideoByType = ALLOWED_VIDEO_TYPES.includes(contentType)
      
      const isImage = isImageByExt || isImageByType
      const isModel = isModelByExt || isModelByType
      const isVideo = isVideoByExt || isVideoByType
      
      const finalFolder = folder || FileTypeDetector.getFolderForType(detectedType)
      
      // Для GLB/GLTF файлов всегда разрешаем загрузку, даже если тип не определен
      const isGLBFile = filename.toLowerCase().endsWith('.glb') || filename.toLowerCase().endsWith('.gltf')
      
      const isValidFile = isImage || isModel || isVideo || 
                         detectedType === 'texture' || 
                         detectedType === 'photo' || 
                         detectedType === 'background' ||
                         detectedType === 'model' ||
                         isGLBFile // GLB файлы всегда валидны

      if (!isValidFile) {
        console.error('❌ Invalid file type:', {
          filename,
          contentType,
          detectedType,
          isImage,
          isModel,
          isVideo,
          isImageByExt,
          isModelByExt,
          isVideoByExt,
          isImageByType,
          isModelByType,
          isVideoByType,
          isGLBFile
        })
        
        // ✅ FIX: Возвращаем детальную ошибку вместо continue
        return NextResponse.json(
          {
            error: `Invalid file type for ${filename}`,
            type: 'InvalidFileType',
            filename,
            contentType,
            detectedType,
            details: {
              isImage,
              isModel,
              isVideo,
              isImageByExt,
              isModelByExt,
              isVideoByExt,
              isImageByType,
              isModelByType,
              isVideoByType,
              isGLBFile,
              allowedImageTypes: ALLOWED_IMAGE_TYPES,
              allowedModelTypes: ALLOWED_MODEL_TYPES,
              allowedVideoTypes: ALLOWED_VIDEO_TYPES,
            }
          },
          { status: 400 }
        )
      }
      
      // Для GLB файлов принудительно устанавливаем правильный тип
      if (isGLBFile && !isModel) {
        console.log('🔧 [Upload] GLB file detected, forcing model type')
        // Файл уже добавлен в массив, просто продолжаем
      }

      // Generate unique filename
      const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_')
      const timestamp = Date.now()
      const uniqueFilename = `${timestamp}-${sanitizedFilename}`

      // Determine upload directory
      let uploadDir = 'public/uploads'
      if (finalFolder) {
        uploadDir = join(uploadDir, finalFolder)
      } else if (isModel) {
        uploadDir = join(uploadDir, 'models')
      } else if (isVideo) {
        uploadDir = join(uploadDir, 'videos')
      } else {
        uploadDir = join(uploadDir, 'images')
      }

      // Ensure directory exists
      const fullUploadDir = join(process.cwd(), uploadDir)
      if (!existsSync(fullUploadDir)) {
        await mkdir(fullUploadDir, { recursive: true })
        console.log(`📁 Created directory: ${fullUploadDir}`)
      }

      // Write file to disk
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const filepath = join(fullUploadDir, uniqueFilename)
      await writeFile(filepath, buffer)

      // ✅ FIX: Убрана серверная компрессия - файлы загружаются как есть
      // Компрессия должна выполняться заранее через внешние инструменты (gltfpack, gltf-pipeline)
      const finalUrl = `/${uploadDir.replace('public/', '')}/${uniqueFilename}`
      const finalSize = file.size
      const finalFilename = uniqueFilename

      uploadedFiles.push({
        originalName: file.name,
        fileName: finalFilename,
        url: finalUrl,
        size: finalSize,
        type: contentType,
      })

      console.log(`✅ File uploaded successfully: ${finalUrl}`)
    }

    if (uploadedFiles.length === 0) {
      console.error('❌ No files were successfully uploaded')
      console.error('Files processed:', files.length)
      console.error('Uploaded files:', uploadedFiles.length)
      
      return NextResponse.json(
        { 
          error: 'No valid files were uploaded',
          type: 'NoValidFiles',
          details: {
            filesReceived: files.length,
            filesUploaded: uploadedFiles.length,
            files: files.map(f => ({
              name: f.name,
              size: f.size,
              type: f.type,
              detectedType: FileTypeDetector.detect(f.name)
            }))
          }
        },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      files: uploadedFiles,
      message: `Uploaded ${uploadedFiles.length} file(s) successfully`
    })
  } catch (error: any) {
    console.error('❌ Upload error:', error)
    console.error('Error stack:', error.stack)

    return NextResponse.json(
      {
        error: error.message || 'Failed to upload files',
        type: error.name || 'Unknown error',
      },
      { status: 500 }
    )
  }
}

