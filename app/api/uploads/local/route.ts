// app/api/uploads/local/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import { Readable } from 'stream'
import busboy from 'busboy'
import { FileTypeDetector } from '@/lib/utils/FileTypeDetector'

// Configure route to handle large file uploads
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60 // 60 seconds timeout

// Removed file size limit - no restrictions for admin panel
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']
const ALLOWED_MODEL_TYPES = ['model/gltf-binary', 'application/octet-stream']
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm']

// Helper function to parse multipart/form-data using busboy (reliable for binary files)
async function parseMultipartFormData(request: NextRequest): Promise<{ file: File; folder?: string; customFilename?: string }> {
  const contentType = request.headers.get('content-type')
  
  console.log('🔍 Parsing multipart form data, Content-Type:', contentType)
  
  if (!contentType) {
    throw new Error('Content-Type header is missing')
  }
  
  if (!contentType.includes('multipart/form-data')) {
    throw new Error(`Content-Type must be multipart/form-data, got: ${contentType}`)
  }
  
  // Check for boundary - XMLHttpRequest should set it automatically, but let's verify
  if (!contentType.includes('boundary=')) {
    console.warn('⚠️ Content-Type missing boundary, but continuing...')
  }

  return new Promise((resolve, reject) => {
    let file: File | null = null
    let folder: string | undefined = undefined
    let customFilename: string | undefined = undefined
    let hasError = false
    let timeout: NodeJS.Timeout | null = null

    const parser = busboy({ headers: { 'content-type': contentType } })

    parser.on('file', (name: string, stream: Readable, info: busboy.FileInfo) => {
      const { filename, encoding, mimeType } = info
      console.log(`📄 File field received: ${name}, filename: ${filename}, type: ${mimeType}`)
      
      if (name === 'file') {
        const chunks: Buffer[] = []
        
        stream.on('data', (chunk: Buffer) => {
          chunks.push(chunk)
        })
        
        stream.on('end', () => {
          const buffer = Buffer.concat(chunks)
          console.log(`📦 File data received: ${buffer.length} bytes`)
          
          // Verify GLB file signature (first 4 bytes should be "glTF")
          if (filename.endsWith('.glb') && buffer.length >= 4) {
            const signature = buffer.toString('ascii', 0, 4)
            if (signature !== 'glTF') {
              console.warn(`⚠️ GLB file signature mismatch: expected "glTF", got "${signature}"`)
              console.warn(`   First 4 bytes: ${Array.from(buffer.slice(0, 4)).map(b => `0x${b.toString(16).padStart(2, '0')}`).join(' ')}`)
            } else {
              console.log(`✅ GLB file signature verified`)
            }
          }
          
          // Create File object from buffer (preserve exact bytes)
          const blob = new Blob([buffer], { type: mimeType || 'application/octet-stream' })
          file = new File([blob], filename, { type: mimeType || 'application/octet-stream' })
        })
        
        stream.on('error', (err) => {
          console.error('❌ Error reading file stream:', err)
          hasError = true
          reject(new Error(`File stream error: ${err.message}`))
        })
      }
    })

    parser.on('field', (name: string, value: string) => {
      console.log(`📋 Field received: ${name} = ${value}`)
      if (name === 'folder') {
        folder = value
      } else if (name === 'customFilename') {
        customFilename = value
      }
    })

    parser.on('finish', () => {
      if (timeout) clearTimeout(timeout)
      if (hasError) return
      
      if (!file) {
        reject(new Error('No file found in multipart data'))
        return
      }
      
      console.log(`✅ Multipart parsing complete:`, {
        filename: file.name,
        size: file.size,
        type: file.type,
        folder,
        customFilename
      })
      
      resolve({ file, folder, customFilename })
    })

    parser.on('error', (err: Error) => {
      console.error('❌ Busboy error:', err)
      hasError = true
      reject(new Error(`Multipart parsing error: ${err.message}`))
    })

    // Convert NextRequest body to Node.js stream for busboy
    // NextRequest.body is a ReadableStream, need to convert to Node.js stream
    if (!request.body) {
      reject(new Error('Request body is empty'))
      return
    }

    // Convert ReadableStream to Node.js Readable stream
    const reader = request.body.getReader()
    const nodeStream = new Readable({
      async read() {
        try {
          const { done, value } = await reader.read()
          if (done) {
            this.push(null) // End of stream
          } else {
            this.push(Buffer.from(value))
          }
        } catch (err) {
          console.error('❌ Error reading from stream:', err)
          this.destroy(err as Error)
        }
      }
    })

    nodeStream.on('error', (err) => {
      console.error('❌ Node stream error:', err)
      if (!hasError) {
        hasError = true
        reject(new Error(`Stream error: ${err.message}`))
      }
    })

    parser.on('error', (err: Error) => {
      console.error('❌ Busboy error:', err)
      if (timeout) clearTimeout(timeout)
      if (!hasError) {
        hasError = true
        reject(new Error(`Busboy error: ${err.message}`))
      }
    })

    // Add timeout to prevent hanging
    timeout = setTimeout(() => {
      if (!file && !hasError) {
        hasError = true
        reject(new Error('Timeout: No file received within 30 seconds'))
      }
    }, 30000)

    nodeStream.pipe(parser)
  })
}

