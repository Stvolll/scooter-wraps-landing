'use client'

/**
 * ScooterViewer Component
 *
 * Displays a 3D scooter model using the <model-viewer> web component.
 *
 * This component properly handles the async loading of model-viewer script
 * and ensures the custom element is registered before rendering.
 *
 * IMPORTANT: This component only renders on the client to avoid hydration errors.
 */

import { useEffect, useRef, useState, useMemo } from 'react'
import * as THREE from 'three'
import { MaterialFormat } from '@/lib/materials/types'
import { findMaterialByFormat, getMaterialDisplayUrl } from '@/lib/materials/registry'

// Global error handler for RangeError (Float32Array issues) - only on client
if (typeof window !== 'undefined') {
  // Add unhandled error listener for RangeError
  window.addEventListener('error', (event) => {
    if (event.message && (
      event.message.includes('Invalid typed array length') || 
      event.message.includes('Float32Array') ||
      event.message.includes('RangeError')
    )) {
      console.error('❌ GLB file RangeError detected:', event.message)
      console.warn('💡 This usually indicates a corrupted or too large GLB file')
      // Don't prevent default - let it handle normally, just log it
    }
  }, true) // Use capture phase to catch early
}

// Стандартные настройки камеры для всех моделей скутеров
// Эти значения обеспечивают единообразный стартовый ракурс для всех моделей
// Скутер стоит строго в профиль к зрителю с противоположной стороны, без вида "чуть сверху"
const DEFAULT_CAMERA_ORBIT = '-90deg 90deg 2.5m' // theta(horizontal) phi(vertical) radius(distance)
// theta: -90deg = строго боковой вид с противоположной стороны (зеркально к 90deg)
// phi: 90deg = строго горизонтальный вид (не сверху, не снизу)
// radius: 2.5m = расстояние от камеры до модели

const DEFAULT_CAMERA_TARGET = '0m 0.5m 0m' // Центр обзора на уровне центра модели
const DEFAULT_FIELD_OF_VIEW = '30deg' // Угол обзора для комфортного просмотра

// Ограничения камеры
const MIN_CAMERA_ORBIT = 'auto 70deg 1.2m' // Можно приблизить и опустить ниже
const MAX_CAMERA_ORBIT = 'auto 95deg 4m' // Можно отдалить

const WRAP_MATERIAL_PATTERNS = [
  'z-places',
  'z_places',
  'z-parts',
  'z_parts',
  'a-face',
  'a_face',
  'rl-place',
  'rl_place',
  'uv',
  'wrap',
  'place',
  'panel',
  'cover',
]

function matchesWrapMaterialName(name = '') {
  const normalizedName = String(name).toLowerCase()
  return WRAP_MATERIAL_PATTERNS.some(pattern => normalizedName.includes(pattern))
}

function isTraversableScene(candidate) {
  return !!candidate && typeof candidate.traverse === 'function'
}

function findTraversableScene(root, visited = new Set(), depth = 0) {
  if (!root || depth > 3 || visited.has(root)) return null
  visited.add(root)

  if (isTraversableScene(root)) {
    return root
  }

  const candidates = []

  if (Array.isArray(root)) {
    candidates.push(...root)
  } else {
    candidates.push(root.scene, root.model, root.target, root.root, root.parent, root.scenes?.[0])

    try {
      const symbolValues = Object.getOwnPropertySymbols(root).map(symbol => root[symbol])
      candidates.push(...symbolValues)
    } catch {
      // Ignore symbol access errors.
    }
  }

  for (const candidate of candidates) {
    const scene = findTraversableScene(candidate, visited, depth + 1)
    if (scene) return scene
  }

  return null
}

function getInternalThreeScene(modelViewer) {
  if (!modelViewer) return null

  const directCandidates = [
    modelViewer.scene,
    modelViewer.model?.scene,
    modelViewer.model?.scenes?.[0],
    modelViewer.renderer?.scene,
    typeof modelViewer.renderer?.getScene === 'function' ? modelViewer.renderer.getScene() : null,
  ]

  for (const candidate of directCandidates) {
    if (isTraversableScene(candidate)) {
      return candidate
    }
  }

  return findTraversableScene(modelViewer)
}

function waitForModelViewerLoad(modelViewer) {
  if (!modelViewer) return Promise.resolve(false)
  const hasSceneGraph =
    Array.isArray(modelViewer.model?.materials) && modelViewer.model.materials.length > 0
      ? true
      : !!getInternalThreeScene(modelViewer)

  if (modelViewer.loaded && hasSceneGraph) {
    if (modelViewer.updateComplete && typeof modelViewer.updateComplete.then === 'function') {
      return modelViewer.updateComplete.then(() => true).catch(() => true)
    }
    return Promise.resolve(true)
  }

  return new Promise(resolve => {
    const cleanup = () => {
      clearInterval(intervalId)
      clearTimeout(timeoutId)
      modelViewer.removeEventListener('model-loaded', handleLoad)
      modelViewer.removeEventListener('scene-graph-ready', handleLoad)
      modelViewer.removeEventListener('error', handleError)
    }

    const handleLoad = () => {
      const readyNow =
        (Array.isArray(modelViewer.model?.materials) && modelViewer.model.materials.length > 0) ||
        !!getInternalThreeScene(modelViewer)

      if (!readyNow) return

      Promise.resolve(modelViewer.updateComplete)
        .catch(() => undefined)
        .finally(() => {
          cleanup()
          resolve(true)
        })
    }

    const handleError = () => {
      cleanup()
      resolve(false)
    }

    const intervalId = setInterval(handleLoad, 200)
    const timeoutId = setTimeout(() => {
      cleanup()
      resolve(false)
    }, 5000)

    modelViewer.addEventListener('model-loaded', handleLoad, { once: true })
    modelViewer.addEventListener('scene-graph-ready', handleLoad)
    modelViewer.addEventListener('error', handleError, { once: true })
    handleLoad()
  })
}

function getCompatibleThree(modelViewer) {
  return (
    modelViewer?.renderer?.three ||
    modelViewer?.renderer?.Three ||
    modelViewer?.Three ||
    window.THREE ||
    THREE
  )
}

async function applyTextureViaModelViewerMaterialsApi(modelViewer, texturePath) {
  if (!modelViewer || !texturePath) return false

  const materials = modelViewer.model?.materials
  const createTexture =
    typeof modelViewer.createTexture === 'function'
      ? modelViewer.createTexture.bind(modelViewer)
      : typeof modelViewer.model?.createTexture === 'function'
        ? modelViewer.model.createTexture.bind(modelViewer.model)
        : null

  if (!Array.isArray(materials) || materials.length === 0 || !createTexture) {
    return false
  }

  const texture = await createTexture(texturePath)
  if (!texture) return false

  await Promise.all(
    materials.map(material =>
      typeof material?.ensureLoaded === 'function'
        ? material.ensureLoaded().catch(() => undefined)
        : Promise.resolve()
    )
  )

  const materialsWithTextureSlots = materials.filter(
    material =>
      material?.pbrMetallicRoughness?.baseColorTexture &&
      typeof material.pbrMetallicRoughness.baseColorTexture.setTexture === 'function'
  )
  const preferredMaterials = materialsWithTextureSlots.filter(material =>
    matchesWrapMaterialName(material?.name)
  )
  const targetMaterials =
    preferredMaterials.length > 0
      ? preferredMaterials
      : materialsWithTextureSlots.length > 0
        ? materialsWithTextureSlots
        : materials

  let updatedMaterials = 0

  targetMaterials.forEach(material => {
    const pbr = material?.pbrMetallicRoughness
    const baseColorTexture = pbr?.baseColorTexture

    if (baseColorTexture && typeof baseColorTexture.setTexture === 'function') {
      baseColorTexture.setTexture(texture)
      if (typeof pbr?.setBaseColorFactor === 'function') {
        pbr.setBaseColorFactor([1, 1, 1, 1])
      }
      updatedMaterials++
    }
  })

  if (updatedMaterials === 0) {
    return false
  }

  if (typeof modelViewer.requestUpdate === 'function') {
    modelViewer.requestUpdate()
  }

  console.log('✅ Applied texture via model-viewer Materials API:', {
    updatedMaterials,
    targetMaterials: targetMaterials.map(material => material?.name || 'unnamed'),
  })

  return true
}

