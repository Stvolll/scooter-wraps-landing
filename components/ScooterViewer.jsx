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
import dynamic from 'next/dynamic'

// Dynamically import PanoramaBackground (client-side only)
const PanoramaBackground = dynamic(() => import('./PanoramaBackground'), {
  ssr: false,
})

// Создаем глобальную функцию для получения положения камеры (доступна всегда)
if (typeof window !== 'undefined') {
  window.getCamera = () => {
    // Ищем все model-viewer элементы
    const viewers = document.querySelectorAll('model-viewer')
    
    if (viewers.length === 0) {
      console.error('❌ model-viewer не найден. Убедитесь, что модель загружена.')
      return null
    }
    
    if (viewers.length > 1) {
      console.log(`ℹ️ Найдено ${viewers.length} model-viewer элементов. Используем первый активный.`)
    }
    
    // Берем первый загруженный viewer
    let viewer = null
    for (let v of viewers) {
      if (v.loaded) {
        viewer = v
        break
      }
    }
    
    // Если ни один не загружен, берем первый
    if (!viewer) {
      viewer = viewers[0]
      console.log('⚠️ Модель еще не загружена, но попробуем получить данные...')
    }
    
    try {
      const orbit = viewer.getCameraOrbit()
      const target = viewer.getCameraTarget()
      const fov = viewer.getFieldOfView()
      
      if (!orbit || !target || fov === undefined) {
        console.warn('⚠️ Не удалось получить данные камеры. Подождите, пока модель полностью загрузится.')
        console.log('💡 Попробуйте через несколько секунд: window.getCamera()')
        return null
      }
      
      // Получаем путь к модели для информации
      const modelPath = viewer.src || 'неизвестно'
      const modelName = modelPath.includes('yamaha-nvx') ? 'Yamaha NVX' : 
                       modelPath.includes('honda-lead') ? 'Honda Lead' :
                       modelPath.includes('honda-vision') ? 'Honda Vision' :
                       modelPath.includes('honda-sh') ? 'Honda SH' :
                       modelPath.includes('honda-pcx') ? 'Honda PCX' : 'Unknown'
      
      console.log('')
      console.log('═══════════════════════════════════════════════════════')
      console.log(`📷 ПОЛОЖЕНИЕ КАМЕРЫ (${modelName}):`)
      console.log('═══════════════════════════════════════════════════════')
      console.log(`   Модель: ${modelPath}`)
      console.log(`   Orbit: ${orbit.theta}deg ${orbit.phi}deg ${orbit.radius}m`)
      console.log(`   Target: ${target.x}m ${target.y}m ${target.z}m`)
      console.log(`   FOV: ${fov}deg`)
      console.log('')
      console.log('📋 СКОПИРУЙТЕ ЭТИ ЗНАЧЕНИЯ:')
      console.log('───────────────────────────────────────────────────────')
      console.log(`DEFAULT_CAMERA_ORBIT = '${orbit.theta}deg ${orbit.phi}deg ${orbit.radius}m'`)
      console.log(`DEFAULT_CAMERA_TARGET = '${target.x}m ${target.y}m ${target.z}m'`)
      console.log(`DEFAULT_FIELD_OF_VIEW = '${fov}deg'`)
      console.log('═══════════════════════════════════════════════════════')
      console.log('')
      
      return { orbit, target, fov, modelPath, modelName }
    } catch (e) {
      console.error('❌ Ошибка:', e.message)
      console.log('💡 Подождите, пока модель загрузится, и попробуйте снова')
      console.log('💡 Или попробуйте через несколько секунд: window.getCamera()')
      return null
    }
  }
  console.log('✅ Функция window.getCamera() создана. Используйте её в консоли для получения положения камеры.')
}

// Стандартные настройки камеры для всех моделей скутеров
// Эти значения обеспечивают единообразный стартовый ракурс для всех моделей
// Скутер стоит строго в профиль к зрителю, без вида "чуть сверху"
const DEFAULT_CAMERA_ORBIT = '90deg 90deg 2.5m' // theta(horizontal) phi(vertical) radius(distance)
// theta: 90deg = строго боковой вид (скутер в профиль)
// phi: 90deg = строго горизонтальный вид (не сверху, не снизу)
// radius: 2.5m = расстояние от камеры до модели

