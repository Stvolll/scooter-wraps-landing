'use client'

/**
 * Клиентский GLB компрессор с DRACO
 * Сжимает GLB файлы в браузере ДО отправки на сервер
 * Использует Three.js GLTFExporter и DRACOLoader
 */

// Динамический импорт Three.js для избежания SSR проблем
let threeModules: {
  THREE: any
  GLTFExporter: any
  GLTFLoader: any
  DRACOLoader: any
} | null = null

async function loadThreeJS() {
  if (typeof window === 'undefined') {
    throw new Error('Three.js can only be loaded on the client')
  }

  if (threeModules) {
    return threeModules
  }

  try {
    const [
      threeModule,
      gltfExporterModule,
      gltfLoaderModule,
      dracoLoaderModule,
    ] = await Promise.all([
      import('three'),
      import('three/examples/jsm/exporters/GLTFExporter.js'),
      import('three/examples/jsm/loaders/GLTFLoader.js'),
      import('three/examples/jsm/loaders/DRACOLoader.js'),
    ])

    threeModules = {
      THREE: threeModule,
      GLTFExporter: gltfExporterModule.GLTFExporter,
      GLTFLoader: gltfLoaderModule.GLTFLoader,
      DRACOLoader: dracoLoaderModule.DRACOLoader,
    }

    return threeModules
  } catch (error) {
    console.error('❌ [Client GLB Compressor] Failed to load Three.js:', error)
    throw error
  }
}

export interface CompressionResult {
  success: boolean
  compressedBlob: Blob | null
  originalSize: number
  compressedSize: number
  reduction: number
  error?: string
}

/**
 * Сжать GLB файл с помощью DRACO в браузере
 * @param file - GLB файл для сжатия
 * @param quality - Качество сжатия (0-10, default: 7)
 * @returns Результат сжатия с Blob
 */
