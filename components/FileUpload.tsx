'use client'

import React, { useState } from 'react'

interface FileUploadProps {
  onUploadComplete: (url: string, key: string) => void
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

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file size
    if (file.size > maxSize) {
      alert(`File size exceeds ${maxSize / 1024 / 1024}MB limit`)
      return
    }

    setUploading(true)
    setProgress(0)

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

      onUploadComplete(publicUrl, key)
    } catch (error: any) {
      console.error('Upload error:', error)
      alert(error.message || 'Failed to upload file')
    } finally {
      setUploading(false)
      setProgress(0)
    }
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-white/80 mb-1">{label}</label>
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
    </div>
  )
}

