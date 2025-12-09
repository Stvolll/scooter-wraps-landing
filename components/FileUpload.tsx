'use client'

import React, { useState } from 'react'

interface FileUploadProps {
  onUploadComplete: (url: string, key?: string) => void
  accept?: string
  maxSize?: number
  label?: string
}

export default function FileUpload({
  onUploadComplete,
  accept = 'image/*',
  maxSize = 10 * 1024 * 1024, // 10MB default
  label = 'Upload File',
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [uploadedUrl, setUploadedUrl] = useState<string>('')

  const handleUploadComplete = (url: string, key?: string) => {
    setUploadedUrl(url)
    onUploadComplete(url, key)
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file size
    if (file.size > maxSize) {
      alert(`Размер файла превышает лимит ${maxSize / 1024 / 1024}MB`)
      return
    }

    setUploading(true)
    setProgress(0)
    setUploadedUrl('') // Clear previous upload

    try {
      // Step 1: Get signed URL
      const signedUrlRes = await fetch('/api/uploads/signed-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type,
          fileSize: file.size,
        }),
      })

      if (!signedUrlRes.ok) {
        const error = await signedUrlRes.json()
        throw new Error(error.error || 'Failed to get signed URL')
      }

      const { url: signedUrl, key } = await signedUrlRes.json()
      setProgress(50)

      // Step 2: Upload directly to S3
      const uploadRes = await fetch(signedUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type,
        },
        body: file,
      })

      if (!uploadRes.ok) {
        throw new Error('Failed to upload file to S3')
      }

      setProgress(100)

      // Step 3: Construct public URL
      const bucket = process.env.NEXT_PUBLIC_S3_BUCKET || ''
      const region = process.env.NEXT_PUBLIC_S3_REGION || 'us-east-1'
      const cloudFrontDomain = process.env.NEXT_PUBLIC_IMAGE_CDN_DOMAIN

      let publicUrl = ''
      if (cloudFrontDomain) {
        publicUrl = `https://${cloudFrontDomain}/${key}`
      } else {
        publicUrl = `https://${bucket}.s3.${region}.amazonaws.com/${key}`
      }

      handleUploadComplete(publicUrl, key)
    } catch (error: any) {
      console.error('Upload error:', error)
      alert(error.message || 'Ошибка загрузки файла')
      setUploadedUrl('')
    } finally {
      setUploading(false)
      setProgress(0)
    }
  }

  // Get file type specific info
  const getFileInfo = () => {
    if (label.toLowerCase().includes('cover')) {
      return {
        purpose: 'Главное изображение для карточек и превью',
        format: 'JPG, PNG, WebP',
        resolution: '1200x800px (рекомендуется)',
        size: 'до 500KB',
        location: 'S3 → /images/designs/',
        example: 'neon-blade-cover.webp',
      }
    }
    if (label.toLowerCase().includes('3d') || label.toLowerCase().includes('glb')) {
      return {
        purpose: '3D модель скутера для интерактивного просмотра',
        format: 'GLB (binary GLTF)',
        resolution: 'Оптимизированная модель',
        size: `до ${maxSize / 1024 / 1024}MB`,
        location: 'S3 → /models/',
        example: 'honda-vision-neon-blade.glb',
      }
    }
    if (label.toLowerCase().includes('texture')) {
      return {
        purpose: 'Текстура для наложения на 3D модель',
        format: 'PNG, JPG, KTX2',
        resolution: '2048x2048px (степени двойки)',
        size: 'до 10MB',
        location: 'S3 → /textures/',
        example: 'honda-vision-neon-blade-texture.png',
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

      <div className="flex items-center gap-4">
        <input
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          disabled={uploading}
          className="block w-full text-sm text-white/60 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-white/10 file:text-white hover:file:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
        />
        {uploading && (
          <div className="flex-1">
            <div className="w-full bg-white/10 rounded-full h-2">
              <div
                className="bg-[#00FFA9] h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
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
    </div>
  )
}