export async function POST(req: NextRequest) {
  try {
    console.log('📥 Local upload request received')
    console.log('Content-Type:', req.headers.get('content-type'))
    
    // Parse multipart form data using busboy (reliable for binary files)
    let file: File
    let folder: string | undefined
    let customFilename: string | undefined
    
    try {
      const parsed = await parseMultipartFormData(req)
      file = parsed.file
      folder = parsed.folder
      customFilename = parsed.customFilename
    } catch (parseError: any) {
      console.error('❌ Error parsing multipart form data:', parseError)
      console.error('❌ Parse error stack:', parseError.stack)
      console.error('❌ Request headers:', {
        'content-type': req.headers.get('content-type'),
        'content-length': req.headers.get('content-length')
      })
      return NextResponse.json(
        { 
          error: `Failed to parse upload data: ${parseError.message}`,
          type: 'ParseError',
          details: parseError.stack
        },
        { status: 400 }
      )
    }
    
    console.log(`📦 File received: ${file.name}, size: ${file.size} bytes, type: ${file.type}`)

    // Определяем тип файла по имени (согласно MODEL_DESIGN_SYSTEM_AUTONOMOUS.md)
    const detectedType = FileTypeDetector.detect(file.name)
    console.log(`🔍 Detected file type: ${detectedType} for file: ${file.name}`)

    // Validate content type
    const contentType = file.type || 'application/octet-stream'
    const filename = file.name
    
    // Проверка по расширению файла (приоритет над contentType)
    const isImageByExt = filename.match(/\.(jpg|jpeg|png|webp|avif)$/i)
    const isModelByExt = filename.match(/\.(glb|gltf)$/i)
    const isVideoByExt = filename.match(/\.(mp4|webm)$/i)
    
    // Проверка по contentType
    const isImageByType = ALLOWED_IMAGE_TYPES.includes(contentType)
    const isModelByType = ALLOWED_MODEL_TYPES.includes(contentType)
    const isVideoByType = ALLOWED_VIDEO_TYPES.includes(contentType)
    
    // Финальная проверка: расширение ИЛИ contentType
    const isImage = isImageByExt || isImageByType
    const isModel = isModelByExt || isModelByType
    const isVideo = isVideoByExt || isVideoByType
    
    // Используем folder из FileTypeDetector, если не указан явно
    const finalFolder = folder || FileTypeDetector.getFolderForType(detectedType)
    
    console.log(`🔍 File validation:`, {
      filename,
      contentType,
      detectedType,
      isImage,
      isModel,
      isVideo,
      isImageByExt: !!isImageByExt,
      isModelByExt: !!isModelByExt,
      isVideoByExt: !!isVideoByExt,
      folder: finalFolder
    })
    
    // Check if it's a panorama file (by folder, filename, or detected type)
    const isPanorama = detectedType === 'background' ||
                       finalFolder === 'panoramas' || 
                       finalFolder === 'images' || 
                       (isImage && (filename.toLowerCase().includes('panoram') || 
                                   filename.toLowerCase().includes('bg') || 
                                   filename.toLowerCase().includes('background')))

    // Валидация: файл должен быть изображением, моделью или видео
    // Также учитываем detectedType для более гибкой валидации
    const isValidFile = isImage || isModel || isVideo || 
                       detectedType === 'texture' || 
                       detectedType === 'photo' || 
                       detectedType === 'background'

    if (!isValidFile) {
      console.error('❌ Invalid file type:', {
        filename,
        contentType,
        detectedType,
        isImage,
        isModel,
        isVideo
      })
      return NextResponse.json(
        { 
          error: `Invalid file type: ${contentType || 'unknown'}. Only images, videos and 3D models are allowed.`,
          type: 'InvalidFileType',
          filename,
          contentType,
          detectedType,
          isImage,
          isModel,
          isVideo
        },
        { status: 400 }
      )
    }

    // Generate unique filename
    // If customFilename is provided, use it (for models with MODEL-*.glb structure)
    // For panoramas, preserve original name without timestamp
    // Otherwise, use standard logic with timestamp
    let uniqueFilename: string
    
    if (customFilename) {
      // Use custom filename as-is (already sanitized by caller)
      uniqueFilename = customFilename.replace(/[^a-zA-Z0-9.-]/g, '_')
      console.log(`📝 Using custom filename: ${uniqueFilename}`)
    } else {
      const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_')
      
      // Check if it's a panorama file (already determined above)
      const isPanoramaFile = isPanorama || 
                             sanitizedFilename.toLowerCase().includes('panoram') || 
                             sanitizedFilename.toLowerCase().includes('bg') ||
                             sanitizedFilename.toLowerCase().includes('background')
      
      if (isModel && sanitizedFilename.toUpperCase().includes('MODEL')) {
        // For model files, keep original structure: MODEL-Name.glb
        // Only add timestamp if filename doesn't start with MODEL
        if (sanitizedFilename.toUpperCase().startsWith('MODEL')) {
          uniqueFilename = sanitizedFilename
        } else {
          const timestamp = Date.now()
          uniqueFilename = `${timestamp}-${sanitizedFilename}`
        }
      } else if (isPanoramaFile) {
        // For panorama files, keep original name without timestamp
        uniqueFilename = sanitizedFilename
        console.log(`📝 Panorama file detected, keeping original name: ${uniqueFilename}`)
      } else {
        // For other files, add timestamp prefix
        const timestamp = Date.now()
        uniqueFilename = `${timestamp}-${sanitizedFilename}`
      }
    }

    // Determine upload directory based on file type and folder parameter
    // Используем FileTypeDetector для определения правильной папки
    let uploadDir = 'public/uploads'
    
    if (finalFolder) {
      uploadDir = join(uploadDir, finalFolder)
    } else if (detectedType === 'model' || isModel) {
      uploadDir = join(uploadDir, 'models')
    } else if (detectedType === 'video' || isVideo) {
      uploadDir = join(uploadDir, 'videos')
    } else if (detectedType === 'texture' || detectedType === 'photo' || detectedType === 'background' || isImage) {
      uploadDir = join(uploadDir, 'images')
    }

    // Ensure directory exists
    const fullUploadDir = join(process.cwd(), uploadDir)
    try {
      if (!existsSync(fullUploadDir)) {
        await mkdir(fullUploadDir, { recursive: true })
        console.log(`📁 Created directory: ${fullUploadDir}`)
      }
    } catch (mkdirError: any) {
      console.error('❌ Error creating directory:', mkdirError)
      return NextResponse.json(
        { 
          error: `Failed to create upload directory: ${mkdirError.message}`,
          type: 'DirectoryError'
        },
        { status: 500 }
      )
    }

    // Write file to disk
    try {
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const filepath = join(fullUploadDir, uniqueFilename)
      await writeFile(filepath, buffer)
      console.log(`💾 File written to: ${filepath}`)
    } catch (writeError: any) {
      console.error('❌ Error writing file:', writeError)
      return NextResponse.json(
        { 
          error: `Failed to write file: ${writeError.message}`,
          type: 'WriteError'
        },
        { status: 500 }
      )
    }

    // Return public URL (remove 'public/' prefix)
    const publicUrl = `/${uploadDir.replace('public/', '')}/${uniqueFilename}`

    console.log(`✅ File uploaded successfully: ${publicUrl}`)
    
    return NextResponse.json({ 
      url: publicUrl, 
      key: uniqueFilename,
      message: 'File uploaded successfully (local storage)' 
    })
  } catch (error: any) {
    console.error('❌ Upload error:', error)
    console.error('Error stack:', error.stack)
    
    return NextResponse.json(
      { 
        error: error.message || 'Failed to upload file',
        type: error.name || 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Добавь обработку OPTIONS для CORS
export async function OPTIONS() {
  return NextResponse.json({}, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  })
}
