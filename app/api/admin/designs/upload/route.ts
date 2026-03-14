// app/api/admin/designs/upload/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import { FileTypeDetector } from '@/lib/utils/FileTypeDetector'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']
const ALLOWED_MODEL_TYPES = ['model/gltf-binary', 'application/octet-stream']
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm']

/** Парсинг multipart через встроенный request.formData() — без busboy (нет ошибок createRequire). */
async function parseFormData(
  request: NextRequest
): Promise<{ files: File[]; type?: string; folder?: string }> {
  const contentType = request.headers.get('content-type') || ''
  if (!contentType.includes('multipart/form-data')) {
    throw new Error(`Content-Type must be multipart/form-data, got: ${contentType}`)
  }

  const formData = await request.formData()
  const files: File[] = []
  let type: string | undefined
  let folder: string | undefined

  for (const [key, value] of formData.entries()) {
    if (value instanceof File) {
      if (key === 'file' || key === 'files') {
        if (value.size > 0 && value.name) {
          files.push(value)
          console.log(`📄 File: ${value.name}, size: ${value.size}, type: ${value.type}`)
        }
      }
    } else if (typeof value === 'string') {
      if (key === 'type') type = value
      else if (key === 'folder') folder = value
    }
  }

  if (files.length === 0) {
    throw new Error('No files found in form data. Use field name "file" or "files".')
  }

  console.log(`✅ FormData parsed: ${files.length} file(s), type=${type}, folder=${folder}`)
  return { files, type, folder }
}

export async function POST(req: NextRequest) {
  try {
    console.log('📥 Admin upload request received')
    console.log('Content-Type:', req.headers.get('content-type'))
    console.log('Content-Length:', req.headers.get('content-length'))
    
    let files: File[]
    let type: string | undefined
    let folder: string | undefined

    try {
      const parsed = await parseFormData(req)
      files = parsed.files
      type = parsed.type
      folder = parsed.folder
    } catch (parseError: any) {
      console.error('❌ Error parsing form data:', parseError)
      return NextResponse.json(
        {
          error: parseError.message || 'Invalid file format or corrupted data. Please try again.',
          type: 'ParseError',
          details: parseError.message,
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

