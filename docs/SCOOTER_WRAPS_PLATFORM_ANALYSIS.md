# Анализ рабочего компонента из scooter-wraps-platform

## Ключевые отличия рабочего проекта

### 1. ModelScene3DRefactored.tsx - Полная реализация

**Ключевые фичи:**
- ✅ **Сохранение оригинальных текстур из Blender** - `originalTexturesRef` хранит оригинальные текстуры по имени меша
- ✅ **Правильная очистка** - `cleanupPreviousDesign()` очищает только текстуры дизайна, сохраняя оригинальные
- ✅ **Клонирование сцены** - `clonedSceneRef` для избежания проблем с состоянием
- ✅ **Race condition handling** - `AbortController` для отмены предыдущих операций
- ✅ **Loading state** - с задержкой 200ms для оптимизации
- ✅ **Маркировка текстур** - `userData.isDesignTexture` и `userData.isOriginalTexture`

**Код сохранения оригинальных текстур:**
```typescript
// Сохраняем оригинальные текстуры перед применением дизайна
clonedScene.traverse((child) => {
  if (child instanceof THREE.Mesh) {
    const meshName = child.name || 'unnamed'
    if (mesh.material instanceof THREE.MeshStandardMaterial) {
      if (mesh.material.map) {
        originalTexturesRef.current.set(meshName, mesh.material.map)
        (mesh.material.map as any).userData.isOriginalTexture = true
      }
    }
  }
})
```

**Код восстановления оригинальных текстур:**
```typescript
// Восстанавливаем оригинальные текстуры при очистке дизайна
clonedScene.traverse((child) => {
  if (child instanceof THREE.Mesh) {
    const meshName = child.name || 'unnamed'
    const originalTexture = originalTexturesRef.current.get(meshName)
    if (originalTexture && child.material instanceof THREE.MeshStandardMaterial) {
      child.material.map = originalTexture
      child.material.needsUpdate = true
    }
  }
})
```

### 2. Hero.tsx - Управление состоянием

**Ключевые фичи:**
- ✅ **Debounce для design selection** - 50ms задержка для предотвращения rapid switching
- ✅ **Прямой импорт DesignGallery** - не через dynamic import
- ✅ **Правильная структура** - 3D viewer, controls, content

**Код debounce:**
```typescript
const designSelectTimeoutRef = useRef<NodeJS.Timeout | null>(null)

const handleDesignSelect = useCallback((designId: string) => {
  if (designSelectTimeoutRef.current) {
    clearTimeout(designSelectTimeoutRef.current)
  }
  designSelectTimeoutRef.current = setTimeout(() => {
    setCurrentDesignId(designId)
  }, 50)
}, [])
```

### 3. RenderDesignService.ts - Поддержка AbortSignal

**Ключевые фичи:**
- ✅ **AbortSignal support** - проверка `signal.aborted` перед каждой операцией
- ✅ **Обязательный repository** - не создает файловую систему на клиенте
- ✅ **Правильная обработка ошибок** - `DOMException` для AbortError

**Код AbortSignal:**
```typescript
async render3DSceneGroup(
  designId: string,
  scene: THREE.Scene,
  sceneGroup: THREE.Group,
  signal?: AbortSignal
): Promise<void> {
  if (signal?.aborted) {
    throw new DOMException('Operation aborted', 'AbortError')
  }
  
  const design = await this.designRepository.getById(designId)
  
  if (signal?.aborted) {
    throw new DOMException('Operation aborted', 'AbortError')
  }
  
  await this.textureRenderer.renderToScene(design.mainTexture, sceneGroup)
  
  if (signal?.aborted) {
    throw new DOMException('Operation aborted', 'AbortError')
  }
  
  this.backgroundRenderer.render(scene, design)
}
```

### 4. DesignGallery.tsx - Загрузка через API

**Ключевые фичи:**
- ✅ **Загрузка через API** - `/api/designs?modelId=${modelId}&published=true`
- ✅ **Правильная обработка ошибок** - с fallback на placeholder
- ✅ **Прямой импорт** - не через dynamic

## Что нужно адаптировать в текущем проекте

1. **ScooterViewer3DWithDesigns.tsx** - добавить:
   - Сохранение оригинальных текстур
   - Правильную очистку предыдущего дизайна
   - Клонирование сцены
   - Маркировку текстур

2. **app/page.tsx** - добавить:
   - Debounce для design selection
   - Улучшенную структуру компонентов

3. **RenderDesignService.ts** - проверить:
   - Поддержку AbortSignal (уже есть)
   - Правильную обработку ошибок

4. **lib/design-service-client.ts** - проверить:
   - Правильную инициализацию repository
   - Обработку domain entities




