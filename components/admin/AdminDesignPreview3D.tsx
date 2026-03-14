'use client'

import dynamic from 'next/dynamic'
import { useMemo } from 'react'

const CanvasWithModelScene = dynamic(
  () => import('@/components/CanvasWithModelScene'),
  { ssr: false, loading: () => <div className="flex items-center justify-center h-full text-white/60">Loading 3D...</div> }
)

interface AdminDesignPreview3DProps {
  modelUrl: string
  designId: string
  className?: string
}

export default function AdminDesignPreview3D({
  modelUrl,
  designId,
  className = '',
}: AdminDesignPreview3DProps) {
  const url = useMemo(() => {
    if (!modelUrl) return ''
    return modelUrl.startsWith('/') ? modelUrl : `/${modelUrl}`
  }, [modelUrl])

  if (!url) {
    return (
      <div className={`flex items-center justify-center bg-[#1a1a1a] rounded-xl ${className}`}>
        <p className="text-white/50 text-sm">Нет модели для превью</p>
      </div>
    )
  }

  return (
    <div
      className={`relative rounded-xl overflow-hidden ${className}`}
      style={{
        background: 'linear-gradient(180deg, #1a1a1a 0%, #0a0a0a 100%)',
      }}
    >
      <CanvasWithModelScene modelUrl={url} designId={designId} />
    </div>
  )
}