async function applyTextureViaThreeScene(scene, texturePath, ThreeLib) {
  if (
    !scene ||
    typeof scene.traverse !== 'function' ||
    !texturePath ||
    !ThreeLib?.TextureLoader
  ) {
    return false
  }

  const texture = await new Promise((resolve, reject) => {
    const loader = new ThreeLib.TextureLoader()
    loader.load(texturePath, resolve, undefined, reject)
  })

  texture.flipY = false
  if (ThreeLib.SRGBColorSpace !== undefined) {
    texture.colorSpace = ThreeLib.SRGBColorSpace
  }
  texture.wrapS = ThreeLib.RepeatWrapping
  texture.wrapT = ThreeLib.RepeatWrapping
  texture.needsUpdate = true

  let updatedMaterials = 0
  let targetedMaterials = 0

  const applyToMaterial = material => {
    if (!material || typeof material !== 'object' || !('map' in material)) return false

    material.map = texture
    if ('color' in material && material.color?.set) {
      material.color.set(0xffffff)
    }
    material.needsUpdate = true
    return true
  }

  scene.traverse(node => {
    if (!node?.isMesh || !node.material) return

    const materials = Array.isArray(node.material) ? node.material : [node.material]

    materials.forEach(material => {
      const shouldApply =
        matchesWrapMaterialName(node.name) || matchesWrapMaterialName(material.name)

      if (!shouldApply) return

      if (applyToMaterial(material)) {
        targetedMaterials++
        updatedMaterials++
      }
    })

    if (node.geometry?.attributes?.uv) {
      node.geometry.attributes.uv.needsUpdate = true
    }
  })

  if (updatedMaterials === 0) {
    scene.traverse(node => {
      if (!node?.isMesh || !node.material) return

      const materials = Array.isArray(node.material) ? node.material : [node.material]
      materials.forEach(material => {
        if (applyToMaterial(material)) {
          updatedMaterials++
        }
      })

      if (node.geometry?.attributes?.uv) {
        node.geometry.attributes.uv.needsUpdate = true
      }
    })
  }

  if (updatedMaterials === 0) {
    return false
  }

  console.log('✅ Applied texture via direct Three.js scene traversal:', {
    updatedMaterials,
    targetedMaterials,
  })

  return true
}

