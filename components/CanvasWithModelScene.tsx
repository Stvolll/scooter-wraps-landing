'use client'

/**
 * Thin Canvas shell for ModelScene3DRefactored (single useGLTF site).
 * Restores missing module required by ScooterViewer3DWithDesigns, ModelScene3DWrapper, etc.
 */

import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import ModelScene3DRefactored from './ModelScene3DRefactored'

export interface CanvasWithModelSceneProps {
  modelUrl: string
  designId?: string
  panoramaUrl?: string
  onLoadingChange?: (loading: boolean) => void
  onError?: (error: Error) => void
}

export default function CanvasWithModelScene({
  modelUrl,
  designId,
  panoramaUrl,
  onLoadingChange,
  onError,
}: CanvasWithModelSceneProps) {
  if (!modelUrl) return null

  return (
    <Canvas
      shadows
      camera={{ position: [0, 0.4, 2.5], fov: 30 }}
      gl={{
        antialias: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.2,
      }}
      style={{ width: '100%', height: '100%', display: 'block' }}
      dpr={[1, 2]}
    >
      <ModelScene3DRefactored
        modelUrl={modelUrl}
        designId={designId}
        panoramaUrl={panoramaUrl}
        onLoadingChange={onLoadingChange}
        onError={onError}
      />
    </Canvas>
  )
}
