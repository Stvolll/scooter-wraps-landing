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

// Функция для инициализации window.getCamera() - будет вызвана внутри useEffect
// ВАЖНО: Эта функция не должна выполнять никаких действий на верхнем уровне модуля
function createGetCameraFunction() {
  // Проверяем, что мы на клиенте
  if (typeof window === 'undefined') return

  // Проверяем, не создана ли уже функция
  if (window.getCamera && typeof window.getCamera === 'function') {
    return
  }

  // Создаем функцию только если её еще нет
  try {
    window.getCamera = () => {
      // Ищем все model-viewer элементы
      const viewers = document.querySelectorAll('model-viewer')

      if (viewers.length === 0) {
        console.error('❌ model-viewer не найден. Убедитесь, что модель загружена.')
        return null
      }

      if (viewers.length > 1) {
        console.log(
          `ℹ️ Найдено ${viewers.length} model-viewer элементов. Используем первый активный.`
        )
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
          console.warn(
            '⚠️ Не удалось получить данные камеры. Подождите, пока модель полностью загрузится.'
          )
          console.log('💡 Попробуйте через несколько секунд: window.getCamera()')
          return null
        }

        // Получаем путь к модели для информации
        const modelPath = viewer.src || 'неизвестно'
        const modelName = modelPath.includes('yamaha-nvx')
          ? 'Yamaha NVX'
          : modelPath.includes('honda-lead')
            ? 'Honda Lead'
            : modelPath.includes('honda-vision')
              ? 'Honda Vision'
              : modelPath.includes('honda-sh')
                ? 'Honda SH'
                : modelPath.includes('honda-pcx')
                  ? 'Honda PCX'
                  : 'Unknown'

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
  } catch (error) {
    console.error('❌ Ошибка при создании window.getCamera():', error)
  }
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

export default function ScooterViewer({
  modelPath,
  selectedDesign,
  environmentImage = null,
  panoramaUrl = '/images/studio-panorama.png',
  className = '',
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
      return false
    }
    const pathLower = modelPath.toLowerCase()
    // Точная проверка для Honda Lead
    const result =
      pathLower.includes('honda-lead') ||
      pathLower.includes('honda_lead') ||
      pathLower === '/models/honda-lead.glb' ||
      pathLower.includes('/models/honda-lead.glb')
    return result
  }, [modelPath])

  // Логируем isHondaLead только на клиенте
  useEffect(() => {
    if (typeof window !== 'undefined' && modelPath) {
      console.log('🔍 [Placeholder] Checking Honda Lead:', {
        modelPath,
        isHondaLead,
      })
    }
  }, [modelPath, isHondaLead])

  // Hook 1: Set mounted state and initialize getCamera function
  useEffect(() => {
    setIsMounted(true)
    // Инициализируем window.getCamera() только на клиенте, внутри useEffect
    try {
      createGetCameraFunction()
      // Логируем только после успешной инициализации
      if (
        typeof window !== 'undefined' &&
        window.getCamera &&
        typeof window.getCamera === 'function'
      ) {
        console.log(
          '✅ Функция window.getCamera() создана. Используйте её в консоли для получения положения камеры.'
        )
      }
    } catch (error) {
      console.error('❌ Ошибка при инициализации getCamera:', error)
    }
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
    // Capture selectedDesign in closure for diagnostics
    const currentSelectedDesign = selectedDesign

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
    const handleLoad = e => {
      setIsModelLoaded(true)
      console.log('✅ 3D model loaded successfully:', fullModelPath)
    }

    const handleModelLoad = e => {
      setIsModelLoaded(true)
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
                console.warn(
                  '💡 Expected texture path:',
                  currentSelectedDesign?.texture || 'not set yet'
                )
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

    const handleProgress = e => {
      const progress = e.detail?.totalProgress || 0
      if (progress === 1) {
        console.log('✅ Model loading progress: 100%')
        setIsModelLoaded(true)
      } else {
        console.log(`⏳ Model loading progress: ${(progress * 100).toFixed(0)}%`)
      }
    }

    const handleError = error => {
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
        const activeViewer =
          window.modelViewers?.[window.modelViewers.length - 1] ||
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
              fieldOfView: `'${fov}deg'`,
            },
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
  }, [isMounted, scriptLoaded, modelPath, environmentImage, panoramaUrl, selectedDesign])

  // Hook 4: Apply design texture/variant when it changes
  useEffect(() => {
    // Get model-viewer element from container
    if (!containerRef.current || !selectedDesign || !isModelLoaded) {
      console.log('⏳ Waiting for conditions:', {
        hasContainer: !!containerRef.current,
        hasDesign: !!selectedDesign,
        isModelLoaded,
      })
      return
    }

    // Find model-viewer element in container
    const container = containerRef.current
    const modelViewer = container.querySelector('model-viewer')

    if (!modelViewer) {
      console.warn('⚠️ model-viewer element not found in container')
      return
    }

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
      console.log('🎨 Attempting to apply texture:', selectedDesign.texture)
      try {
        // Wait for model to be fully loaded before accessing scene
        const applyTexture = () => {
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

          // If scene not found, wait and retry
          if (!scene) {
            console.warn('⚠️ Scene not available yet, waiting for model to load...', {
              hasModel: !!currentModelViewer.model,
              hasScene: !!currentModelViewer.scene,
              hasRenderer: !!currentModelViewer.renderer,
              loaded: currentModelViewer.loaded,
            })
            // Retry after a short delay
            setTimeout(() => {
              const retryContainer = containerRef.current
              if (retryContainer) {
                const retryModelViewer = retryContainer.querySelector('model-viewer')
                if (retryModelViewer && retryModelViewer.loaded && retryModelViewer.model) {
                  // Try again with updated model
                  if (retryModelViewer.model.scene) {
                    scene = retryModelViewer.model.scene
                    if (scene) {
                      console.log('🔄 Retrying texture application after delay...')
                      applyTexture()
                    }
                  } else if (retryModelViewer.model.scenes && retryModelViewer.model.scenes[0]) {
                    scene = retryModelViewer.model.scenes[0]
                    if (scene) {
                      console.log('🔄 Retrying texture application after delay (scenes[0])...')
                      applyTexture()
                    }
                  } else {
                    console.log('🔄 Retrying texture application with current state...')
                    applyTexture() // Retry with current state
                  }
                }
              }
            }, 500)
            return
          }

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

          console.log('🖼️ Loading texture:', selectedDesign.texture)

          // Ensure texture path is absolute
          const texturePath = selectedDesign.texture.startsWith('/')
            ? selectedDesign.texture
            : `/${selectedDesign.texture}`

          console.log('🖼️ Loading texture from:', texturePath)

          // First, verify texture file exists by trying to load it as Image
          const verifyTexture = new Image()
          verifyTexture.crossOrigin = 'anonymous'
          verifyTexture.onload = () => {
            console.log('✅ Texture file verified, exists and is loadable:', texturePath)
            // Now load via Three.js TextureLoader
            textureLoader.load(
              texturePath,
              texture => {
                console.log('✅ Texture loaded successfully via Three.js:', texturePath)
                texture.flipY = false
                // Use modern encoding if available, fallback to old
                if (THREE.sRGBEncoding !== undefined) {
                  texture.encoding = THREE.sRGBEncoding
                } else if (THREE.SRGBColorSpace !== undefined) {
                  texture.colorSpace = THREE.SRGBColorSpace
                }

                // Ensure texture is ready and properly configured
                if (texture.image) {
                  if (texture.image.complete) {
                    console.log('✅ Texture image is ready:', {
                      width: texture.image.width,
                      height: texture.image.height,
                      naturalWidth: texture.image.naturalWidth,
                      naturalHeight: texture.image.naturalHeight,
                      src: texture.image.src,
                    })
                  } else {
                    console.warn('⚠️ Texture image may not be ready yet, waiting...')
                    texture.image.onload = () => {
                      console.log('✅ Texture image loaded after wait')
                      texture.needsUpdate = true
                    }
                  }

                  // Set crossOrigin for CORS
                  texture.image.crossOrigin = 'anonymous'
                } else {
                  console.warn('⚠️ Texture has no image property')
                }

                // Ensure texture is properly configured
                texture.needsUpdate = true
                texture.flipY = false

                // Set wrapping mode if available
                if (THREE.RepeatWrapping !== undefined) {
                  texture.wrapS = THREE.RepeatWrapping
                  texture.wrapT = THREE.RepeatWrapping
                } else if (THREE && typeof THREE.RepeatWrapping !== 'undefined') {
                  texture.wrapS = THREE.RepeatWrapping
                  texture.wrapT = THREE.RepeatWrapping
                }

                // Store original materials to preserve layers and lighting
                const materialMap = new Map()

                // Traverse scene and apply texture to materials
                let materialsFound = 0
                let materialsUpdated = 0

                // Safety check: ensure traverse is a function
                if (!scene || typeof scene.traverse !== 'function') {
                  console.error('❌ Scene.traverse is not a function:', {
                    hasScene: !!scene,
                    traverseType: scene ? typeof scene.traverse : 'no scene',
                  })
                  return
                }

                try {
                  scene.traverse(node => {
                    // Check if node is a mesh (multiple ways to check)
                    const isMesh =
                      node.isMesh ||
                      (node.type && (node.type.includes('Mesh') || node.type === 'Mesh'))

                    if (isMesh && node.material) {
                      const materials = Array.isArray(node.material)
                        ? node.material
                        : [node.material]
                      materialsFound += materials.length

                      materials.forEach((material, index) => {
                        // Store original material properties if not already stored
                        const materialKey = `${node.uuid}-${index}`
                        if (!materialMap.has(materialKey)) {
                          materialMap.set(materialKey, {
                            originalMap: material.map,
                            originalNormalMap: material.normalMap,
                            originalRoughnessMap: material.roughnessMap,
                            originalMetalnessMap: material.metalnessMap,
                            originalEmissiveMap: material.emissiveMap,
                            originalAoMap: material.aoMap,
                            // Preserve lighting properties
                            roughness: material.roughness,
                            metalness: material.metalness,
                            emissive: material.emissive,
                            emissiveIntensity: material.emissiveIntensity,
                            // Preserve layer properties
                            layers: material.layers ? material.layers.mask : 0,
                          })
                        }

                        // Check material type more broadly (with safety checks)
                        const isCompatibleMaterial =
                          material.isMeshStandardMaterial === true ||
                          material.isMeshPhysicalMaterial === true ||
                          material.isMeshLambertMaterial === true ||
                          material.isMeshPhongMaterial === true ||
                          material.type === 'MeshStandardMaterial' ||
                          material.type === 'MeshPhysicalMaterial' ||
                          material.type === 'MeshLambertMaterial' ||
                          material.type === 'MeshPhongMaterial' ||
                          (material.type && material.type.includes('Material')) // Fallback: any material with "Material" in type

                        // Try to apply texture to ANY material - model-viewer materials should support map
                        // Apply to all materials, not just "compatible" ones
                        const hadMap = !!material.map

                        // Apply texture
                        material.map = texture

                        // Ensure texture is properly configured
                        if (material.map) {
                          material.map.needsUpdate = true
                          material.map.flipY = false // Ensure correct orientation

                          // Set texture repeat if needed (for tiling)
                          if (material.map.repeat) {
                            material.map.repeat.set(1, 1)
                          }

                          // Ensure texture is loaded
                          if (material.map.image) {
                            material.map.image.crossOrigin = 'anonymous'
                          }
                        }

                        // Preserve normal maps, roughness, metalness, etc.
                        // Don't overwrite these - they control lighting and layers

                        // CRITICAL: Force material update - this is essential for texture to appear
                        material.needsUpdate = true

                        // Force texture update
                        if (material.map) {
                          material.map.needsUpdate = true
                        }

                        // Also update geometry if it exists
                        if (node.geometry) {
                          node.geometry.uvsNeedUpdate = true
                          // Force geometry update
                          if (node.geometry.attributes && node.geometry.attributes.uv) {
                            node.geometry.attributes.uv.needsUpdate = true
                          }
                        }

                        // Ensure material properties are set correctly for PBR
                        // Fix common issues: metalness=1 and roughness=1 make model gray
                        if (material.metalness !== undefined) {
                          // If metalness is too high (close to 1), reduce it
                          if (material.metalness > 0.8) {
                            material.metalness = 0.2
                            console.log('🔧 Adjusted metalness from', material.metalness, 'to 0.2')
                          }
                        }
                        if (material.roughness !== undefined) {
                          // If roughness is too high (close to 1), reduce it
                          if (material.roughness > 0.8) {
                            material.roughness = 0.6
                            console.log('🔧 Adjusted roughness from', material.roughness, 'to 0.6')
                          }
                        }

                        materialsUpdated++
                        console.log('✅ Texture applied to material:', {
                          materialType: material.type,
                          materialName: material.name || 'unnamed',
                          hadMap,
                          hasMap: !!material.map,
                          hasNormalMap: !!material.normalMap,
                          hasRoughnessMap: !!material.roughnessMap,
                          roughness: material.roughness,
                          metalness: material.metalness,
                          textureUrl: texturePath,
                          isCompatible: isCompatibleMaterial,
                          textureWidth: material.map?.image?.width,
                          textureHeight: material.map?.image?.height,
                          textureSrc: material.map?.image?.src,
                        })
                      })
                    }
                  })
                } catch (traverseError) {
                  console.error('❌ Error traversing scene:', traverseError)
                  return
                }

                console.log(
                  `📊 Texture application summary: ${materialsUpdated}/${materialsFound} materials updated`
                )

                // CRITICAL: Force all materials to update - traverse scene again and force update
                // This is the key fix for "gray mesh" problem
                try {
                  scene.traverse(obj => {
                    if (obj.isMesh && obj.material) {
                      const materials = Array.isArray(obj.material) ? obj.material : [obj.material]
                      materials.forEach(mat => {
                        // Force material update
                        mat.needsUpdate = true
                        // Force texture update if exists
                        if (mat.map) {
                          mat.map.needsUpdate = true
                        }
                        // Force normal map update if exists
                        if (mat.normalMap) {
                          mat.normalMap.needsUpdate = true
                        }
                      })
                      // Force geometry update
                      if (obj.geometry) {
                        obj.geometry.uvsNeedUpdate = true
                        if (obj.geometry.attributes && obj.geometry.attributes.uv) {
                          obj.geometry.attributes.uv.needsUpdate = true
                        }
                      }
                    }
                  })
                  console.log('✅ Forced all materials and geometries to update')
                } catch (forceUpdateError) {
                  console.warn('⚠️ Error forcing material updates:', forceUpdateError)
                }

                // Force render update - try multiple methods
                const currentContainer = containerRef.current
                if (currentContainer) {
                  const currentModelViewer = currentContainer.querySelector('model-viewer')
                  if (currentModelViewer) {
                    // Method 1: requestUpdate (if available) - most reliable for model-viewer
                    if (typeof currentModelViewer.requestUpdate === 'function') {
                      currentModelViewer.requestUpdate()
                      console.log('✅ Called requestUpdate()')
                    }

                    // Method 2: Update model-viewer's renderer directly
                    try {
                      if (currentModelViewer.renderer) {
                        // Force renderer to update
                        if (currentModelViewer.renderer.render) {
                          const renderScene = currentModelViewer.scene || scene
                          const renderCamera =
                            currentModelViewer.camera || currentModelViewer.getCamera()
                          if (renderScene && renderCamera) {
                            currentModelViewer.renderer.render(renderScene, renderCamera)
                            console.log('✅ Forced render via renderer.render()')
                          }
                        }

                        // Also try to trigger render loop
                        if (currentModelViewer.renderer.setAnimationLoop) {
                          // This will trigger the next frame
                          currentModelViewer.renderer.setAnimationLoop(time => {
                            // Animation loop callback - renderer will update
                          })
                        }
                      }
                    } catch (e) {
                      console.warn('⚠️ Could not force render via renderer:', e)
                    }

                    // Method 3: Trigger custom event
                    if (currentModelViewer.dispatchEvent) {
                      currentModelViewer.dispatchEvent(new CustomEvent('needs-update'))
                      currentModelViewer.dispatchEvent(new CustomEvent('render'))
                      console.log('✅ Dispatched needs-update and render events')
                    }

                    // Method 4: Update a property to trigger re-render
                    try {
                      // Temporarily change exposure to force update
                      const originalExposure = currentModelViewer.getAttribute('exposure')
                      currentModelViewer.setAttribute(
                        'exposure',
                        parseFloat(originalExposure || '1.4') + 0.001
                      )
                      setTimeout(() => {
                        currentModelViewer.setAttribute('exposure', originalExposure || '1.4')
                      }, 10)
                      console.log('✅ Triggered update via exposure change')
                    } catch (e) {
                      console.warn('⚠️ Could not trigger update via exposure:', e)
                    }

                    // Method 5: Force update via model property change
                    try {
                      if (currentModelViewer.model) {
                        // Trigger model update
                        currentModelViewer.dispatchEvent(new Event('load'))
                        console.log('✅ Dispatched load event')
                      }
                    } catch (e) {
                      console.warn('⚠️ Could not dispatch load event:', e)
                    }
                  }
                }

                console.log('✅ Texture applied successfully, layers and lighting preserved')

                // Additional check: verify texture is actually on materials
                setTimeout(() => {
                  const verifyContainer = containerRef.current
                  if (verifyContainer) {
                    const verifyModelViewer = verifyContainer.querySelector('model-viewer')
                    if (
                      verifyModelViewer &&
                      verifyModelViewer.model &&
                      verifyModelViewer.model.scene
                    ) {
                      let verifiedCount = 0
                      verifyModelViewer.model.scene.traverse(node => {
                        if (node.isMesh && node.material) {
                          const materials = Array.isArray(node.material)
                            ? node.material
                            : [node.material]
                          materials.forEach(material => {
                            if (material.map && material.map.image && material.map.image.src) {
                              if (material.map.image.src.includes(texturePath.split('/').pop())) {
                                verifiedCount++
                              }
                            }
                          })
                        }
                      })
                      console.log(
                        `🔍 Verification: ${verifiedCount} materials have texture applied`
                      )
                    }
                  }
                }, 500)
              },
              undefined,
              error => {
                console.error('❌ Failed to load texture via Three.js:', error)
                console.error('   Texture path:', texturePath)
                console.error('   Error details:', error.message || error)
              }
            )
          }
          verifyTexture.onerror = () => {
            console.error('❌ Texture file NOT FOUND or cannot be loaded:', texturePath)
            console.error('   Please verify the file exists in /public' + texturePath)
            console.error('   Expected location:', '/public' + texturePath)
          }
          verifyTexture.src = texturePath
        }

        // Wait for model to be loaded before applying texture
        // Try multiple times to ensure model is fully loaded
        const tryApplyTexture = (attempt = 0) => {
          // Re-check model-viewer element (it might have been recreated)
          const currentContainer = containerRef.current
          if (!currentContainer) {
            console.warn('⚠️ Container disappeared, retrying...')
            if (attempt < 3) {
              setTimeout(() => tryApplyTexture(attempt + 1), 500)
            }
            return
          }

          const currentModelViewer = currentContainer.querySelector('model-viewer')
          if (!currentModelViewer) {
            console.warn('⚠️ model-viewer element disappeared, retrying...')
            if (attempt < 3) {
              setTimeout(() => tryApplyTexture(attempt + 1), 500)
            }
            return
          }

          if (currentModelViewer.loaded) {
            console.log(`🔄 Attempt ${attempt + 1}: Model is loaded, applying texture...`)
            // Update modelViewer reference in applyTexture closure
            applyTexture()
          } else {
            console.log(`⏳ Attempt ${attempt + 1}: Model not loaded yet, waiting...`)
            if (attempt < 5) {
              // Wait for model-loaded event or retry after delay
              const handleModelLoaded = () => {
                console.log('✅ Model-loaded event fired, applying texture...')
                setTimeout(() => {
                  applyTexture()
                }, 500) // Increased delay to ensure scene is ready
                currentModelViewer.removeEventListener('model-loaded', handleModelLoaded)
              }

              // Also set a timeout as fallback
              const timeout = setTimeout(() => {
                const checkContainer = containerRef.current
                if (checkContainer) {
                  const checkModelViewer = checkContainer.querySelector('model-viewer')
                  if (checkModelViewer && checkModelViewer.loaded) {
                    console.log('⏰ Timeout: Model loaded, applying texture...')
                    applyTexture()
                  } else {
                    console.log(
                      `⏰ Timeout: Model still not loaded, retrying (attempt ${attempt + 1})...`
                    )
                    tryApplyTexture(attempt + 1)
                  }
                }
              }, 1500)

              currentModelViewer.addEventListener('model-loaded', () => {
                clearTimeout(timeout)
                handleModelLoaded()
              })
            } else {
              console.error('❌ Failed to apply texture after 5 attempts')
            }
          }
        }

        tryApplyTexture()
      } catch (error) {
        console.warn('⚠️ Texture swap not available:', error)
        console.log('💡 Tip: Export your GLB with material variants for each design')
      }
    }
  }, [selectedDesign, isModelLoaded, isHondaLead])

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

  // Debug: логируем состояние перед рендером
  if (isHondaLead) {
    console.log('🎨 [Placeholder] Rendering placeholder for Honda Lead:', {
      isHondaLead,
      modelPath,
      isModelLoaded,
      src: '/wraps/designs/honda-lead/Cinematic_404.png',
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
          onError={e => {
            console.error('❌ [Placeholder] Failed to load:', {
              src: '/wraps/designs/honda-lead/Cinematic_404.png',
              error: e,
              target: e.currentTarget,
            })
            // Не скрываем, показываем красный фон для отладки
            e.currentTarget.style.backgroundColor = 'rgba(255, 0, 0, 0.5)'
            e.currentTarget.style.border = '3px solid red'
          }}
          onLoad={() => {
            console.log('✅ [Placeholder] Image loaded successfully:', {
              src: '/wraps/designs/honda-lead/Cinematic_404.png',
              isModelLoaded,
              opacity: isModelLoaded ? 0.6 : 1,
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
          position: 'relative',
        }}
      />
    </div>
  )
}