export default function ScooterViewer({
  modelPath,
  selectedDesign,
  environmentImage = null,
  panoramaUrl = '/images/studio-panorama.png',
  className = '',
}) {
  const containerRef = useRef(null)
  const modelViewerRef = useRef(null)
  const textureRetryCountRef = useRef(0) // Track retry count across recursive calls
  const textureApplicationStoppedRef = useRef(false) // Flag to stop all texture application attempts
  const modelLoadErrorRef = useRef(false) // Use ref instead of state to prevent effect loops
  const [scriptLoaded, setScriptLoaded] = useState(false)
  const [isModelLoaded, setIsModelLoaded] = useState(false)
  const [isSceneGraphReady, setIsSceneGraphReady] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [modelLoadError, setModelLoadError] = useState(false) // Keep for display, but use ref for logic

  // Check if model needs placeholder (based on model metadata or error state)
  // This is now dynamic - no hardcoded model checks
  const needsPlaceholder = useMemo(() => {
    // Placeholder is only used if model fails to load
    // No hardcoded model-specific logic
    return false
  }, [])

  // Hook 1: Set mounted state
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Hook 2: Wait for model-viewer script to load
  useEffect(() => {
    if (!isMounted) return

    // Check if already loaded
    if (typeof window !== 'undefined' && window.customElements) {
      if (window.customElements.get('model-viewer')) {
        setScriptLoaded(true)
        return
      }
    }

    // Poll for script loading
    let checkInterval = setInterval(() => {
      if (typeof window !== 'undefined' && window.customElements) {
        if (window.customElements.get('model-viewer')) {
          setScriptLoaded(true)
          clearInterval(checkInterval)
        }
      }
    }, 50)

    // Timeout after 10 seconds - but don't treat as critical error
    const timeout = setTimeout(() => {
      clearInterval(checkInterval)
      // Check one more time before logging error
      if (typeof window !== 'undefined' && window.customElements) {
        if (window.customElements.get('model-viewer')) {
          // Script loaded, just took longer than expected
          setScriptLoaded(true)
          return
        }
      }
      // Only log if script really didn't load
      console.warn('⚠️ model-viewer script may not have loaded after 10 seconds')
      console.warn('💡 Tip: Check network connection and CDN availability')
      console.warn('💡 Tip: Script may still load, model-viewer will work when ready')
    }, 10000)

    return () => {
      clearInterval(checkInterval)
      clearTimeout(timeout)
    }
  }, [isMounted])

  // Hook 3: Create and configure model-viewer element
  useEffect(() => {
    if (!isMounted || !scriptLoaded || !containerRef.current || !modelPath) return

    // Wrap in async IIFE to use await
    ;(async () => {
      // Define variables outside try-catch for cleanup function
      let container = null
      let modelViewer = null
      let handleLoad = null
      let handleModelLoad = null
      let handleSceneGraphReady = null
      let handleProgress = null
      let handleError = null
      let handleCameraChange = null

      try {
      container = containerRef.current
      if (!container) return
      
      // Capture selectedDesign in closure for diagnostics
      const currentSelectedDesign = selectedDesign

      // Clear any existing content
      container.innerHTML = ''

    // Normalize and auto-fix model path
    // In Next.js, files in public/ are served from root, so /uploads/ should work if file is in public/uploads/
    let fullModelPath = modelPath.startsWith('/') ? modelPath : `/${modelPath}`
    
    // Auto-fix common path issues
    // If path starts with /public/, remove it (Next.js serves from public/ root)
    if (fullModelPath.startsWith('/public/')) {
      fullModelPath = fullModelPath.replace('/public/', '/')
      console.log('🔧 Auto-fixed path (removed /public/):', fullModelPath)
    }
    
    // If path doesn't start with /uploads/ but contains uploads, ensure it starts with /
    if (fullModelPath.includes('uploads/') && !fullModelPath.startsWith('/uploads/')) {
      const uploadsIndex = fullModelPath.indexOf('uploads/')
      fullModelPath = '/' + fullModelPath.substring(uploadsIndex)
      console.log('🔧 Auto-fixed path (normalized uploads/):', fullModelPath)
    }
    
    // Store original path for reference
    const originalPath = fullModelPath
    console.log('🔍 Loading 3D model from:', fullModelPath)

    // Extract filename for path resolution
    const fileName = fullModelPath.split('/').pop() || ''

    // Pre-check file availability and try alternative paths if needed
    const checkFileAvailability = async () => {
      // List of possible paths to try
      const pathsToTry = [
        fullModelPath, // Original path
        fullModelPath.replace('/uploads/', '/public/uploads/'), // If /public/ was removed
        fullModelPath.replace('/public/uploads/', '/uploads/'), // If /public/ was added
      ]
      
      // Extract model name from path for fallback search
      const modelNameMatch = fileName.match(/MODEL-([^-]+)/i)
      const modelName = modelNameMatch ? modelNameMatch[1].toLowerCase() : null
      
      // Try paths based on extracted model name (generic, not model-specific)
      // This allows any model name to work without hardcoding
      if (modelName) {
        const fallbackPaths = [
          `/uploads/models/${modelName}.glb`,
          `/models/${modelName}.glb`,
          `/uploads/models/MODEL-${modelName}.glb`,
          `/models/optimized/${modelName}.glb`
        ]
        pathsToTry.push(...fallbackPaths.filter(p => !p.includes('*'))) // Remove pattern paths
      }
      
      // Remove duplicates
      const uniquePaths = [...new Set(pathsToTry)]
      
      for (const testPath of uniquePaths) {
        try {
          // Add timeout to prevent hanging
          const controller = new AbortController()
          const timeoutId = setTimeout(() => controller.abort(), 2000) // 2 second timeout
          
          const response = await fetch(testPath, { 
            method: 'HEAD',
            signal: controller.signal,
          })
          
          clearTimeout(timeoutId)
          
          if (response.ok) {
            // File found!
            const contentLength = response.headers.get('content-length')
            if (contentLength) {
              const sizeMB = parseInt(contentLength) / (1024 * 1024)
              console.log(`📦 Model file size: ${sizeMB.toFixed(2)} MB`)
              if (sizeMB > 20) {
                console.warn(`⚠️ Large model file (${sizeMB.toFixed(2)} MB) - may take longer to load`)
              }
            }
            // Return path info for auto-correction
            if (testPath !== fullModelPath) {
              console.log(`✅ Found alternative model file: ${testPath}`)
            }
            return { found: true, path: testPath }
          }
        } catch (error) {
          // Continue to next path
          if (error.name !== 'AbortError') {
            console.debug(`Path ${testPath} not accessible:`, error.message)
          }
          continue
        }
      }
      
      // If we get here, none of the paths worked
      // Model file not found - log warning but don't block loading
      console.warn(`⚠️ Model file not found at any of the tried paths:`, uniquePaths)
      console.warn('💡 Will try to load anyway - model-viewer may handle it')
      return { found: false, path: fullModelPath } // But don't block - let model-viewer try
    }

    // Check file availability BEFORE creating model-viewer
    // Check file availability before creating model-viewer
    const fileCheck = await checkFileAvailability()
    
    // If file not found, skip 3D viewer (no special cases for specific models)
    if (fileCheck && typeof fileCheck === 'object' && fileCheck.path === null) {
      console.log('ℹ️ Model file not found, skipping 3D viewer')
      return
    }
    
    // Create model-viewer element
    setIsSceneGraphReady(false)
    modelViewer = document.createElement('model-viewer')

    // Use corrected path if found, otherwise use original
    const finalModelPath = (fileCheck && typeof fileCheck === 'object' && fileCheck.path) 
      ? fileCheck.path 
      : fullModelPath

    // Set src using direct property (more reliable than setAttribute)
    modelViewer.src = finalModelPath
    modelViewer.alt = '3D Scooter Model'
    
    if (fileCheck && typeof fileCheck === 'object' && fileCheck.path && fileCheck.path !== fullModelPath) {
      console.log('✅ Using corrected model path:', fileCheck.path)
    } else if (fileCheck && typeof fileCheck === 'object' && fileCheck.found) {
      console.log('✅ Model file verified at path:', finalModelPath)
    }

    // Basic controls
    modelViewer.setAttribute('camera-controls', '')
    modelViewer.setAttribute('auto-rotate', '')
    modelViewer.setAttribute('rotation-per-second', '10deg')
    modelViewer.setAttribute('interaction-policy', 'allow-when-focused')

    // Camera settings - стандартные настройки для всех моделей
    // Используем константы для единообразия стартовой позиции
    modelViewer.setAttribute('camera-orbit', DEFAULT_CAMERA_ORBIT)
    modelViewer.setAttribute('camera-target', DEFAULT_CAMERA_TARGET)
    modelViewer.setAttribute('field-of-view', DEFAULT_FIELD_OF_VIEW)

    // Enable zoom with distance limits
    modelViewer.setAttribute('min-camera-orbit', MIN_CAMERA_ORBIT)
    modelViewer.setAttribute('max-camera-orbit', MAX_CAMERA_ORBIT)

    // Сохранить начальное положение камеры, чтобы оно не сбрасывалось
    // Enable zoom by NOT setting disable-zoom attribute (omitting it enables zoom)
    modelViewer.setAttribute('auto-rotate-delay', '0') // Задержка автоповорота

    // Set interaction prompt to encourage zoom usage
    modelViewer.setAttribute('interaction-prompt', 'none') // No auto prompt

    // Профессиональное трехточечное студийное освещение
    modelViewer.setAttribute('shadow-intensity', '0.6') // Средние тени для объема
    modelViewer.setAttribute('exposure', '1.4') // Яркое студийное освещение
    modelViewer.setAttribute('tone-mapping', 'commerce') // Оптимально для продуктов
    modelViewer.setAttribute('shadow-softness', '0.8') // Мягкие, но четкие тени

    // Environment lighting - студийное HDRI окружение
    modelViewer.setAttribute('environment-image', 'neutral')

    // Дополнительные настройки для студийного вида
    modelViewer.setAttribute('poster', '')
    modelViewer.setAttribute('seamless-poster', '')

    console.log('💡 Studio 3-point lighting configured')

    // Use panorama as skybox (встроенная поддержка model-viewer)
    // Priority: bg_webp → Material PANORAMA → panorama prop → legacy panorama
    let finalPanoramaUrl = panoramaUrl // Fallback to prop
    
    try {
      // Prefer WebP background (optimized)
      if (selectedDesign?.bg_webp || selectedDesign?.bgWebp) {
        finalPanoramaUrl = selectedDesign.bg_webp || selectedDesign.bgWebp
      }
      // Then try Material registry
      else if (selectedDesign?.materials && Array.isArray(selectedDesign.materials)) {
        const panoramaMaterial = findMaterialByFormat(selectedDesign.materials, MaterialFormat.PANORAMA)
        if (panoramaMaterial) {
          const panoramaUrlFromMaterial = getMaterialDisplayUrl(panoramaMaterial)
          if (panoramaUrlFromMaterial) {
            finalPanoramaUrl = panoramaUrlFromMaterial
          }
        }
      }
      // Legacy fallback
      else if (selectedDesign?.panorama) {
        finalPanoramaUrl = selectedDesign.panorama
      }
    } catch (err) {
      console.warn('Error getting panorama from materials:', err)
    }
    
    if (finalPanoramaUrl) {
      const skyboxPath = finalPanoramaUrl.startsWith('/') ? finalPanoramaUrl : `/${finalPanoramaUrl}`
      modelViewer.setAttribute('skybox-image', skyboxPath)
      modelViewer.setAttribute('skybox-height', '2m') // Высота skybox
      console.log('🎨 Setting skybox-image via MaterialHandler:', skyboxPath)
    } else {
      // Если нет панорамы, используем градиентный фон
      modelViewer.style.background = 'linear-gradient(to bottom, #e5e7eb 0%, #f9fafb 100%)'
    }

    // Model-specific orientation fixes can be added via model metadata in the future
    // No hardcoded model checks - all models are treated equally

    // Loading settings
    modelViewer.setAttribute('loading', 'auto')
    modelViewer.setAttribute('reveal', 'auto')

    // AR (optional) - отключено, чтобы убрать системную кнопку
    // modelViewer.setAttribute('ar', '')
    // modelViewer.setAttribute('ar-modes', 'webxr scene-viewer quick-look')

    // Set style - прозрачный фон для model-viewer
    modelViewer.style.width = '100%'
    modelViewer.style.height = '100%'
    modelViewer.style.background = 'transparent'
    modelViewer.style.display = 'block'
    modelViewer.style.position = 'relative'
    modelViewer.style.zIndex = '10'
    // Enable interaction
    modelViewer.style.pointerEvents = 'auto'
    // Allow vertical scroll and pinch zoom
    modelViewer.style.touchAction = 'pan-y pinch-zoom'

    console.log('🎨 Model viewer initialized')

    // Add poster (loading state)
    const poster = document.createElement('div')
    poster.setAttribute('slot', 'poster')
    poster.className =
      'absolute inset-0 flex items-center justify-center bg-gradient-to-b from-neutral-100 to-neutral-50'
    poster.innerHTML = `
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-neutral-400 mx-auto mb-4"></div>
        <p class="text-neutral-600">Loading 3D Model...</p>
      </div>
    `
    modelViewer.appendChild(poster)

      // Handle model load events
      handleLoad = (e) => {
      setIsModelLoaded(true)
      if (
        (Array.isArray(modelViewer?.model?.materials) && modelViewer.model.materials.length > 0) ||
        getInternalThreeScene(modelViewer)
      ) {
        setIsSceneGraphReady(true)
      }
      modelLoadErrorRef.current = false // Reset ref first
      setModelLoadError(false) // Reset error flag on successful load
      console.log('✅ 3D model loaded successfully:', fullModelPath)
    }

      handleModelLoad = (e) => {
      setIsModelLoaded(true)
      if (
        (Array.isArray(modelViewer?.model?.materials) && modelViewer.model.materials.length > 0) ||
        getInternalThreeScene(modelViewer)
      ) {
        setIsSceneGraphReady(true)
      }
      modelLoadErrorRef.current = false // Reset ref first
      setModelLoadError(false) // Reset error flag on successful load
      console.log('✅ Model-viewer model-loaded event')

      // DIAGNOSTIC: Check if model has materials and textures
      setTimeout(() => {
        if (modelViewer && modelViewer.model) {
          let meshCount = 0
          let materialCount = 0
          let textureCount = 0
          const materialDetails = []

          try {
            const scene =
              modelViewer.model.scene || modelViewer.model.scenes?.[0] || modelViewer.model

            if (scene && typeof scene.traverse === 'function') {
              scene.traverse(node => {
                const isMesh = node.isMesh || (node.type && node.type.includes('Mesh'))

                if (isMesh) {
                  meshCount++
                  if (node.material) {
                    const materials = Array.isArray(node.material) ? node.material : [node.material]
                    materials.forEach(mat => {
                      materialCount++
                      const hasTexture = !!mat.map
                      if (hasTexture) textureCount++

                      materialDetails.push({
                        type: mat.type || 'unknown',
                        name: mat.name || 'unnamed',
                        hasMap: hasTexture,
                        mapSrc: mat.map?.image?.src || mat.map?.source?.data?.uri || 'no texture',
                        metalness: mat.metalness,
                        roughness: mat.roughness,
                        color: mat.color
                          ? `rgb(${Math.round(mat.color.r * 255)}, ${Math.round(mat.color.g * 255)}, ${Math.round(mat.color.b * 255)})`
                          : 'no color',
                      })
                    })
                  }
                }
              })

              console.log('📊 Model diagnostics:', {
                meshes: meshCount,
                materials: materialCount,
                materialsWithTextures: textureCount,
                modelPath: fullModelPath,
              })

              if (materialDetails.length > 0) {
                console.log('🔍 Material details:', materialDetails)
              }

              if (textureCount === 0 && materialCount > 0) {
                console.warn(
                  '⚠️ WARNING: Model has materials but NO textures! This will cause gray mesh.'
                )
                console.warn('💡 Solution: Apply external texture via selectedDesign.texture')
                const expectedTexture = currentSelectedDesign?.texture || 
                                       currentSelectedDesign?.textures?.body || 
                                       currentSelectedDesign?.textures?.plastic || 
                                       currentSelectedDesign?.textures?.accents || 
                                       'not set yet'
                console.warn('💡 Expected texture path:', expectedTexture)
                console.warn(
                  '💡 Current selectedDesign:',
                  currentSelectedDesign
                    ? {
                        id: currentSelectedDesign.id,
                        name: currentSelectedDesign.name,
                        hasTexture: !!currentSelectedDesign.texture,
                        texturePath: currentSelectedDesign.texture,
                      }
                    : 'null'
                )
              } else if (textureCount > 0) {
                console.log(
                  '✅ Model has built-in textures:',
                  textureCount,
                  'materials have textures'
                )
              }
            }
          } catch (diagError) {
            console.warn('⚠️ Could not run diagnostics:', diagError)
          }
        }
      }, 1000)

      // Фиксируем стартовый ракурс камеры после полной загрузки модели
      // Используем стандартные настройки для всех моделей
      setTimeout(() => {
        if (modelViewer) {
          // Устанавливаем начальное положение камеры - стандартные значения
          modelViewer.setAttribute('camera-orbit', DEFAULT_CAMERA_ORBIT)
          modelViewer.setAttribute('camera-target', DEFAULT_CAMERA_TARGET)
          modelViewer.setAttribute('field-of-view', DEFAULT_FIELD_OF_VIEW)
          console.log('📷 Стартовый ракурс камеры установлен (стандарт для всех моделей):', {
            orbit: DEFAULT_CAMERA_ORBIT,
            target: DEFAULT_CAMERA_TARGET,
            fov: DEFAULT_FIELD_OF_VIEW,
          })

          // Автоматически выводим текущее положение камеры через 1 секунду после загрузки
          setTimeout(() => {
            try {
              const orbit = modelViewer.getCameraOrbit()
              const target = modelViewer.getCameraTarget()
              const fov = modelViewer.getFieldOfView()

              if (orbit && target && fov) {
                console.log('📷 ТЕКУЩЕЕ ПОЛОЖЕНИЕ КАМЕРЫ (после загрузки):')
                console.log('   Orbit:', `${orbit.theta}deg ${orbit.phi}deg ${orbit.radius}m`)
                console.log('   Target:', `${target.x}m ${target.y}m ${target.z}m`)
                console.log('   FOV:', `${fov}deg`)
                console.log('📋 Код для копирования:')
                console.log(
                  `   DEFAULT_CAMERA_ORBIT = '${orbit.theta}deg ${orbit.phi}deg ${orbit.radius}m'`
                )
                console.log(`   DEFAULT_CAMERA_TARGET = '${target.x}m ${target.y}m ${target.z}m'`)
                console.log(`   DEFAULT_FIELD_OF_VIEW = '${fov}deg'`)
              }
            } catch (err) {
              console.warn('⚠️ Не удалось получить положение камеры:', err)
            }
          }, 1000)
        }
      }, 200)
    }

      handleProgress = (e) => {
      const progress = e.detail?.totalProgress || 0
      if (progress === 1) {
        console.log('✅ Model loading progress: 100%')
        setIsModelLoaded(true)
      } else {
        console.log(`⏳ Model loading progress: ${(progress * 100).toFixed(0)}%`)
      }
    }

      handleSceneGraphReady = () => {
      setIsSceneGraphReady(true)
      console.log('✅ model-viewer scene-graph-ready event')
    }

      handleError = async (error) => {
      // Handle errors generically - no special cases for specific models
      
      // Extract error details - try multiple ways to get error message
      const errorDetail = error?.detail || error
      
      // Additional diagnostics: Check if file actually exists and is accessible
      try {
        const response = await fetch(fullModelPath, { method: 'HEAD' })
        if (!response.ok) {
          console.error(`❌ File not accessible: ${fullModelPath} (Status: ${response.status})`)
        } else {
          const contentType = response.headers.get('content-type')
          const contentLength = response.headers.get('content-length')
          console.warn(`⚠️ File exists but failed to decode:`, {
            path: fullModelPath,
            contentType: contentType || 'unknown',
            size: contentLength ? `${(parseInt(contentLength) / 1024 / 1024).toFixed(2)} MB` : 'unknown',
            status: response.status
          })
          if (contentType && !contentType.includes('model/gltf') && !contentType.includes('application/octet-stream') && !contentType.includes('binary')) {
            console.error(`❌ Wrong content-type: ${contentType}. Expected: model/gltf-binary or application/octet-stream`)
            console.warn(`💡 Tip: Server may need to be configured to serve .glb files with correct MIME type`)
          }
        }
      } catch (fetchError) {
        console.error('❌ Could not verify file:', fetchError)
      }
      
      // Try to extract error message from various sources
      let errorMessage = ''
      if (errorDetail?.message) {
        errorMessage = String(errorDetail.message)
      } else if (errorDetail?.error?.message) {
        errorMessage = String(errorDetail.error.message)
      } else if (errorDetail?.toString && typeof errorDetail.toString === 'function') {
        const str = errorDetail.toString()
        if (str !== '[object Object]') {
          errorMessage = str
        }
      } else if (typeof errorDetail === 'string') {
        errorMessage = errorDetail
      } else if (error?.message) {
        errorMessage = String(error.message)
      }
      
      // Try to get error from JSON if it's an object
      if (!errorMessage || errorMessage === '[object Object]') {
        try {
          const errorJson = JSON.stringify(errorDetail, null, 2)
          if (errorJson && errorJson !== '{}' && errorJson !== 'null') {
            errorMessage = `Error details: ${errorJson}`
          }
        } catch (e) {
          // Ignore JSON stringify errors
        }
      }
      
      // Check if error has actual content
      const hasErrorMessage = errorMessage && errorMessage !== 'Unknown error' && errorMessage !== '[object Object]'
      const hasErrorKeys = error && Object.keys(error).length > 0
      const hasErrorDetailKeys = errorDetail && Object.keys(errorDetail).length > 0 && 
                                 JSON.stringify(errorDetail) !== '{}'
      
      // Only process if we have real error information
      if (!hasErrorMessage && !hasErrorKeys && !hasErrorDetailKeys) {
        // Empty error object - likely a false positive, use debug level
        console.debug('⚠️ Model load event triggered (may be false positive):', fullModelPath)
        return // Don't set error state for false positives
      }
      
      // Check for specific error types
      const isRangeError = errorMessage.includes('Invalid typed array length') || 
                          errorMessage.includes('Float32Array') ||
                          errorMessage.includes('RangeError')
      const isGLTFError = errorMessage.includes('GLTF') || 
                          errorMessage.includes('glTF')
      const isNetworkError = errorMessage.includes('Failed to fetch') ||
                            errorMessage.includes('NetworkError') ||
                            errorMessage.includes('404') ||
                            errorMessage.includes('Not Found')
      const isDecodeError = errorMessage.includes('could not be decoded') ||
                           errorMessage.includes('InvalidStateError') ||
                           errorMessage.includes('source image') ||
                           (errorDetail?.type === 'loadfailure' && errorDetail?.sourceError)
      
      // Determine display message for UI
      let displayMessage = errorMessage || 'Unknown error occurred'
      if (isDecodeError) {
        displayMessage = 'GLB file decode error - file may be corrupted or invalid format'
      } else if (isRangeError) {
        displayMessage = 'GLB file error (possibly corrupted or too large)'
      } else if (isGLTFError) {
        displayMessage = 'GLTF parsing error - invalid file format'
      } else if (isNetworkError) {
        displayMessage = 'File not found or network error'
      }
      
      if (isDecodeError) {
        // Handle missing model files generically - no special cases
        
        console.error('❌ GLB file decode error (file may be corrupted):', fullModelPath)
        if (hasErrorMessage) {
          console.error('   Error:', errorMessage)
        }
        if (errorDetail?.sourceError) {
          console.error('   Source error:', errorDetail.sourceError)
        }
        
        // Additional diagnostics for decode errors
        ;(async () => {
          try {
            const response = await fetch(fullModelPath, { method: 'HEAD' })
            if (response.ok) {
              const contentType = response.headers.get('content-type')
              const contentLength = response.headers.get('content-length')
              console.warn('📊 File diagnostics:', {
                path: fullModelPath,
                contentType: contentType || 'unknown',
                size: contentLength ? `${(parseInt(contentLength) / 1024 / 1024).toFixed(2)} MB` : 'unknown',
                status: response.status
              })
              if (contentType && !contentType.includes('model/gltf') && !contentType.includes('application/octet-stream') && !contentType.includes('binary')) {
                console.error(`❌ Wrong content-type: ${contentType}`)
                console.warn(`💡 Expected: model/gltf-binary or application/octet-stream`)
                console.warn(`💡 Server may need to be configured to serve .glb files with correct MIME type`)
              }
              if (contentLength && parseInt(contentLength) > 30 * 1024 * 1024) {
                console.warn(`⚠️ Large file detected (${(parseInt(contentLength) / 1024 / 1024).toFixed(2)} MB) - may cause memory issues`)
              }
            }
          } catch (fetchError) {
            console.error('❌ Could not verify file:', fetchError)
          }
        })()
        
        console.warn('💡 Tip: GLB file may be corrupted or in unsupported format')
        console.warn('💡 Tip: Try re-exporting the GLB file from Blender or other 3D software')
        console.warn('💡 Tip: Ensure file is valid glTF 2.0 Binary format')
      } else if (isRangeError) {
        console.error('❌ GLB file error (possibly corrupted or too large):', fullModelPath)
        if (hasErrorMessage) {
          console.error('   Error:', errorMessage)
        }
        console.warn('💡 Tip: Check if GLB file is valid and not corrupted')
        console.warn('💡 Tip: Large files (>30MB) may cause memory issues')
      } else if (isGLTFError) {
        console.error('❌ GLTF parsing error:', fullModelPath)
        if (hasErrorMessage) {
          console.error('   Error:', errorMessage)
        }
        console.warn('💡 Tip: Check if GLB file is valid glTF 2.0 format')
      } else if (isNetworkError) {
        console.error('❌ Network error loading model:', fullModelPath)
        if (hasErrorMessage) {
          console.error('   Error:', errorMessage)
        }
        console.warn('💡 Tip: Check if file exists and is accessible')
      } else {
        // Only log if we have actual error information
        if (hasErrorMessage || hasErrorKeys) {
          console.error('❌ Error loading 3D model:', hasErrorMessage ? errorMessage : error)
          console.error('Model path:', fullModelPath)
          if (hasErrorDetailKeys) {
            console.error('Error details:', errorDetail)
          }
        }
      }
      
      // Only show tip if we have a real error
      if (hasErrorMessage || hasErrorKeys || hasErrorDetailKeys) {
        // Check if path is in uploads, suggest correct location
        const correctPath = fullModelPath.replace('/uploads/', '/public/uploads/')
        console.warn('💡 Tip: Check if file exists:', correctPath)
        if (fullModelPath.includes('/uploads/')) {
          console.warn('💡 Tip: Files in /uploads/ should be accessible from /public/uploads/')
        }
      }
      
      setIsModelLoaded(false)
      modelLoadErrorRef.current = true // Set ref first
      setModelLoadError(true) // Only for display
      
      // Don't try to apply texture if model failed to load
      // This prevents "Failed to apply texture after 5 attempts" errors

      // Show user-friendly error message
      if (container) {
        // Check if file might be too large or corrupted
        const isLargeFile = fullModelPath.includes('MODEL-') && fullModelPath.includes('.glb')
        const sizeWarning = isLargeFile ? '<p class="text-sm text-amber-600 mb-2">⚠️ Large model file detected. This may take longer to load.</p>' : ''
        
        // Determine correct file path for display
        const correctFilePath = fullModelPath.startsWith('/uploads/') 
          ? `/public${fullModelPath}` 
          : `/public${fullModelPath}`
        
        container.innerHTML = `
          <div class="flex flex-col items-center justify-center h-full bg-gradient-to-b from-neutral-100 to-neutral-50 p-8">
            <div class="text-center">
              <div class="text-6xl mb-4">⚠️</div>
              <h3 class="text-xl font-semibold text-neutral-900 mb-2">Failed to load 3D model</h3>
              <p class="text-neutral-600 mb-4">Model file: ${fullModelPath}</p>
              ${sizeWarning}
              <p class="text-sm text-neutral-500 mb-2">Error: ${displayMessage}</p>
              <p class="text-sm text-neutral-500 mb-2">Please check:</p>
              <ul class="text-sm text-neutral-500 text-left list-disc list-inside">
                <li>File exists: ${correctFilePath}</li>
                <li>File is a valid GLB format</li>
                <li>File size is reasonable (&lt;30MB recommended)</li>
                <li>Browser console for detailed error</li>
              </ul>
            </div>
          </div>
        `
      }
    }

    // Add event listeners
    modelViewer.addEventListener('load', handleLoad)
    modelViewer.addEventListener('model-loaded', handleModelLoad)
    modelViewer.addEventListener('scene-graph-ready', handleSceneGraphReady)
    modelViewer.addEventListener('progress', handleProgress)
    modelViewer.addEventListener('error', handleError)

    // Append to container immediately
    container.appendChild(modelViewer)
    modelViewerRef.current = modelViewer

      // Verify src was set correctly
      setTimeout(() => {
        if (modelViewer && modelViewer.src !== finalModelPath) {
          console.warn('⚠️ Model path mismatch, correcting...')
          modelViewer.src = finalModelPath
        }
      }, 100)

      } catch (error) {
        console.error('❌ Error in model-viewer setup:', error)
        modelLoadErrorRef.current = true // Set ref first
        setModelLoadError(true) // Only for display
      }
    })() // Close async IIFE
    
    // Cleanup function (outside async IIFE)
    return () => {
      try {
        const currentContainer = containerRef.current
        if (currentContainer) {
          const currentModelViewer = currentContainer.querySelector('model-viewer')
          if (currentModelViewer) {
            currentModelViewer.removeEventListener('load', handleLoad)
            currentModelViewer.removeEventListener('model-loaded', handleModelLoad)
            currentModelViewer.removeEventListener('scene-graph-ready', handleSceneGraphReady)
            currentModelViewer.removeEventListener('progress', handleProgress)
            currentModelViewer.removeEventListener('error', handleError)
            // Remove from DOM (event listeners will be cleaned up automatically)
            if (currentContainer.contains(currentModelViewer)) {
              currentContainer.removeChild(currentModelViewer)
            }
          }
        }
      } catch (cleanupError) {
        // Ignore cleanup errors
        console.debug('Cleanup error (non-critical):', cleanupError)
      }
    }
  }, [isMounted, scriptLoaded, modelPath, environmentImage, panoramaUrl, selectedDesign?.id, selectedDesign?.slug])

  // Reset model load error when model path changes
  useEffect(() => {
    modelLoadErrorRef.current = false // Reset ref first
    setModelLoadError(false)
    setIsModelLoaded(false)
    setIsSceneGraphReady(false)
    textureRetryCountRef.current = 0 // Reset retry counter when model changes
    textureApplicationStoppedRef.current = false // Reset stop flag when model changes
  }, [modelPath])

  // Hook 4: Apply design texture/variant when it changes
  const applyTextureDidRun = useRef(null)
  useEffect(() => {
    // Предохранитель от повторов
    const designKey = `${selectedDesign?.id}-${selectedDesign?.slug}-${selectedDesign?.texture || selectedDesign?.textureUrl || ''}-${isModelLoaded}-${isSceneGraphReady}`
    if (applyTextureDidRun.current === designKey) return
    applyTextureDidRun.current = designKey
    
    // Обертка в async IIFE для использования await
    ;(async () => {
    
    console.log('🔍 [3D DEBUG] useEffect triggered:', {
      hasContainer: !!containerRef.current,
      hasDesign: !!selectedDesign,
      isModelLoaded,
      isSceneGraphReady,
      selectedDesignId: selectedDesign?.id,
      selectedDesignName: selectedDesign?.name,
      modelPath,
    })
    
    // Get model-viewer element from container
    if (!containerRef.current || !selectedDesign || !isModelLoaded || !isSceneGraphReady || modelLoadErrorRef.current || textureApplicationStoppedRef.current) {
      if (textureApplicationStoppedRef.current) {
        // Silently skip if already stopped
        return
      }
      if (modelLoadErrorRef.current) {
        console.warn('⚠️ Model failed to load, skipping texture application')
        console.warn('💡 To fix this issue:')
        console.warn('   1. Check if GLB file exists and is accessible:', modelPath)
        console.warn('   2. Verify file is valid GLB format (not corrupted)')
        console.warn('   3. Check browser console for detailed error messages')
        console.warn('   4. Ensure file size is reasonable (<30MB recommended)')
        console.warn('   5. Check server MIME type configuration for .glb files')
      } else {
        console.log('⏳ Waiting for conditions:', {
          hasContainer: !!containerRef.current,
          hasDesign: !!selectedDesign,
          isModelLoaded,
          isSceneGraphReady,
          modelLoadError: modelLoadErrorRef.current,
          stopped: textureApplicationStoppedRef.current,
        })
      }
      return
    }
    
    // Find model-viewer element in container
    const container = containerRef.current
    if (!container) {
      console.warn('⚠️ Container not found')
      return
    }
    
    const modelViewer = container.querySelector('model-viewer')
    if (!modelViewer) {
      console.warn('⚠️ model-viewer element not found in container')
      return
    }
    
    // Check model-viewer element for error state
    if (modelViewer.hasAttribute('error') || !modelViewer.src) {
      console.warn('⚠️ Model-viewer has error or no source, skipping texture application')
      modelLoadErrorRef.current = true
      setModelLoadError(true) // Only for display, ref prevents loop
      return
    }

    // Method 1: Apply material variant if specified
    if (selectedDesign?.variant) {
      try {
        modelViewer.setAttribute('variant-name', selectedDesign.variant)
        console.log('✅ Applied variant:', selectedDesign.variant)
      } catch (error) {
        console.warn('Failed to apply variant:', error)
      }
    } else {
      try {
        if ('variantName' in modelViewer) {
          modelViewer.variantName = null
        }
        modelViewer.removeAttribute('variant-name')
      } catch (error) {
        console.warn('Failed to reset variant:', error)
      }
    }
    
    // Early return if no selectedDesign
    if (!selectedDesign) {
      console.warn('⚠️ No selectedDesign provided')
      return
    }
    
    let textureMaterial = null
    
    try {
      // 1. Приоритетный поиск текстуры
      if (selectedDesign.materials && Array.isArray(selectedDesign.materials)) {
        textureMaterial = findMaterialByFormat(selectedDesign.materials, MaterialFormat.TEXTURE)
      }
      
      if (!textureMaterial) {
        const webpTextureUrl = selectedDesign.texture_webp || selectedDesign.textureWebp
        if (webpTextureUrl) {
          textureMaterial = {
            format: MaterialFormat.TEXTURE,
            url: webpTextureUrl,
            metadata: {},
          }
        }
      }
      
      if (!textureMaterial) {
        const legacyTextureUrl = selectedDesign.textureUrl || 
                                 selectedDesign.texture || 
                                 selectedDesign.textures?.body || 
                                 selectedDesign.textures?.plastic || 
                                 selectedDesign.textures?.accents
        
        if (legacyTextureUrl) {
          textureMaterial = {
            format: MaterialFormat.TEXTURE,
            url: legacyTextureUrl,
            metadata: {},
          }
        }
      }
      
      if (!textureMaterial) {
        console.warn('No texture material found for design:', selectedDesign.id)
        return
      }
    } catch (err) {
      console.error('Error finding texture material:', err)
      return
    }
    
    // Log which textures will be used (for debugging)
    console.log('🔍 [3D DEBUG] Selected design:', {
      id: selectedDesign?.id,
      name: selectedDesign?.name,
      hasMaterials: !!(selectedDesign?.materials && Array.isArray(selectedDesign.materials) && selectedDesign.materials.length > 0),
      textureMaterial: textureMaterial ? getMaterialDisplayUrl(textureMaterial) : null,
      hasVariant: !!selectedDesign?.variant,
    })
    
    if (!textureMaterial && !selectedDesign?.variant) {
      console.warn('⚠️ No texture material or variant found in selectedDesign. Skipping texture application.')
      return
    }
    
    // Check if model is actually loaded before trying to apply texture
    if (!isModelLoaded) {
      console.warn('⚠️ Model not loaded yet, skipping texture application. Will retry when model loads.')
      return
    }
    
    if (textureMaterial && !selectedDesign?.variant) {
      try {
        const textureUrl = getMaterialDisplayUrl(textureMaterial)
        if (!textureUrl) {
          console.warn('⚠️ No texture URL found in texture material')
          return
        }
        console.log('🎨 Attempting to apply texture (legacy):', textureUrl)
        console.log('🔍 [3D DEBUG] Full texture path:', window.location.origin + textureUrl)
        if (selectedDesign.textures) {
          console.log('🎨 Using textures format (one texture for all materials):', selectedDesign.textures)
        }

        const texturePath = textureUrl.startsWith('/') ? textureUrl : `/${textureUrl}`
        const resolvedTexturePath =
          typeof window !== 'undefined'
            ? new URL(texturePath, window.location.origin).toString()
            : texturePath
        const modelReady = await waitForModelViewerLoad(modelViewer)

        if (modelReady) {
          try {
            const appliedWithMaterialsApi = await applyTextureViaModelViewerMaterialsApi(
              modelViewer,
              resolvedTexturePath
            )
            if (appliedWithMaterialsApi) {
              return
            }
          } catch (materialsApiError) {
            console.warn('⚠️ Materials API texture apply failed, falling back to legacy scene traversal:', materialsApiError)
          }

          try {
            const compatibleThree = getCompatibleThree(modelViewer)
            if (compatibleThree && !window.THREE) {
              window.THREE = compatibleThree
            }
            const directScene = getInternalThreeScene(modelViewer)

            const appliedViaThreeScene = await applyTextureViaThreeScene(
              directScene,
              resolvedTexturePath,
              compatibleThree
            )

            if (appliedViaThreeScene) {
              if (typeof modelViewer.requestUpdate === 'function') {
                modelViewer.requestUpdate()
              }
              return
            }
          } catch (threeSceneError) {
            console.warn('⚠️ Direct Three.js texture apply failed, falling back to legacy logic:', threeSceneError)
          }
        }
        
        // Reset retry count when starting new texture application
        textureRetryCountRef.current = 0
        textureApplicationStoppedRef.current = false // Reset stop flag
        const MAX_RETRIES = 10
        
        // Wait for model to be fully loaded before accessing scene
        const applyTexture = () => {
            // Early exit if texture application was stopped
            if (textureApplicationStoppedRef.current) {
              return
            }
            
            // Early exit if model failed to load
            if (modelLoadErrorRef.current) {
              console.warn('⚠️ Model failed to load, stopping texture application')
              textureApplicationStoppedRef.current = true
              return
            }
            
            // Re-get model-viewer element (it might have changed)
            const currentContainer = containerRef.current
            if (!currentContainer) {
              console.warn('⚠️ Container not available in applyTexture')
              return
            }

            const currentModelViewer = currentContainer.querySelector('model-viewer')
            if (!currentModelViewer) {
              console.warn('⚠️ model-viewer not found in applyTexture')
              return
            }
            
            // Check if model has error attribute
            if (currentModelViewer.hasAttribute('error')) {
              console.warn('⚠️ Model has error attribute, stopping texture application')
              modelLoadErrorRef.current = true // Set ref first
              setModelLoadError(true) // Only for display
              return
            }

            console.log('🔄 applyTexture called, modelViewer.loaded:', currentModelViewer.loaded)

            // Access the model's scene via model-viewer's internal API
            // Try multiple ways to access the scene
            let scene = null

            /**
             * КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Получение сцены из GLTF объекта
             *
             * ПРИЧИНА ПРОПАДАНИЯ ТЕКСТУР:
             * 1. modelViewer.model - это GLTF объект, а не сцена Three.js
             * 2. Попытка вызвать scene.traverse() на GLTF объекте вызывала ошибку "traverse is not a function"
             * 3. Из-за ошибки текстуры не применялись к материалам
             *
             * РЕШЕНИЕ:
             * - Правильно получаем сцену через modelViewer.model.scene или modelViewer.model.scenes[0]
             * - Проверяем наличие метода traverse перед использованием
             * - Добавлена диагностика структуры GLTF объекта для отладки
             *
             * ДОПОЛНИТЕЛЬНО:
             * - Окружной свет (environment-image="neutral") настроен в model-viewer
             * - Skybox-image используется для визуального окружения
             * - Для PBR материалов важно наличие environment map для правильного отображения
             */
            // Method 1: Try direct scene property (most reliable for model-viewer)
            if (currentModelViewer.scene && typeof currentModelViewer.scene.traverse === 'function') {
              scene = currentModelViewer.scene
              console.log('✅ Got scene from modelViewer.scene')
            }
            // Method 2: Try to get from renderer
            else if (currentModelViewer.renderer) {
              // Try renderer.scene first
              if (
                currentModelViewer.renderer.scene &&
                typeof currentModelViewer.renderer.scene.traverse === 'function'
              ) {
                scene = currentModelViewer.renderer.scene
                console.log('✅ Got scene from renderer.scene')
              }
              // Try renderer.getScene() if available
              else if (typeof currentModelViewer.renderer.getScene === 'function') {
                try {
                  scene = currentModelViewer.renderer.getScene()
                  if (scene && typeof scene.traverse === 'function') {
                    console.log('✅ Got scene from renderer.getScene()')
                  } else {
                    scene = null
                  }
                } catch (e) {
                console.warn('⚠️ renderer.getScene() failed:', e)
              }
            }
          }
          // Method 3: Try to get scene from model-viewer's model property
          else if (currentModelViewer.model) {
            console.log('📦 modelViewer.model found:', typeof currentModelViewer.model)
            console.log('🔍 [3D DEBUG] modelViewer.model keys:', Object.keys(currentModelViewer.model))
            console.log('🔍 [3D DEBUG] modelViewer.model.scene:', currentModelViewer.model.scene)
            console.log('🔍 [3D DEBUG] modelViewer.model.scenes:', currentModelViewer.model.scenes)

            // Try to access scene property (may be non-enumerable)
            try {
              if (
                currentModelViewer.model.scene &&
                typeof currentModelViewer.model.scene.traverse === 'function'
              ) {
                scene = currentModelViewer.model.scene
                console.log('✅ Got scene from modelViewer.model.scene')
              }
              // Check if it's a GLTF object with scenes array
              else if (
                currentModelViewer.model.scenes &&
                Array.isArray(currentModelViewer.model.scenes) &&
                currentModelViewer.model.scenes[0]
              ) {
                const firstScene = currentModelViewer.model.scenes[0]
                if (typeof firstScene.traverse === 'function') {
                  scene = firstScene
                  console.log('✅ Got scene from modelViewer.model.scenes[0]')
                }
              }
              // Check if model itself is a scene (has traverse method)
              else if (typeof currentModelViewer.model.traverse === 'function') {
                scene = currentModelViewer.model
                console.log('✅ Using modelViewer.model as scene (has traverse method)')
              }
            } catch (e) {
              console.warn('⚠️ Error accessing model.scene:', e)
            }
          }
          // Method 4: Try to access via shadow DOM
          else if (currentModelViewer.shadowRoot) {
            const canvas = currentModelViewer.shadowRoot.querySelector('canvas')
            if (canvas && canvas.__threeScene) {
              scene = canvas.__threeScene
              console.log('✅ Got scene from shadowRoot canvas')
            }
          }
          
          // Method 5: Try to access via renderer's scene property directly
          if (!scene && currentModelViewer.renderer) {
            try {
              // Try renderer.scene
              if (currentModelViewer.renderer.scene && typeof currentModelViewer.renderer.scene.traverse === 'function') {
                scene = currentModelViewer.renderer.scene
                console.log('✅ Got scene from renderer.scene (direct)')
              }
              // Try renderer.getScene() method
              else if (typeof currentModelViewer.renderer.getScene === 'function') {
                const rendererScene = currentModelViewer.renderer.getScene()
                if (rendererScene && typeof rendererScene.traverse === 'function') {
                  scene = rendererScene
                  console.log('✅ Got scene from renderer.getScene()')
                }
              }
            } catch (e) {
              console.warn('⚠️ Error accessing renderer scene:', e)
            }
          }
          
          // Method 6: Try additional synchronous access methods
          if (!scene && currentModelViewer.loaded) {
            // Try multiple synchronous access patterns
            const sceneAccessMethods = [
              () => currentModelViewer.model?.scene,
              () => currentModelViewer.model?.scenes?.[0],
              () => currentModelViewer.scene,
              () => currentModelViewer.renderer?.scene,
              () => {
                try {
                  return typeof currentModelViewer.renderer?.getScene === 'function' 
                    ? currentModelViewer.renderer.getScene() 
                    : null
                } catch {
                  return null
                }
              },
            ]
            
            for (const getScene of sceneAccessMethods) {
              try {
                const potentialScene = getScene()
                if (potentialScene && typeof potentialScene.traverse === 'function') {
                  scene = potentialScene
                  console.log('✅ Got scene via additional access method')
                  break
                }
              } catch (e) {
                // Continue to next method
              }
            }
          }

            // 2. Получение сцены из model-viewer (упрощенная версия)
            // Если scene еще не получена, попробуем упрощенный способ
            if (!scene && currentModelViewer.model) {
              // Упрощенный способ получения сцены
              scene = currentModelViewer.model.scene || currentModelViewer.model.scenes?.[0]
              if (scene && typeof scene.traverse === 'function') {
                console.log('✅ Got scene using simplified method')
              } else {
                scene = null
              }
            }
            
            // Если сцена все еще не найдена, используем старую логику с retry
            if (!scene) {
              // Check if already stopped
              if (textureApplicationStoppedRef.current) {
                return
              }
              
              textureRetryCountRef.current++
              
              // Stop retrying after max attempts
              if (textureRetryCountRef.current > MAX_RETRIES) {
                console.warn('⚠️ Could not access scene after', MAX_RETRIES, 'attempts')
                console.warn('💡 This may be normal for some models. Texture will be applied when scene becomes available.')
                console.warn('💡 If texture does not appear, the model may need material variants in the GLB file.')
                // Don't stop completely - allow retry on model-loaded event
                textureApplicationStoppedRef.current = false // Allow retry
                textureRetryCountRef.current = 0 // Reset for next attempt
                // Set up listener for when scene becomes available
                if (currentModelViewer && !currentModelViewer.hasAttribute('error')) {
                  const onSceneAvailable = () => {
                    setTimeout(() => {
                      if (!textureApplicationStoppedRef.current && !modelLoadError) {
                        console.log('🔄 Retrying texture application after scene became available...')
                        textureRetryCountRef.current = 0
                        applyTexture()
                      }
                    }, 500)
                    currentModelViewer.removeEventListener('model-loaded', onSceneAvailable)
                  }
                  currentModelViewer.addEventListener('model-loaded', onSceneAvailable)
                }
                return
              }
              
              // Enhanced diagnostics (only log on first attempt and last attempt)
              if (textureRetryCountRef.current === 1 || textureRetryCountRef.current === MAX_RETRIES) {
                const diagnostics = {
                  attempt: textureRetryCountRef.current,
                  hasModel: !!currentModelViewer.model,
                  modelType: currentModelViewer.model?.constructor?.name || 'unknown',
                  hasModelScene: !!currentModelViewer.model?.scene,
                  hasModelScenes: !!currentModelViewer.model?.scenes,
                  modelScenesLength: currentModelViewer.model?.scenes?.length || 0,
                  hasDirectScene: !!currentModelViewer.scene,
                  hasRenderer: !!currentModelViewer.renderer,
                  loaded: currentModelViewer.loaded,
                  modelKeys: currentModelViewer.model ? Object.keys(currentModelViewer.model).slice(0, 20) : [],
                  // Try to inspect model structure more deeply
                  modelValue: currentModelViewer.model ? JSON.stringify(Object.keys(currentModelViewer.model).reduce((acc, key) => {
                    try {
                      const val = currentModelViewer.model[key]
                      acc[key] = typeof val === 'object' ? (val?.constructor?.name || 'object') : typeof val
                    } catch (e) {
                      acc[key] = 'error'
                    }
                    return acc
                  }, {})).slice(0, 500) : 'no model',
                }
                
                console.warn(`⚠️ Scene not available (attempt ${textureRetryCountRef.current}/${MAX_RETRIES}), diagnostics:`, diagnostics)
              }
              
              // Wait for model-loaded event if not loaded yet
              if (!currentModelViewer.loaded) {
                console.log('⏳ Waiting for model to load...')
                const onModelLoaded = () => {
                  // Check if stopped before retrying
                  if (textureApplicationStoppedRef.current) {
                    return
                  }
                  
                  // Check again before retrying
                  if (modelLoadError || currentModelViewer.hasAttribute('error')) {
                    console.warn('⚠️ Model error detected, canceling texture application')
                    textureApplicationStoppedRef.current = true
                    return
                  }
                  console.log('✅ Model loaded event fired, retrying...')
                  setTimeout(() => {
                    if (!modelLoadError && !textureApplicationStoppedRef.current) {
                      applyTexture()
                    }
                  }, 300)
                  currentModelViewer.removeEventListener('model-loaded', onModelLoaded)
                }
                currentModelViewer.addEventListener('model-loaded', onModelLoaded)
                return
              }
              
              // If loaded but scene still not found, wait a bit more for internal initialization
              // Use exponential backoff: 500ms, 1000ms, 1500ms, etc.
              const delay = Math.min(500 * textureRetryCountRef.current, 3000)
              console.log(`⏳ Model is loaded but scene not ready (attempt ${textureRetryCountRef.current}), waiting ${delay}ms...`)
              setTimeout(() => {
                // Check if stopped or error occurred during wait
                if (textureApplicationStoppedRef.current || modelLoadError) {
                  if (modelLoadError) {
                    console.warn('⚠️ Model error detected during wait, canceling texture application')
                  }
                  return
                }
                
                const retryContainer = containerRef.current
                if (retryContainer) {
                  const retryModelViewer = retryContainer.querySelector('model-viewer')
                  if (retryModelViewer && retryModelViewer.loaded && !retryModelViewer.hasAttribute('error')) {
                    // Double check before retrying
                    if (!textureApplicationStoppedRef.current) {
                      console.log(`🔄 Retrying texture application (attempt ${textureRetryCountRef.current + 1})...`)
                      applyTexture()
                    }
                  } else if (retryModelViewer && retryModelViewer.hasAttribute('error')) {
                    console.warn('⚠️ Model has error attribute, stopping texture application')
                    modelLoadErrorRef.current = true // Set ref first
                    setModelLoadError(true) // Only for display
                    textureApplicationStoppedRef.current = true
                  }
                }
              }, delay)
              return
            }
            
            // Reset retry count on success
            textureRetryCountRef.current = 0

          // Get Three.js from model-viewer's internal context
          // model-viewer uses its own Three.js instance, need to access it correctly
          let THREE = null

          if (typeof window !== 'undefined') {
            // Method 1: Try to get from model-viewer's renderer (most reliable)
            if (currentModelViewer.renderer) {
              // Try renderer.three first
              if (currentModelViewer.renderer.three) {
                THREE = currentModelViewer.renderer.three
                console.log('✅ Got THREE from renderer.three')
              }
              // Try renderer.Three (capital T)
              else if (currentModelViewer.renderer.Three) {
                THREE = currentModelViewer.renderer.Three
                console.log('✅ Got THREE from renderer.Three')
              }
              // Try to get from renderer's context
              else if (currentModelViewer.renderer.getContext) {
                const gl = currentModelViewer.renderer.getContext()
                if (gl && gl.getParameter) {
                  // Try to find THREE from WebGL context
                  const debugInfo = gl.getExtension('WEBGL_debug_renderer_info')
                  if (debugInfo) {
                    console.log('🔍 Found WebGL context')
                  }
                }
              }
            }

            // Method 2: Try to get from model-viewer's Three property
            if (!THREE && currentModelViewer.Three) {
              THREE = currentModelViewer.Three
              console.log('✅ Got THREE from modelViewer.Three')
            }

            // Method 3: Try to get from global window (if loaded separately)
            if (!THREE && window.THREE) {
              THREE = window.THREE
              console.log('✅ Got THREE from window.THREE')
            }

            // Method 4: Try to infer from scene constructor (with safety checks)
            if (!THREE && scene && scene.constructor && typeof scene.constructor === 'function') {
              try {
                const SceneClass = scene.constructor
                console.log('🔍 Scene constructor:', SceneClass?.name || 'unknown')
                // Try to get THREE from the scene's parent namespace
                if (SceneClass?.name === 'Scene') {
                  // THREE.Scene -> THREE namespace
                  const parent =
                    SceneClass.constructor && typeof SceneClass.constructor === 'function'
                      ? SceneClass.constructor
                      : SceneClass
                  if (parent && typeof parent.TextureLoader === 'function') {
                    THREE = parent
                    console.log('✅ Got THREE from scene constructor parent')
                  }
                }
              } catch (e) {
                console.warn('⚠️ Error accessing scene constructor:', e)
              }
            }

            // Method 5: Try to get from model-viewer's internal API (with safety checks)
            if (
              !THREE &&
              currentModelViewer.model &&
              currentModelViewer.model.constructor &&
              typeof currentModelViewer.model.constructor === 'function'
            ) {
              try {
                const ModelClass = currentModelViewer.model.constructor
                if (
                  ModelClass &&
                  ModelClass.constructor &&
                  typeof ModelClass.constructor === 'function' &&
                  typeof ModelClass.constructor.TextureLoader === 'function'
                ) {
                  THREE = ModelClass.constructor
                  console.log('✅ Got THREE from model constructor')
                }
              } catch (e) {
                console.warn('⚠️ Error accessing model constructor:', e)
              }
            }

            // Method 6: Try to get from scene's materials (if they exist) - with safety checks
            if (!THREE && scene && typeof scene.traverse === 'function') {
              try {
                scene.traverse(node => {
                  if (
                    !THREE &&
                    node &&
                    (node.isMesh || (node.type && node.type.includes('Mesh'))) &&
                    node.material
                  ) {
                    try {
                      const MaterialClass = node.material.constructor
                      if (
                        MaterialClass &&
                        MaterialClass.constructor &&
                        typeof MaterialClass.constructor === 'function' &&
                        typeof MaterialClass.constructor.TextureLoader === 'function'
                      ) {
                        THREE = MaterialClass.constructor
                        console.log('✅ Got THREE from material constructor')
                        return // Stop traversing once found
                      }
                    } catch (e) {
                      // Skip this material
                    }
                  }
                })
              } catch (e) {
                console.warn('⚠️ Error traversing scene:', e)
              }
            }
          }

          if (!THREE || !THREE.TextureLoader) {
            console.warn('⚠️ Three.js not available for texture swapping', {
              hasModelViewerThree: !!currentModelViewer.Three,
              hasWindowThree: !!window.THREE,
              sceneType: scene ? scene.constructor?.name : 'no scene',
              hasScene: !!scene,
            })
            // Try to load Three.js dynamically if not available
            if (typeof window !== 'undefined' && !window.THREE) {
              console.log('💡 Attempting to load Three.js...')
              const script = document.createElement('script')
              script.src = 'https://cdn.jsdelivr.net/npm/three@0.158.0/build/three.min.js'
              script.onload = () => {
                console.log('✅ Three.js loaded, retrying texture application...')
                window.THREE = window.THREE || window.THREE
                setTimeout(applyTexture, 100)
              }
              script.onerror = () => {
                console.error('❌ Failed to load Three.js from CDN')
              }
              document.head.appendChild(script)
            } else {
              // If window.THREE exists but we couldn't access it, try again
              console.log('💡 Retrying with window.THREE...')
              setTimeout(() => {
                if (window.THREE) {
                  THREE = window.THREE
                  applyTexture()
                }
              }, 200)
            }
            return
          }

          console.log('✅ Three.js found:', {
            hasTextureLoader: !!THREE.TextureLoader,
            version: THREE.REVISION || 'unknown',
          })

          const textureLoader = new THREE.TextureLoader()
          
          // Set crossOrigin for texture loading to prevent CORS issues
          textureLoader.setCrossOrigin('anonymous')

          // Use MaterialHandler to get texture URL (no format conditionals)
          if (!textureMaterial) {
            console.warn('⚠️ No texture material found')
            return
          }
          
          const textureSource = getMaterialDisplayUrl(textureMaterial)
          
          if (!textureSource) {
            console.warn('⚠️ No texture URL found in texture material:', textureMaterial)
            return
          }
          
          console.log('🖼️ Loading texture via MaterialHandler:', textureSource)

          // Ensure texture path is absolute
          const texturePath = textureSource.startsWith('/')
            ? textureSource
            : `/${textureSource}`

          console.log('🖼️ Loading texture from:', texturePath)

          // 3. Загрузка текстуры
          textureLoader.load(
              texturePath,
              
              // Success callback
              texture => {
                // Настройка текстуры
                texture.flipY = false
                texture.colorSpace = THREE.SRGBColorSpace // Обновленный API
                texture.wrapS = THREE.RepeatWrapping // Опционально
                texture.wrapT = THREE.RepeatWrapping
                texture.needsUpdate = true
                
                let textureAppliedCount = 0
                
                // Обход сцены и применение текстуры
                if (!scene || typeof scene.traverse !== 'function') {
                  console.error('❌ Scene not available or traverse method not found')
                  return
                }
                
                scene.traverse(node => {
                  const isMesh = node.isMesh || node.type?.includes('Mesh')
                  
                  if (isMesh && node.material) {
                    const materials = Array.isArray(node.material) ? node.material : [node.material]
                    
                    materials.forEach(material => {
                      // Проверка что материал поддерживает текстуры
                      if ('map' in material) {
                        material.map = texture
                        material.needsUpdate = true
                        textureAppliedCount++
                        
                        // Обновление UV координат
                        if (node.geometry?.attributes?.uv) {
                          node.geometry.attributes.uv.needsUpdate = true
                        } else {
                          console.warn(`Mesh "${node.name}" missing UV coordinates`)
                        }
                      }
                    })
                  }
                })
                
                console.log(`✅ Texture applied to ${textureAppliedCount} materials`)
                
                // Принудительный рендер
                if (currentModelViewer && typeof currentModelViewer.updateComplete !== 'undefined') {
                  currentModelViewer.updateComplete.then(() => {
                    if (typeof currentModelViewer.requestUpdate === 'function') {
                      currentModelViewer.requestUpdate()
                    }
                  })
                }
              },
              
              // Progress callback (опционально)
              undefined,
              
              // Error callback
              error => {
                console.error('Failed to load texture:', texturePath, error)
                // Показать пользователю сообщение об ошибке
                console.warn(`⚠️ Could not load texture: ${texturePath}`)
              }
            )
          } // Close applyTexture function
          
          // Call applyTexture to start texture application
          applyTexture()
        } catch (err) {
          console.error('❌ Error in texture application:', err)
        }
      } // Close if (textureMaterial && !selectedDesign?.variant)
    })() // Close async IIFE
  }, [selectedDesign?.id, selectedDesign?.slug, selectedDesign?.texture, selectedDesign?.textureUrl, isModelLoaded, isSceneGraphReady]) // Removed modelLoadError to prevent loop

  // Show loading state until mounted or script loaded
  const shouldShowLoading = typeof window === 'undefined' || !isMounted || !scriptLoaded

  if (shouldShowLoading) {
    return (
      <div
        className={`relative w-full h-full ${className} flex items-center justify-center bg-gradient-to-b from-neutral-100 to-neutral-50`}
        suppressHydrationWarning
        data-loading="true"
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neutral-400 mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading 3D Viewer...</p>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`relative w-full h-full ${className}`}
      suppressHydrationWarning
      data-client-only="true"
      style={{ position: 'relative', overflow: 'hidden' }}
    >
      {/* Градиентный фон для всех моделей */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          background: 'linear-gradient(180deg, #f0f2f5 0%, #e8eaed 100%)',
        }}
      />

      {/* 3D Model Viewer */}
      <div
        ref={containerRef}
        className="absolute inset-0 w-full h-full"
        style={{
          background: 'transparent',
          zIndex: 3, // Уменьшено, чтобы заглушка была видна
          position: 'relative',
        }}
      />
    </div>
  )
}