export async function compressGLBInBrowser(
  file: File,
  quality: number = 7
): Promise<CompressionResult> {
  try {
    console.log(`📦 [Client GLB Compressor] Начало сжатия: ${file.name} (${(file.size / (1024 * 1024)).toFixed(2)} MB)`)

    // Загружаем Three.js модули
    const { THREE, GLTFExporter, GLTFLoader, DRACOLoader } = await loadThreeJS()

    // Загружаем GLB файл в Three.js
    const loader = new GLTFLoader()
    
    // Создаем DRACO loader для декодирования (если файл использует DRACO)
    // Используем try-catch для безопасной инициализации
    // ВАЖНО: DRACO loader нужен только если файл уже сжат с DRACO
    // Для обычных GLB файлов он не требуется
    let dracoLoader: any = null
    try {
      dracoLoader = new DRACOLoader()
      // Используем CDN для декодеров DRACO
      dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/')
      // Устанавливаем обработчик ошибок для DRACO loader
      dracoLoader.setErrorCallback((error: any) => {
        console.warn('⚠️ [Client GLB Compressor] DRACO decoder error (non-fatal):', error)
        // Не прерываем загрузку - файл может не использовать DRACO
      })
      // Устанавливаем DRACO loader только если он успешно создан
      if (dracoLoader) {
        loader.setDRACOLoader(dracoLoader)
      }
    } catch (dracoError) {
      console.warn('⚠️ [Client GLB Compressor] Failed to initialize DRACO loader (non-fatal):', dracoError)
      // Продолжаем без DRACO - файл может не использовать DRACO compression
      dracoLoader = null
    }

    // Загружаем GLB
    // Используем URL.createObjectURL для создания временного URL
    // Это позволяет loader.load() корректно обрабатывать файл и его встроенные ресурсы
    const objectUrl = URL.createObjectURL(file)
    
    let gltf: any
    try {
      gltf = await new Promise<any>((resolve, reject) => {
        // Таймаут для предотвращения зависания
        const timeoutId = setTimeout(() => {
          reject(new Error('GLB loading timeout after 30 seconds'))
        }, 30000) // 30 секунд максимум

        // Используем loader.load() вместо parse() для корректной обработки встроенных ресурсов
        loader.load(
          objectUrl,
          (loadedGltf: any) => {
            clearTimeout(timeoutId)
            resolve(loadedGltf)
          },
          (progress: any) => {
            // Опционально: можно отслеживать прогресс загрузки
            if (progress.total > 0) {
              const percent = (progress.loaded / progress.total) * 100
              console.log(`📥 [Client GLB Compressor] Загрузка: ${percent.toFixed(1)}%`)
            }
          },
          (error: any) => {
            clearTimeout(timeoutId)
            console.error('❌ [Client GLB Compressor] Ошибка загрузки GLB:', error)
            
            // Улучшенная обработка ошибок
            let errorMessage = 'Failed to load GLB file'
            if (error?.message) {
              errorMessage = error.message
            } else if (typeof error === 'string') {
              errorMessage = error
            } else if (error?.toString) {
              errorMessage = error.toString()
            }
            
            // Проверяем, не связана ли ошибка с сетью/DRACO
            if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')) {
              console.warn('⚠️ [Client GLB Compressor] Network error detected - возможно проблема с DRACO декодерами')
              console.log('🔄 [Client GLB Compressor] Пытаемся загрузить без DRACO loader...')
              
              // Retry без DRACO loader - файл может не использовать DRACO
              // Подавляем предупреждение о DRACO loader, устанавливая пустой loader
              const simpleLoader = new GLTFLoader()
              // Устанавливаем пустой DRACO loader, чтобы убрать предупреждение
              try {
                const emptyDracoLoader = new DRACOLoader()
                emptyDracoLoader.setDecoderPath('') // Пустой путь - не будет загружать декодеры
                simpleLoader.setDRACOLoader(emptyDracoLoader)
              } catch (e) {
                // Игнорируем ошибки инициализации DRACO
              }
              const retryObjectUrl = URL.createObjectURL(file)
              
              simpleLoader.load(
                retryObjectUrl,
                (retryGltf: any) => {
                  URL.revokeObjectURL(retryObjectUrl)
                  console.log('✅ [Client GLB Compressor] GLB загружен без DRACO loader')
                  resolve(retryGltf)
                },
                undefined,
                (retryError: any) => {
                  URL.revokeObjectURL(retryObjectUrl)
                  console.error('❌ [Client GLB Compressor] Retry без DRACO также не удался:', retryError)
                  errorMessage = 'Failed to load GLB file: Network error or file format issue. The file may be corrupted or use unsupported features.'
                  reject(new Error(errorMessage))
                }
              )
              return // Не вызываем reject здесь, так как пытаемся retry
            }
            
            reject(new Error(errorMessage))
          }
        )
      })
    } catch (error: any) {
      // Дополнительная обработка ошибок на уровне try-catch
      console.error('❌ [Client GLB Compressor] Unexpected error during GLB loading:', error)
      throw error
    } finally {
      // Освобождаем временный URL после загрузки
      URL.revokeObjectURL(objectUrl)
    }

    console.log('✅ [Client GLB Compressor] GLB загружен, начинаем экспорт с DRACO...')

    // Экспортируем с DRACO сжатием
    const exporter = new GLTFExporter()
    
    const compressedGLB = await new Promise<ArrayBuffer>((resolve, reject) => {
      exporter.parse(
        gltf.scene,
        (result: any) => {
          // GLTFExporter может вернуть:
          // 1. ArrayBuffer (binary: true)
          // 2. Blob (binary: true, но некоторые версии)
          // 3. Object с glb/gltf полями (binary: false)
          // 4. String (JSON, binary: false)
          
          if (result instanceof ArrayBuffer) {
            resolve(result)
          } else if (result instanceof Blob) {
            // Если результат - Blob, конвертируем в ArrayBuffer
            result.arrayBuffer().then(resolve).catch(reject)
          } else if (result && typeof result === 'object') {
            // Проверяем наличие glb поля (некоторые версии экспортера)
            if (result.glb instanceof ArrayBuffer) {
              resolve(result.glb)
            } else if (result.glb instanceof Blob) {
              result.glb.arrayBuffer().then(resolve).catch(reject)
            } else if (result.buffer instanceof ArrayBuffer) {
              resolve(result.buffer)
            } else {
              // Если это объект с данными, пытаемся создать GLB вручную
              console.warn('[Client GLB Compressor] GLTFExporter returned object, trying to convert...')
              // Для binary: true экспортер должен вернуть ArrayBuffer
              // Если вернул объект, возможно нужно использовать другой подход
              reject(new Error('GLTFExporter returned object instead of ArrayBuffer. Try without dracoOptions or check Three.js version.'))
            }
          } else {
            reject(new Error(`Unexpected export result type: ${typeof result}`))
          }
        },
        {
          binary: true, // GLB формат
          dracoOptions: {
            quantization: {
              POSITION: quality,
              NORMAL: quality,
              COLOR: quality,
              TEX_COORD: quality,
            },
            compressionLevel: quality,
          },
        }
      )
    })

    const compressedBlob = new Blob([compressedGLB], { type: 'model/gltf-binary' })
    const compressedSize = compressedBlob.size
    const originalSize = file.size
    const reduction = ((1 - compressedSize / originalSize) * 100)

    console.log(`✅ [Client GLB Compressor] Сжатие завершено:`)
    console.log(`   Оригинал: ${(originalSize / (1024 * 1024)).toFixed(2)} MB`)
    console.log(`   Сжато: ${(compressedSize / (1024 * 1024)).toFixed(2)} MB`)
    console.log(`   Сжатие: ${reduction.toFixed(1)}%`)

    return {
      success: true,
      compressedBlob,
      originalSize,
      compressedSize,
      reduction,
    }
  } catch (error: any) {
    console.error('❌ [Client GLB Compressor] Ошибка сжатия:', error)
    return {
      success: false,
      compressedBlob: null,
      originalSize: file.size,
      compressedSize: 0,
      reduction: 0,
      error: error.message || 'Failed to compress GLB file',
    }
  }
}

/**
 * Проверить, нужно ли сжимать файл
 * @param file - Файл для проверки
 * @param thresholdMB - Порог в MB (default: 10MB)
 * @returns true если файл нужно сжимать
 */
export function shouldCompressInBrowser(file: File, thresholdMB: number = 10): boolean {
  const isGLB = file.name.toLowerCase().endsWith('.glb')
  const sizeMB = file.size / (1024 * 1024)
  return isGLB && sizeMB >= thresholdMB
}