const DEFAULT_CAMERA_TARGET = '0m 0.5m 0m' // Центр обзора на уровне центра модели
const DEFAULT_FIELD_OF_VIEW = '30deg' // Угол обзора для комфортного просмотра

// Ограничения камеры
const MIN_CAMERA_ORBIT = 'auto 70deg 1.2m' // Можно приблизить и опустить ниже
const MAX_CAMERA_ORBIT = 'auto 95deg 4m'   // Можно отдалить

export default function ScooterViewer({ 
  modelPath, 
  selectedDesign,
  environmentImage = null,
  panoramaUrl = '/images/studio-panorama.png',
  className = ''
}) {
  const containerRef = useRef(null)
  const modelViewerRef = useRef(null)
  const [scriptLoaded, setScriptLoaded] = useState(false)
  const [isModelLoaded, setIsModelLoaded] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [modelRotation, setModelRotation] = useState(0) // Track model rotation for panorama sync
  
  // Check if this is Honda Lead model - проверяем modelPath динамически
  const isHondaLead = useMemo(() => {
    if (!modelPath) {
      console.log('🔍 [Placeholder] No modelPath provided')
      return false
    }
    const pathLower = modelPath.toLowerCase()
    // Точная проверка для Honda Lead
    const result = pathLower.includes('honda-lead') || 
                   pathLower.includes('honda_lead') ||
                   pathLower === '/models/honda-lead.glb' ||
                   pathLower.includes('/models/honda-lead.glb')
    console.log('🔍 [Placeholder] Checking Honda Lead:', { 
      modelPath, 
      pathLower, 
      isHondaLead: result,
      checks: {
        'honda-lead': pathLower.includes('honda-lead'),
        'honda_lead': pathLower.includes('honda_lead'),
        'exact match': pathLower === '/models/honda-lead.glb',
        'includes path': pathLower.includes('/models/honda-lead.glb')
      }
    })
    return result
  }, [modelPath])

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

    // Timeout after 10 seconds
    const timeout = setTimeout(() => {
      clearInterval(checkInterval)
      console.error('model-viewer script failed to load after 10 seconds')
    }, 10000)

    return () => {
      clearInterval(checkInterval)
      clearTimeout(timeout)
    }
  }, [isMounted])

  // Hook 3: Create and configure model-viewer element
  useEffect(() => {
    if (!isMounted || !scriptLoaded || !containerRef.current || !modelPath) return

    const container = containerRef.current
    
    // Clear any existing content
    container.innerHTML = ''

    // Ensure model path is absolute
    const fullModelPath = modelPath.startsWith('/') ? modelPath : `/${modelPath}`
    console.log('🔍 Loading 3D model from:', fullModelPath)

    // Create model-viewer element
    const modelViewer = document.createElement('model-viewer')
    
    // Set src using direct property (more reliable than setAttribute)
    modelViewer.src = fullModelPath
    modelViewer.alt = '3D Scooter Model'
    
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
    if (panoramaUrl) {
      const skyboxPath = panoramaUrl.startsWith('/') ? panoramaUrl : `/${panoramaUrl}`
      modelViewer.setAttribute('skybox-image', skyboxPath)
      modelViewer.setAttribute('skybox-height', '2m') // Высота skybox
      console.log('🎨 Setting skybox-image:', skyboxPath)
    } else {
      // Если нет панорамы, используем градиентный фон
      modelViewer.style.background = 'linear-gradient(to bottom, #e5e7eb 0%, #f9fafb 100%)'
    }
    
    // Fix orientation for honda-lead model (rotate 90deg around Y-axis to fix "on side" issue)
    if (fullModelPath.includes('honda-lead')) {
      modelViewer.style.transform = 'rotateY(90deg)'
      console.log('🔄 Applied orientation fix for honda-lead model (90deg Y-axis rotation)')
    }
    
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
    poster.className = 'absolute inset-0 flex items-center justify-center bg-gradient-to-b from-neutral-100 to-neutral-50'
    poster.innerHTML = `
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-neutral-400 mx-auto mb-4"></div>
        <p class="text-neutral-600">Loading 3D Model...</p>
      </div>
    `
    modelViewer.appendChild(poster)

    // Handle model load events
    const handleLoad = (e) => {
      setIsModelLoaded(true)
      console.log('✅ 3D model loaded successfully:', fullModelPath)
    }
    
    const handleModelLoad = (e) => {
      setIsModelLoaded(true)
      console.log('✅ Model-viewer model-loaded event')
      
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
            fov: DEFAULT_FIELD_OF_VIEW
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
                console.log(`   DEFAULT_CAMERA_ORBIT = '${orbit.theta}deg ${orbit.phi}deg ${orbit.radius}m'`)
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
    
    const handleProgress = (e) => {
      const progress = e.detail?.totalProgress || 0
      if (progress === 1) {
        console.log('✅ Model loading progress: 100%')
        setIsModelLoaded(true)
      } else {
        console.log(`⏳ Model loading progress: ${(progress * 100).toFixed(0)}%`)
      }
    }

    const handleError = (error) => {
      // Для Honda Lead ошибка ожидаема - используется placeholder
      if (isHondaLead) {
        console.log('ℹ️ Honda Lead model not available, using placeholder image')
        setIsModelLoaded(false)
        return
      }
      
      console.error('❌ Error loading 3D model:', error)
      console.error('Model path:', fullModelPath)
      setIsModelLoaded(false)
      
      // Show user-friendly error message only for non-Honda Lead models
      if (container && !isHondaLead) {
        container.innerHTML = `
          <div class="flex flex-col items-center justify-center h-full bg-gradient-to-b from-neutral-100 to-neutral-50 p-8">
            <div class="text-center">
              <div class="text-6xl mb-4">⚠️</div>
              <h3 class="text-xl font-semibold text-neutral-900 mb-2">Failed to load 3D model</h3>
              <p class="text-neutral-600 mb-4">Model file: ${fullModelPath}</p>
              <p class="text-sm text-neutral-500 mb-2">Please check:</p>
              <ul class="text-sm text-neutral-500 text-left list-disc list-inside">
                <li>File exists in /public/models/</li>
                <li>File is a valid GLB format</li>
                <li>Browser console for detailed error</li>
              </ul>
            </div>
          </div>
        `
      }
    }

    // Track camera orbit changes to sync panorama rotation
    const handleCameraChange = () => {
      if (!modelViewer) return
      
      try {
        const orbit = modelViewer.getCameraOrbit()
        if (orbit && orbit.theta !== undefined) {
          // Convert theta (azimuthal angle) to radians for panorama
          const rotationRad = (orbit.theta * Math.PI) / 180
          setModelRotation(rotationRad)
        }
      } catch (e) {
        // getCameraOrbit might not be available yet
      }
    }

    // Add event listeners
    modelViewer.addEventListener('load', handleLoad)
    modelViewer.addEventListener('model-loaded', handleModelLoad)
    modelViewer.addEventListener('progress', handleProgress)
    modelViewer.addEventListener('error', handleError)
    modelViewer.addEventListener('camera-change', handleCameraChange)

    // Append to container immediately
    container.appendChild(modelViewer)
    modelViewerRef.current = modelViewer
    
    // Сохраняем ссылку на modelViewer глобально для доступа из консоли
    if (typeof window !== 'undefined') {
      // Сохраняем ссылку на текущий model-viewer
      if (!window.modelViewers) {
        window.modelViewers = []
      }
      window.modelViewers.push(modelViewer)
      
      // Добавляем функцию для получения текущего положения камеры (для отладки)
      // Можно вызвать в консоли: window.getCurrentCameraPosition()
      window.getCurrentCameraPosition = () => {
        // Пытаемся найти активный model-viewer
        const activeViewer = window.modelViewers?.[window.modelViewers.length - 1] || 
                            document.querySelector('model-viewer')
        
        if (!activeViewer) {
          console.error('❌ model-viewer не найден. Убедитесь, что модель загружена.')
          return null
        }
        
        try {
          // Проверяем, загружена ли модель
          if (!activeViewer.loaded) {
            console.warn('⚠️ Модель еще не загружена. Подождите несколько секунд.')
            return null
          }
          
          const orbit = activeViewer.getCameraOrbit()
          const target = activeViewer.getCameraTarget()
          const fov = activeViewer.getFieldOfView()
          
          if (!orbit || !target || !fov) {
            console.warn('⚠️ Не удалось получить данные камеры. Попробуйте через несколько секунд.')
            return null
          }
          
          const position = {
            orbit: `${orbit.theta}deg ${orbit.phi}deg ${orbit.radius}m`,
            target: `${target.x}m ${target.y}m ${target.z}m`,
            fov: `${fov}deg`,
            raw: { orbit, target, fov },
            // Формат для копирования в код
            code: {
              cameraOrbit: `'${orbit.theta}deg ${orbit.phi}deg ${orbit.radius}m'`,
              cameraTarget: `'${target.x}m ${target.y}m ${target.z}m'`,
              fieldOfView: `'${fov}deg'`
            }
          }
          
          console.log('📷 ТЕКУЩЕЕ ПОЛОЖЕНИЕ КАМЕРЫ:')
          console.log('   Orbit:', position.orbit)
          console.log('   Target:', position.target)
          console.log('   FOV:', position.fov)
          console.log('')
          console.log('📋 КОД ДЛЯ КОПИРОВАНИЯ:')
          console.log(`   DEFAULT_CAMERA_ORBIT = ${position.code.cameraOrbit}`)
          console.log(`   DEFAULT_CAMERA_TARGET = ${position.code.cameraTarget}`)
          console.log(`   DEFAULT_FIELD_OF_VIEW = ${position.code.fieldOfView}`)
          
          return position
        } catch (e) {
          console.error('❌ Ошибка получения положения камеры:', e)
          console.log('💡 Попробуйте подождать, пока модель полностью загрузится')
          console.log('💡 Или попробуйте через несколько секунд: window.getCurrentCameraPosition()')
          return null
        }
      }
      console.log('💡 Для получения текущего положения камеры выполните: window.getCamera()')
    }
    
    console.log('✅ model-viewer element created and appended to DOM')

    // Verify src was set correctly
    setTimeout(() => {
      if (modelViewer.src !== fullModelPath) {
        console.warn('⚠️ Model path mismatch, correcting...')
        modelViewer.src = fullModelPath
      }
    }, 100)

    // Cleanup function
    return () => {
      modelViewer.removeEventListener('load', handleLoad)
      modelViewer.removeEventListener('model-loaded', handleModelLoad)
      modelViewer.removeEventListener('progress', handleProgress)
      modelViewer.removeEventListener('error', handleError)
      if (container && container.contains(modelViewer)) {
        container.removeChild(modelViewer)
      }
    }
  }, [isMounted, scriptLoaded, modelPath, environmentImage, panoramaUrl])

  // Hook 4: Apply design texture/variant when it changes
  useEffect(() => {
    if (!modelViewerRef.current || !selectedDesign || !isModelLoaded) return

    const modelViewer = modelViewerRef.current

    // Method 1: Apply material variant if specified
    if (selectedDesign.variant) {
      try {
        modelViewer.setAttribute('variant-name', selectedDesign.variant)
        console.log('✅ Applied variant:', selectedDesign.variant)
      } catch (error) {
        console.warn('Failed to apply variant:', error)
      }
    }

    // Method 2: Apply texture if specified (requires accessing Three.js scene)
    if (selectedDesign.texture && !selectedDesign.variant) {
      try {
        // Access the model's scene via model-viewer's internal API
        // Note: This is a workaround - model-viewer doesn't officially expose this
        const scene = modelViewer.model || modelViewer.scene
        
        if (scene && typeof window !== 'undefined' && window.THREE) {
          const THREE = window.THREE
          const textureLoader = new THREE.TextureLoader()
          
          console.log('🖼️ Loading texture:', selectedDesign.texture)
          
          textureLoader.load(
            selectedDesign.texture,
            (texture) => {
              texture.flipY = false
              texture.encoding = THREE.sRGBEncoding
              
              // Traverse scene and apply texture to materials
              scene.traverse((node) => {
                if (node.isMesh && node.material) {
                  const materials = Array.isArray(node.material) ? node.material : [node.material]
                  
                  materials.forEach((material) => {
                    if (material.isMeshStandardMaterial || material.isMeshPhysicalMaterial) {
                      material.map = texture
                      material.needsUpdate = true
                      console.log('✅ Texture applied to material')
                    }
                  })
                }
              })
              
              // Request render update
              if (modelViewer.requestUpdate) {
                modelViewer.requestUpdate()
              }
            },
            undefined,
            (error) => {
              console.warn('⚠️ Failed to load texture:', error)
            }
          )
        } else {
          console.warn('⚠️ Three.js or scene not available for texture swapping')
          console.log('💡 Tip: Use material variants in your GLB model for better texture switching')
        }
      } catch (error) {
        console.warn('⚠️ Texture swap not available:', error)
        console.log('💡 Tip: Export your GLB with material variants for each design')
      }
    }
  }, [selectedDesign, isModelLoaded])

  // Show loading state until mounted or script loaded
  const shouldShowLoading = typeof window === 'undefined' || !isMounted || !scriptLoaded;
  
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

  // Debug: логируем состояние перед рендером
  if (isHondaLead) {
    console.log('🎨 [Placeholder] Rendering placeholder for Honda Lead:', {
      isHondaLead,
      modelPath,
      isModelLoaded,
      src: '/wraps/designs/honda-lead/Cinematic_404.png'
    })
  }

  return (
    <div 
      className={`relative w-full h-full ${className}`}
      suppressHydrationWarning
      data-client-only="true"
      style={{ position: 'relative', overflow: 'hidden' }}
    >
      {/* Фотозаглушка для Honda Lead - за 3D моделью */}
      {isHondaLead && (
        <img
          src="/wraps/designs/honda-lead/Cinematic_404.png"
          alt="Honda Lead Background"
          style={{ 
            position: 'absolute', 
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1, // За моделью
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center',
            opacity: isModelLoaded ? 0.6 : 1, // Видна всегда
            pointerEvents: 'none', // Не блокируем взаимодействие с 3D моделью
          }}
          onError={(e) => {
            console.error('❌ [Placeholder] Failed to load:', {
              src: '/wraps/designs/honda-lead/Cinematic_404.png',
              error: e,
              target: e.currentTarget
            })
            // Не скрываем, показываем красный фон для отладки
            e.currentTarget.style.backgroundColor = 'rgba(255, 0, 0, 0.5)'
            e.currentTarget.style.border = '3px solid red'
          }}
          onLoad={() => {
            console.log('✅ [Placeholder] Image loaded successfully:', {
              src: '/wraps/designs/honda-lead/Cinematic_404.png',
              isModelLoaded,
              opacity: isModelLoaded ? 0.6 : 1
            })
          }}
        />
      )}
      
      {/* Чистый градиентный фон (если не Honda Lead) */}
      {!isHondaLead && (
        <div 
          style={{ 
            position: 'absolute', 
            inset: 0, 
            zIndex: 0,
            background: 'linear-gradient(180deg, #f0f2f5 0%, #e8eaed 100%)',
          }}
        />
      )}
      
      {/* 3D Model Viewer */}
      <div 
        ref={containerRef}
        className="absolute inset-0 w-full h-full"
        style={{ 
          background: 'transparent',
          zIndex: 3, // Уменьшено, чтобы заглушка была видна
          position: 'relative'
        }}
      />
    </div>
  )
}
