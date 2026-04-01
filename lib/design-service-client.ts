'use client'

/**
 * Клиентская обёртка для RenderDesignService
 * Изолирует Three.js зависимости от серверного кода
 */

import type * as THREE from 'three'

// Типы (без импорта классов)
interface DesignServiceConfig {
  selectedDesign?: {
    id?: string
    name?: string
    texture?: string
    textures?: {
      body?: string
      plastic?: string
      accents?: string
    }
    // Поддержка старого формата из designsData.ts
    image?: string
    modelId?: string
  }
}

interface DesignServiceInstance {
  render3DSceneGroup(
    designId: string,
    scene: THREE.Scene,
    group: THREE.Group,
    signal?: AbortSignal
  ): Promise<void>
}

let servicesCache: {
  RenderDesignService?: any
  TextureRenderer?: any
  BackgroundRenderer?: any
  Design?: any
  TextureMaterial?: any
  MaterialId?: any
  DesignId?: any
  MaterialFormat?: any
} | null = null

/**
 * Загружает все необходимые модули ОДИН РАЗ
 */
async function loadServiceModules() {
  // Проверка на клиент
  if (typeof window === 'undefined') {
    throw new Error('loadServiceModules can only be called on the client')
  }

  if (servicesCache) {
    return servicesCache
  }

  console.log('🔄 Loading service modules...')

  try {
    const [
      renderServiceModule,
      textureRendererModule,
      backgroundRendererModule,
      designModule,
      textureMaterialModule,
      valueObjectsModule,
      materialFormatModule,
    ] = await Promise.all([
      import('../src/application/services/RenderDesignService'),
      import('../src/infrastructure/renderers/TextureRenderer'),
      import('../src/infrastructure/renderers/BackgroundRenderer'),
      import('../src/domain/Design'),
      import('../src/domain/materials/TextureMaterial'),
      import('../src/shared-core/types/ValueObjects'),
      import('../src/shared-core/types/MaterialFormat'),
    ])

    servicesCache = {
      RenderDesignService: renderServiceModule.RenderDesignService,
      TextureRenderer: textureRendererModule.TextureRenderer,
      BackgroundRenderer: backgroundRendererModule.BackgroundRenderer,
      Design: designModule.Design,
      TextureMaterial: textureMaterialModule.TextureMaterial,
      MaterialId: valueObjectsModule.MaterialId,
      DesignId: valueObjectsModule.DesignId,
      MaterialFormat: materialFormatModule.MaterialFormat,
    }

    console.log('✅ Service modules loaded')
    return servicesCache
  } catch (error) {
    console.error('❌ Failed to load service modules:', error)
    throw error
  }
}

/**
 * Создаёт экземпляр RenderDesignService с repository
 * Соответствует документации MODEL_DESIGN_SYSTEM_AUTONOMOUS.md
 */
export async function createDesignService(
  config: DesignServiceConfig
): Promise<DesignServiceInstance> {
  const modules = await loadServiceModules()

  if (!modules) {
    throw new Error('Failed to load service modules')
  }

  const {
    RenderDesignService,
    TextureRenderer,
    BackgroundRenderer,
  } = modules

  // Загружаем ClientDesignRepository
  const { ClientDesignRepository } = await import('./client-design-repository')
  const repository = new ClientDesignRepository()

  // Создаём сервис с repository (как в документации)
  const service = new RenderDesignService(
    repository, // IDesignRepository в первом параметре
    new TextureRenderer(),
    new BackgroundRenderer()
  )

  // Возвращаем обёртку с методом для применения дизайна
  // Соответствует документации DESIGN_TO_3D_CONNECTION.md
  return {
    async render3DSceneGroup(
      designId: string,
      scene: THREE.Scene,
      group: THREE.Group,
      signal?: AbortSignal
    ): Promise<void> {
      // Используем designId для загрузки через repository
      // Это соответствует документации: RenderDesignService.render3DSceneGroup(designId, scene, sceneGroup)
      if (!designId || designId === 'temp-design') {
        console.warn('⚠️ [DesignService] Invalid designId:', designId)
        return
      }

      console.log('🎨 [DesignService] Applying design via repository:', {
        designId,
        hasRepository: !!repository
      })

      // ✅ Применяем дизайн через сервис (загружает через repository)
      // Это соответствует документации MODEL_DESIGN_SYSTEM_AUTONOMOUS.md и DESIGN_TO_3D_CONNECTION.md
      // Сервис загрузит дизайн через repository.getById(designId) и применит текстуру и фон
      await service.render3DSceneGroup(designId, scene, group, signal)
    },
  }
}

/**
 * Очищает кэш модулей (для hot reload)
 */
export function clearServicesCache() {
  servicesCache = null
}

