'use client'

import React, { useState } from 'react'
// ✅ FIX: Убрана клиентская компрессия GLB - используем только серверную
// import { compressGLBInBrowser, shouldCompressInBrowser } from '@/lib/utils/client-glb-compressor'

interface FileUploadProps {
  onUploadComplete: (url: string, key?: string) => void
  accept?: string
  label?: string
  fileType?: 'image' | 'video' | 'model' | 'panorama'
  folder?: string
  customFilename?: string
  endpoint?: string // Позволяет переопределить endpoint
}

// Helper function to format file size
const formatBytes = (bytes: number, decimals = 2): string => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

// Maximum size for local upload (GLB models can be large; server limit set to 100MB in next.config)
const MAX_LOCAL_SIZE = 100 * 1024 * 1024 // 100MB for GLB and other admin uploads

export default function FileUpload({
  onUploadComplete,
  accept = 'image/*',
  label = 'Upload File',
  fileType,
  folder,
  customFilename,
  endpoint, // Может быть переопределен, по умолчанию определяется автоматически
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [uploadedUrl, setUploadedUrl] = useState<string>('')
  const [uploadError, setUploadError] = useState<string>('')

  const handleUploadComplete = (url: string, key?: string) => {
    setUploadedUrl(url)
    onUploadComplete(url, key)
  }

  // Определяем endpoint автоматически
  // По умолчанию используем админский endpoint для всех типов файлов
  const getEndpoint = () => {
    if (endpoint) return endpoint // Если явно указан, используем его
    return '/api/admin/designs/upload' // По умолчанию - админский endpoint
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setProgress(0)
    setUploadedUrl('') // Clear previous upload
    setUploadError('') // Clear previous error

    // Логирование для дебага
    console.log('🔍 [FileUpload] Начало загрузки файла:', {
      name: file.name,
      size: file.size,
      sizeFormatted: formatBytes(file.size),
      type: file.type,
      uploadType: fileType
    })

    try {
      // ✅ ШАГ 1: Проверка размера файла и клиентское сжатие
      // ✅ FIX: Убрана клиентская компрессия - используем только серверную
      // Сервер автоматически сожмет GLB файлы при необходимости
      const fileToUpload = file
      const fileSize = file.size

      const finalFileSize = fileToUpload.size
      const stillExceedsLimit = finalFileSize > MAX_LOCAL_SIZE

      if (stillExceedsLimit) {
        console.log(`⚠️ [FileUpload] Файл ${fileToUpload.name} (${formatBytes(finalFileSize)}) превышает лимит ${formatBytes(MAX_LOCAL_SIZE)}`)
      }

      // Determine content type (fix for .glb files)
      let contentType = fileToUpload.type
      if (!contentType || contentType === '') {
        // Fallback based on file extension
        if (fileToUpload.name.endsWith('.glb') || fileToUpload.name.endsWith('.draco.glb')) {
          contentType = 'model/gltf-binary'
        } else if (fileToUpload.name.endsWith('.gltf')) {
          contentType = 'model/gltf+json'
        } else if (fileToUpload.name.endsWith('.webp')) {
          contentType = 'image/webp'
        } else if (fileToUpload.name.endsWith('.mp4')) {
          contentType = 'video/mp4'
        } else if (fileToUpload.name.endsWith('.png')) {
          contentType = 'image/png'
        } else if (fileToUpload.name.endsWith('.jpg') || fileToUpload.name.endsWith('.jpeg')) {
          contentType = 'image/jpeg'
        } else {
          contentType = 'application/octet-stream'
        }
      }

      // ✅ ШАГ 2: Автоматический выбор метода загрузки (S3 приоритет для больших файлов)
      let s3Failed = false
      let s3Error = ''

      try {
        // Step 1: Get signed URL
        if (stillExceedsLimit) {
          console.log('☁️ [FileUpload] Файл >100MB, приоритет S3 загрузке...')
        } else {
          console.log('📤 [FileUpload] Запрашиваем signed URL (S3 приоритет)...')
        }
        const signedUrlRes = await fetch('/api/uploads/signed-url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filename: fileToUpload.name,
            contentType: contentType,
            fileSize: fileToUpload.size,
          }),
        })

        if (!signedUrlRes.ok) {
          const errorData = await signedUrlRes.json().catch(() => ({}))
          s3Error = errorData.error || errorData.details || 'Failed to get signed URL'
          
          // Если S3 не настроен, сразу переключаемся на local upload
          if (errorData.error?.includes('not configured') || 
              errorData.error?.includes('credentials') ||
              errorData.configured === false) {
            console.log('⚠️ [FileUpload] S3 not configured, using local upload fallback')
            throw new Error('S3_NOT_CONFIGURED')
          }
          
          throw new Error(s3Error)
        }

        const signedUrlData = await signedUrlRes.json()
        const { url: signedUrl, key, publicUrl: serverPublicUrl } = signedUrlData
        console.log('✅ [FileUpload] Signed URL получен:', signedUrlData)
        setProgress(30)
        
        // Store publicUrl for use after upload (construct if not provided by server)
        let finalPublicUrl = serverPublicUrl
        if (!finalPublicUrl) {
          // Fallback: construct URL manually
          const bucket = process.env.NEXT_PUBLIC_S3_BUCKET || ''
          const region = process.env.NEXT_PUBLIC_S3_REGION || 'us-east-1'
          const cloudFrontDomain = process.env.NEXT_PUBLIC_IMAGE_CDN_DOMAIN
          
          if (cloudFrontDomain) {
            finalPublicUrl = `https://${cloudFrontDomain}/${key}`
          } else if (bucket) {
            finalPublicUrl = `https://${bucket}.s3.${region}.amazonaws.com/${key}`
          } else {
            finalPublicUrl = key // Use key as fallback
          }
        }

        // Step 2: Upload directly to S3 with progress tracking
        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest()
          
          xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable) {
              const percentComplete = 30 + (e.loaded / e.total) * 60 // 30-90%
              setProgress(Math.round(percentComplete))
            }
          })
          
          xhr.addEventListener('load', () => {
            if (xhr.status === 200 || xhr.status === 204) {
              setProgress(100)
              // Use publicUrl from signed URL response (already constructed by server)
              handleUploadComplete(finalPublicUrl, key)
              console.log('✅ [FileUpload] S3 upload completed:', finalPublicUrl)
              resolve()
            } else {
              reject(new Error(`Failed to upload file to S3: ${xhr.status} ${xhr.statusText}`))
            }
          })
          
          xhr.addEventListener('error', () => reject(new Error('Network error during upload')))
          
          xhr.open('PUT', signedUrl)
          xhr.setRequestHeader('Content-Type', contentType)
          xhr.send(fileToUpload)
        })
        
        return // Success - exit
      } catch (s3Err: any) {
        // Если S3 не настроен, это нормально - используем local upload
        if (s3Err.message === 'S3_NOT_CONFIGURED') {
          console.log('ℹ️ [FileUpload] S3 not configured, using local upload (expected)')
        } else {
          console.log('⚠️ [FileUpload] S3 upload failed, trying local upload...', s3Err.message)
        }
        s3Failed = true
        s3Error = s3Err.message
      }

      // ✅ ШАГ 3: Fallback to local upload if S3 fails
      if (s3Failed) {
        if (stillExceedsLimit) {
          const isGLB = fileToUpload.name.toLowerCase().endsWith('.glb') || fileToUpload.name.toLowerCase().endsWith('.draco.glb')
          if (!isGLB) {
            throw new Error(
              `Файл слишком большой (${formatBytes(finalFileSize)}). Лимит: ${formatBytes(MAX_LOCAL_SIZE)}. Настройте S3 для файлов >100MB.`
            )
          }
          console.log(`⚠️ [FileUpload] GLB >100MB, пробуем локальную загрузку...`)
        }
        console.log('🔄 [FileUpload] Переключаемся на локальную загрузку...')
            console.log('📦 [FileUpload] File info для локальной загрузки:', {
              name: fileToUpload.name,
              size: fileToUpload.size,
              sizeFormatted: formatBytes(fileToUpload.size),
              type: fileToUpload.type,
              lastModified: fileToUpload.lastModified,
              wasCompressed: fileToUpload !== file
            })
        setProgress(30)

            const formData = new FormData()
            formData.append('file', fileToUpload)
            
            // Добавляем тип файла для правильной валидации на сервере
            if (fileType) {
              formData.append('type', fileType)
            }
        
        // Determine folder based on fileType if not provided
        let uploadFolder = folder
        if (!uploadFolder) {
          if (fileType === 'model') {
            uploadFolder = 'models'
          } else if (fileType === 'video') {
            uploadFolder = 'videos'
          } else if (fileType === 'panorama' || fileType === 'image') {
            uploadFolder = 'images'
          }
        }
        
        if (uploadFolder) {
          formData.append('folder', uploadFolder)
        }
        if (customFilename) {
          formData.append('customFilename', customFilename)
        }
        
        console.log('📤 Sending FormData with file:', fileToUpload.name)
        if (customFilename) {
          console.log('📝 Using custom filename:', customFilename)
        }
        setProgress(40)
        
        // Use XMLHttpRequest for progress tracking
        const xhr = new XMLHttpRequest()
        
        const localUploadRes = await new Promise<Response>((resolve, reject) => {
          xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable) {
              const percentComplete = 40 + (e.loaded / e.total) * 50 // 40-90%
              setProgress(Math.round(percentComplete))
            }
          })
          
          xhr.addEventListener('load', () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              // Create a Response-like object
              const response = new Response(xhr.responseText, {
                status: xhr.status,
                statusText: xhr.statusText,
                headers: new Headers(),
              })
              resolve(response)
            } else {
              // ✅ FIX: Получаем детали ошибки из response с полной информацией
              let errorMessage = `Upload failed: ${xhr.statusText} (${xhr.status})`
              try {
                const errorText = xhr.responseText
                if (errorText) {
                  try {
                    const errorData = JSON.parse(errorText)
                    errorMessage = errorData.error || errorData.message || errorMessage
                    
                    // Добавляем детали ошибки
                    if (errorData.details) {
                      if (typeof errorData.details === 'string') {
                        errorMessage += `\nDetails: ${errorData.details}`
                      } else if (typeof errorData.details === 'object') {
                        // Если details - объект, добавляем ключевую информацию
                        if (errorData.details.filesReceived !== undefined) {
                          errorMessage += `\nFiles received: ${errorData.details.filesReceived}, uploaded: ${errorData.details.filesUploaded}`
                        }
                      }
                    }
                    
                    // Добавляем информацию о файле если есть
                    if (errorData.filename) {
                      errorMessage += `\nFilename: ${errorData.filename}`
                    }
                    if (errorData.contentType) {
                      errorMessage += `\nContent-Type: ${errorData.contentType}`
                    }
                    if (errorData.detectedType) {
                      errorMessage += `\nDetected Type: ${errorData.detectedType}`
                    }
                    
                    // Добавляем информацию о разрешенных типах если есть
                    if (errorData.details?.allowedModelTypes) {
                      errorMessage += `\nAllowed Model Types: ${errorData.details.allowedModelTypes.join(', ')}`
                    }
                  } catch (e) {
                    // Если не JSON, используем текст как есть
                    if (errorText.length < 500) {
                      errorMessage += `\nResponse: ${errorText}`
                    } else {
                      errorMessage += `\nResponse: ${errorText.substring(0, 500)}...`
                    }
                  }
                }
              } catch (e) {
                // Игнорируем ошибки парсинга
              }
              reject(new Error(errorMessage))
            }
          })
          
          xhr.addEventListener('error', () => reject(new Error('Network error during upload')))
          
          xhr.open('POST', getEndpoint())
          xhr.send(formData)
        })

        console.log('📬 Response status:', localUploadRes.status, localUploadRes.statusText)
        console.log('📬 Endpoint used:', getEndpoint())

        if (!localUploadRes.ok) {
          let errorText = await localUploadRes.text()
          console.error('❌ Response error:', errorText)
          
          // ✅ FIX: Пытаемся распарсить детальную ошибку
          try {
            const errorData = JSON.parse(errorText)
            if (errorData.error) {
              let detailedError = errorData.error
              if (errorData.details) {
                detailedError += `\nDetails: ${typeof errorData.details === 'string' ? errorData.details : JSON.stringify(errorData.details)}`
              }
              if (errorData.filename) {
                detailedError += `\nFilename: ${errorData.filename}`
              }
              if (errorData.contentType) {
                detailedError += `\nContent-Type: ${errorData.contentType}`
              }
              if (errorData.detectedType) {
                detailedError += `\nDetected Type: ${errorData.detectedType}`
              }
              throw new Error(detailedError)
            }
          } catch (parseError) {
            // Если не JSON или другая ошибка, используем оригинальный текст
            if (errorText && errorText.length < 500) {
              throw new Error(`Upload failed: ${errorText}`)
            }
          }
          console.error('❌ Response status:', localUploadRes.status, localUploadRes.statusText)
          console.error('❌ Endpoint used:', getEndpoint())
          console.error('❌ File info:', {
            name: fileToUpload.name,
            size: fileToUpload.size,
            type: fileToUpload.type,
            folder: uploadFolder,
            customFilename,
            wasCompressed: fileToUpload !== file
          })
          
          try {
            const errorData = JSON.parse(errorText)
            const errorMessage = errorData.error || 'Failed to upload file locally'
            const errorType = errorData.type || 'UnknownError'
            const errorDetails = errorData.details ? `\nDetails: ${errorData.details}` : ''
            const errorFilename = errorData.filename ? `\nFilename: ${errorData.filename}` : ''
            const errorContentType = errorData.contentType ? `\nContent-Type: ${errorData.contentType}` : ''
            const errorDetectedType = errorData.detectedType ? `\nDetected Type: ${errorData.detectedType}` : ''
            
            const fullErrorMessage = `${errorMessage}${errorDetails}${errorFilename}${errorContentType}${errorDetectedType}`
            console.error('❌ Full error details:', {
              type: errorType,
              message: errorMessage,
              details: errorData
            })
            throw new Error(fullErrorMessage)
          } catch (parseError) {
            throw new Error(`Failed to upload file locally (${localUploadRes.status}): ${errorText}`)
          }
        }

        const result = await localUploadRes.json()
        setProgress(100)
        
        // Поддержка обоих форматов ответа:
        // 1. Старый формат: { url, key }
        // 2. Новый формат админки: { success, files: [{ url, fileName, ... }] }
        let publicUrl: string
        let key: string | undefined
        
        if (result.files && Array.isArray(result.files) && result.files.length > 0) {
          // Новый формат админки
          const firstFile = result.files[0]
          publicUrl = firstFile.url
          key = firstFile.fileName
        } else {
          // Старый формат
          publicUrl = result.url
          key = result.key
        }
        
        handleUploadComplete(publicUrl, key)
        console.log('✅ Файл загружен:', publicUrl)
      }
    } catch (error: any) {
      console.error('❌ Upload error:', error)
      console.error('❌ Error details:', {
        message: error.message,
        stack: error.stack,
        endpoint: getEndpoint(),
        fileName: file?.name,
        fileSize: file?.size,
        fileType: file?.type
      })
      
      let errorMessage = error.message || 'Ошибка загрузки файла'
      
      // ✅ Специальная обработка для больших файлов
      if (errorMessage.includes('413') || errorMessage.includes('too large') || errorMessage.includes('10MB') || errorMessage.includes('100MB')) {
        setUploadError(errorMessage)
      } else if (errorMessage.includes('parse') || errorMessage.includes('boundary')) {
        errorMessage = 'Upload failed: Invalid file format or corrupted data. Please try again.'
        setUploadError(errorMessage)
      } else if (errorMessage.includes('S3 bucket not configured') || errorMessage.includes('S3 credentials not configured') || errorMessage.includes('not configured')) {
        setUploadError('S3 хранилище не настроено. Для файлов >100MB настройте S3 в .env.local (см. docs).')
      } else {
        setUploadError(`Ошибка загрузки файла: ${errorMessage}`)
      }
      
      setUploadedUrl('')
    } finally {
      setUploading(false)
      setProgress(0)
    }
  }

  // Get file type specific info
  const getFileInfo = () => {
    // Check fileType prop first for accurate detection
    if (fileType === 'panorama') {
      return {
        purpose: 'Фоновое изображение для 3D-сцены',
        format: 'WebP',
        resolution: '4096x2048px (рекомендуется)',
        size: 'без ограничений',
        location: 'Локально → /uploads/images/',
        example: 'panorama_studio_lights.webp',
      }
    }
    if (fileType === 'model') {
      return {
        purpose: '3D модель скутера для интерактивного просмотра',
        format: 'GLB (glTF 2.0)',
        resolution: 'Оптимизированная модель',
        size: 'без ограничений',
        location: 'Локально → /uploads/models/',
        example: 'MODEL-Scooter-Name.glb',
      }
    }
    if (fileType === 'video') {
      return {
        purpose: 'Видео для карточки товара',
        format: 'MP4 (H.264)',
        resolution: 'до 1920x1080px (рекомендуется)',
        size: 'без ограничений',
        location: 'Локально → /uploads/videos/',
        example: 'product_demo.mp4',
      }
    }
    
    // Fallback to label detection
    if (label.toLowerCase().includes('панорам') || label.toLowerCase().includes('panorama') || label.toLowerCase().includes('фон')) {
      return {
        purpose: 'Фоновое изображение для 3D-сцены',
        format: 'WebP',
        resolution: '4096x2048px (рекомендуется)',
        size: 'без ограничений',
        location: 'Локально → /uploads/images/',
        example: 'panorama_studio_lights.webp',
      }
    }
    if (label.toLowerCase().includes('cover') || label.toLowerCase().includes('обложк')) {
      return {
        purpose: 'Главное изображение для карточек и превью',
        format: 'PNG, WebP',
        resolution: '1200x800px (рекомендуется)',
        size: 'без ограничений',
        location: 'Локально → /uploads/images/',
        example: 'PHOTO-D1_1.png',
      }
    }
    if (label.toLowerCase().includes('3d') || label.toLowerCase().includes('glb') || label.toLowerCase().includes('модел')) {
      return {
        purpose: '3D модель скутера для интерактивного просмотра',
        format: 'GLB (glTF 2.0)',
        resolution: 'Оптимизированная модель',
        size: 'без ограничений',
        location: 'Локально → /uploads/models/',
        example: 'MODEL-Scooter-Name.glb',
      }
    }
    if (label.toLowerCase().includes('texture') || label.toLowerCase().includes('uv') || label.toLowerCase().includes('дизайн')) {
      return {
        purpose: 'Текстура дизайна для 3D модели',
        format: 'JPG',
        resolution: '512x512px (рекомендуется)',
        size: '<1MB',
        location: 'Локально → /uploads/images/',
        example: 'D1_UV_Z-parts.jpg',
      }
    }
    if (label.toLowerCase().includes('видео') || label.toLowerCase().includes('video')) {
      return {
        purpose: 'Видео для карточки товара (после фотографий)',
        format: 'MP4 (H.264)',
        resolution: '1920x1080px (рекомендуется)',
        size: 'без ограничений',
        location: 'Локально → /uploads/videos/',
        example: 'Video_D1.mp4',
      }
    }
    if (label.toLowerCase().includes('фото') || label.toLowerCase().includes('галере') || label.toLowerCase().includes('photo')) {
      return {
        purpose: 'Фотографии для галереи карточки товара',
        format: 'PNG, WebP',
        resolution: '1920x1080px (рекомендуется)',
        size: 'без ограничений',
        location: 'Локально → /uploads/images/',
        example: 'PHOTO-D1_1.png',
      }
    }
    return null
  }

  const fileInfo = getFileInfo()

  return (
    <div
      className="space-y-3 p-4 rounded-2xl"
      style={{
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
      }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <label className="block text-sm font-semibold text-white mb-2">{label}</label>
          {fileInfo && (
            <div className="text-xs text-white/60 space-y-1 mb-3">
              <div>
                <strong className="text-white/80">Назначение:</strong> {fileInfo.purpose}
              </div>
              <div className="flex gap-4 flex-wrap">
                <span>
                  <strong className="text-white/80">Формат:</strong> {fileInfo.format}
                </span>
                <span>
                  <strong className="text-white/80">Разрешение:</strong> {fileInfo.resolution}
                </span>
                <span>
                  <strong className="text-white/80">Размер:</strong> {fileInfo.size}
                </span>
              </div>
              <div>
                <strong className="text-white/80">Загружается в:</strong>{' '}
                <code className="text-[#00FFA9] text-xs">{fileInfo.location}</code>
              </div>
              <div>
                <strong className="text-white/80">Пример названия:</strong>{' '}
                <code className="text-[#00D4FF] text-xs">{fileInfo.example}</code>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <input
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          disabled={uploading}
          className="block w-full text-sm text-white/60 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-white/10 file:text-white hover:file:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
        />
        {uploading && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-white/70">
              <span className="font-medium">Загрузка файла...</span>
              <span className="font-semibold text-[#00FFA9]">{progress}%</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-[#00FFA9] to-[#00D4FF] h-3 rounded-full transition-all duration-300 ease-out flex items-center justify-end pr-2"
                style={{ width: `${progress}%` }}
              >
                {progress > 10 && (
                  <span className="text-[10px] font-bold text-black/70">{progress}%</span>
                )}
              </div>
            </div>
            <div className="text-xs text-white/50 text-center">
              {progress < 30 && 'Подготовка...'}
              {progress >= 30 && progress < 70 && 'Загрузка на сервер...'}
              {progress >= 70 && progress < 100 && 'Обработка...'}
              {progress === 100 && '✅ Загрузка завершена!'}
            </div>
          </div>
        )}
      </div>

      {uploadedUrl && (
        <div className="mt-2 p-2 rounded-xl bg-[#00FFA9]/10 border border-[#00FFA9]/20">
          <div className="text-xs text-[#00FFA9]">
            <strong>✅ Файл загружен:</strong>
            <div className="mt-1 break-all text-white/70">{uploadedUrl}</div>
          </div>
        </div>
      )}

      {uploadError && (
        <div className="mt-2 p-3 rounded-xl bg-red-500/20 border border-red-500/30">
          <div className="text-xs text-red-400">
            <strong>❌ Ошибка загрузки:</strong>
            <div className="mt-1 whitespace-pre-line text-red-300">{uploadError}</div>
            
            {/* ✅ Подсказка для больших файлов */}
            {(uploadError.includes('10MB') || uploadError.includes('100MB') || uploadError.includes('too large')) && (
              <div className="mt-3 p-2 rounded-lg bg-yellow-500/20 border border-yellow-500/30">
                <p className="text-yellow-300 font-semibold mb-2">💡 Решения:</p>
                <ol className="list-decimal list-inside space-y-1 text-yellow-200/90">
                  <li>Настройте S3 для файлов &gt;100MB (см. <code className="bg-black/30 px-1 rounded">docs/S3_SETUP_GUIDE.md</code>)</li>
                  <li>Оптимизируйте модель (см. <code className="bg-black/30 px-1 rounded">docs/3d-optimization.md</code>)</li>
                </ol>
                <p className="mt-2 text-yellow-200/70 text-[10px]">
                  Локальная загрузка: до 100MB (настройка в next.config и FileUpload)
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
