/**
 * Design File Replacer Component
 * Allows replacing files (texture, photos, videos, background) in design cards
 * Follows User Rules: uses application services, no direct domain access
 */

import { useState, useRef } from 'react'

interface DesignFileReplacerProps {
  designId: string
  fileType: 'texture' | 'photo' | 'video' | 'background'
  currentUrl?: string
  onFileReplaced?: () => void
  multiple?: boolean // For photos/videos
}

export default function DesignFileReplacer({
  designId,
  fileType,
  currentUrl,
  onFileReplaced,
  multiple = false,
}: DesignFileReplacerProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    setError(null)

    try {
      // Upload files first
      const formData = new FormData()
      Array.from(files).forEach((file) => {
        formData.append('files', file)
      })
      formData.append('type', fileType)

      const uploadResponse = await fetch('/api/admin/designs/upload', {
        method: 'POST',
        body: formData,
      })

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json()
        throw new Error(errorData.error || 'Failed to upload files')
      }

      const uploadData = await uploadResponse.json()
      const uploadedFiles = uploadData.files || []

      if (uploadedFiles.length === 0) {
        throw new Error('No files were uploaded')
      }

      // Update design with new files
      const updateData: any = {
        designId,
      }

      if (fileType === 'texture') {
        updateData.mainTextureFile = uploadedFiles[0].url
      } else if (fileType === 'photo') {
        updateData.photoFiles = uploadedFiles.map((f: any) => f.url)
      } else if (fileType === 'video') {
        updateData.videoFiles = uploadedFiles.map((f: any) => f.url)
      } else if (fileType === 'background') {
        updateData.backgroundFile = uploadedFiles[0].url
      }

      const updateResponse = await fetch(`/api/admin/designs/${designId}/replace-file`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      })

      if (!updateResponse.ok) {
        const errorData = await updateResponse.json()
        throw new Error(errorData.error || 'Failed to update design')
      }

      // Success
      if (onFileReplaced) {
        onFileReplaced()
      } else {
        // Reload page to show updated design
        window.location.reload()
      }
    } catch (err) {
      console.error('[DesignFileReplacer] Error:', err)
      setError(err instanceof Error ? err.message : 'Failed to replace file')
    } finally {
      setUploading(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const getAcceptTypes = () => {
    switch (fileType) {
      case 'texture':
        return '.jpg,.jpeg,.png,.webp'
      case 'photo':
        return '.jpg,.jpeg,.png'
      case 'video':
        return '.mp4,.webm'
      case 'background':
        return '.jpg,.jpeg,.png,.webp,.hdr,.exr'
      default:
        return '*'
    }
  }

  const getLabel = () => {
    switch (fileType) {
      case 'texture':
        return 'Replace Texture'
      case 'photo':
        return multiple ? 'Add Photos' : 'Replace Photo'
      case 'video':
        return multiple ? 'Add Videos' : 'Replace Video'
      case 'background':
        return 'Replace Background'
      default:
        return 'Replace File'
    }
  }

  return (
    <div className="design-file-replacer">
      <input
        ref={fileInputRef}
        type="file"
        accept={getAcceptTypes()}
        multiple={multiple && (fileType === 'photo' || fileType === 'video')}
        onChange={handleFileSelect}
        style={{ display: 'none' }}
        disabled={uploading}
      />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="admin-button small"
        title={getLabel()}
      >
        {uploading ? 'Uploading...' : getLabel()}
      </button>
      {error && (
        <div className="error-message" style={{ color: 'red', fontSize: '0.85rem', marginTop: '0.25rem' }}>
          {error}
        </div>
      )}
    </div>
  )
}

