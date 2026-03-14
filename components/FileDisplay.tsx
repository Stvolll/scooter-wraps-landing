'use client'

import React from 'react'

interface FileDisplayProps {
  url: string
  label?: string
  fileType?: 'image' | 'video' | 'model' | 'panorama'
  onRemove?: () => void
  onReplace?: () => void
  showInfo?: boolean
}

export default function FileDisplay({
  url,
  label,
  fileType = 'image',
  onRemove,
  onReplace,
  showInfo = true,
}: FileDisplayProps) {
  const getFileInfo = (url: string) => {
    try {
      const urlObj = new URL(url.startsWith('/') ? `http://localhost${url}` : url)
      const pathname = urlObj.pathname
      const filename = pathname.split('/').pop() || url
      const extension = filename.split('.').pop()?.toUpperCase() || ''
      return { filename, extension, pathname }
    } catch {
      const pathname = url
      const filename = pathname.split('/').pop() || url
      const extension = filename.split('.').pop()?.toUpperCase() || ''
      return { filename, extension, pathname }
    }
  }

  const { filename, extension, pathname } = getFileInfo(url)

  const getFileTypeIcon = () => {
    switch (fileType) {
      case 'model':
        return (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        )
      case 'video':
        return (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        )
      case 'panorama':
        return (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        )
      default:
        return (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        )
    }
  }

  return (
    <div className="bg-[#2C2C2E] rounded-2xl p-5 border border-white/10">
      <div className="flex items-start gap-4">
        {/* Preview */}
        {fileType === 'image' || fileType === 'panorama' ? (
          <div className="relative flex-shrink-0">
            <img
              src={url}
              alt={label || filename}
              className="w-32 h-24 object-cover rounded-xl border border-white/10"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
                const parent = e.currentTarget.parentElement
                if (parent) {
                  parent.innerHTML = `
                    <div class="w-32 h-24 bg-[#1C1C1E] rounded-xl border border-white/10 flex items-center justify-center">
                      ${getFileTypeIcon().props.children}
                    </div>
                  `
                }
              }}
            />
          </div>
        ) : fileType === 'video' ? (
          <div className="w-32 h-24 bg-[#1C1C1E] rounded-xl border border-white/10 flex items-center justify-center flex-shrink-0">
            <svg className="w-8 h-8 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
        ) : (
          <div className="w-32 h-24 bg-[#1C1C1E] rounded-xl border border-white/10 flex items-center justify-center flex-shrink-0 text-white/40">
            {getFileTypeIcon()}
          </div>
        )}

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex-1 min-w-0">
              <p className="text-[#34C759] text-sm font-medium mb-1 flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                {label || 'Файл загружен'}
              </p>
              {showInfo && (
                <div className="space-y-1">
                  <code className="text-xs text-white/50 break-all block font-mono">
                    {pathname}
                  </code>
                  <div className="flex items-center gap-3 text-xs text-white/40">
                    <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10">
                      {extension}
                    </span>
                    <span className="truncate">{filename}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 mt-3">
            {onReplace && (
              <button
                onClick={onReplace}
                className="text-[#007AFF] hover:text-[#0051D5] text-sm font-medium transition-colors"
              >
                Заменить
              </button>
            )}
            {onRemove && (
              <button
                onClick={onRemove}
                className="text-[#FF3B30] hover:text-[#FF453A] text-sm font-medium transition-colors"
              >
                Удалить
              </button>
            )}
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/60 hover:text-white/80 text-sm font-medium transition-colors flex items-center gap-1"
            >
              Открыть
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}


