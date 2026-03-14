// API utility functions для работы с моделями скутеров

export interface ScooterDesign {
  id: string
  name: string
  slug: string
  texture?: string
  preview?: string
  images?: string[]
  video?: string
  description?: string
  price?: string
  editions?: number
  available?: number
}

export interface ScooterModel {
  id: string
  name: string
  model: string
  panorama?: string
  designs: ScooterDesign[]
}

export type ScootersData = Record<string, ScooterModel>

/**
 * Получить все модели скутеров с их дизайнами
 * @returns Promise с данными моделей
 */
export async function getScooters(): Promise<ScootersData> {
  try {
    const response = await fetch('/api/scooters', {
      next: { revalidate: 60 }, // Кэшируем на 60 секунд
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch scooters: ${response.statusText}`)
    }

    const data = await response.json()
    return data.scooters
  } catch (error) {
    console.error('Error fetching scooters:', error)
    // Fallback на статический импорт если API не работает
    const { scooters } = await import('@/config/scooters')
    return scooters
  }
}

/**
 * Получить конкретную модель скутера
 * @param modelId - ID модели (slug)
 * @returns Promise с данными модели или null
 */
export async function getScooterModel(modelId: string): Promise<ScooterModel | null> {
  const scooters = await getScooters()
  return scooters[modelId] || null
}

/**
 * Получить конкретный дизайн
 * @param modelId - ID модели
 * @param designId - ID дизайна
 * @returns Promise с данными дизайна или null
 */
export async function getScooterDesign(
  modelId: string,
  designId: string
): Promise<(ScooterDesign & { modelName: string; modelPath: string }) | null> {
  const model = await getScooterModel(modelId)
  if (!model) return null

  const design = model.designs.find((d) => d.id === designId || d.slug === designId)
  if (!design) return null

  return {
    ...design,
    modelName: model.name,
    modelPath: model.model,
  }
}

/**
 * Получить все дизайны всех моделей (плоский список)
 * @returns Promise с массивом дизайнов
 */
export async function getAllDesigns(): Promise<
  Array<ScooterDesign & { modelId: string; modelName: string }>
> {
  const scooters = await getScooters()
  const designs: Array<ScooterDesign & { modelId: string; modelName: string }> = []

  for (const [modelId, model] of Object.entries(scooters)) {
    for (const design of model.designs) {
      designs.push({
        ...design,
        modelId,
        modelName: model.name,
      })
    }
  }

  return designs
}

/**
 * Admin API: Получить все модели для админки
 */
export async function getAdminModels(): Promise<ScootersData> {
  try {
    const response = await fetch('/api/admin/models')

    if (!response.ok) {
      throw new Error(`Failed to fetch admin models: ${response.statusText}`)
    }

    const data = await response.json()
    return data.models
  } catch (error) {
    console.error('Error fetching admin models:', error)
    throw error
  }
}

/**
 * Admin API: Создать новую модель
 */
export async function createModel(data: {
  name: string
  id: string
  model: string
  panorama?: string
}): Promise<ScooterModel> {
  const response = await fetch('/api/admin/models', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to create model')
  }

  const result = await response.json()
  return result.model
}

/**
 * Admin API: Обновить модель
 */
export async function updateModel(
  id: string,
  data: { name?: string; model?: string; panorama?: string }
): Promise<ScooterModel> {
  const response = await fetch(`/api/admin/models/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to update model')
  }

  const result = await response.json()
  return result.model
}

/**
 * Admin API: Удалить модель
 */
export async function deleteModel(id: string): Promise<void> {
  const response = await fetch(`/api/admin/models/${id}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to delete model')
  }
}






