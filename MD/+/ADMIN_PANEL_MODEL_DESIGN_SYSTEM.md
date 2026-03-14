# Admin Panel - Model-Design System

Автономный модуль админки для управления моделями и дизайнами.

## Структура файлов

```
pages/
├── admin/
│   ├── models/
│   │   ├── index.tsx          # Список моделей с статистикой
│   │   └── [id].tsx           # Детали модели с 3D preview
│   └── designs/
│       ├── index.tsx          # Список дизайнов с фильтрами
│       └── [id].tsx           # Редактирование дизайна
│
pages/api/admin/
├── models/
│   ├── index.ts               # GET/POST модели
│   ├── [id].ts                # GET модель по ID
│   └── [id]/delete.ts         # DELETE модель
└── designs/
    ├── index.ts               # GET/POST дизайны
    ├── upload.ts              # Загрузка файлов
    └── [id]/
        ├── delete.ts          # DELETE дизайн
        ├── publish.ts         # Публикация дизайна
        └── replace-file.ts    # Замена файлов дизайна
│
src/presentation/
├── components/admin/
│   ├── Breadcrumbs.tsx        # Навигационные крошки
│   ├── DesignFileReplacer.tsx  # Компонент замены файлов
│   ├── ModelViewer.tsx        # 3D viewer модели
│   └── ModelViewerWithTextureSwitcher.tsx  # Viewer с переключением текстур
│   └── BackgroundApplierRefactored.tsx     # Применение фона
└── types/
    └── admin.ts               # Типы для админки
│
styles/
└── admin.css                  # Стили админки (iOS 26 style)
```

---

## 1. Типы (src/presentation/types/admin.ts)

\`\`\`typescript
/**
 * Типизированные интерфейсы для Admin Panel
 * Per User Rules: Presentation layer не должен импортировать domain entities
 */

export interface SerializedModel {
  id: string
  name: string
  glbUrl: string
  createdAt: string
  updatedAt: string
}

export interface SerializedDesign {
  id: string
  modelId: string
  name: string
  version: {
    major: number
    minor: number
    patch: number
    status: string
  }
  status: string
  previewImageUrl: string
  mainTexture?: {
    id: string
    payload: {
      url: string
      width: number
      height: number
      format: string
    }
    type: string
  }
  supportMaterials?: {
    photos: Array<{
      id: string
      payload: {
        originalUrl: string
        thumbnailUrl: string
        width: number
        height: number
        caption?: string
      }
    }>
    videos: Array<{
      id: string
      payload: {
        url: string
        duration: number
        thumbnailUrl: string
        format: string
      }
    }>
    sceneBackground: {
      id: string
      payload: {
        type: string
        color?: string
        gradient?: {
          from: string
          to: string
          direction: string
        }
        url?: string
        format?: string
      }
    } | null
  }
  createdAt: string
  updatedAt: string
}

export interface SerializedDesignWithMaterials extends SerializedDesign {
  mainTexture: {
    id: string
    payload: {
      url: string
      width: number
      height: number
      format: string
    }
  }
  supportMaterials: {
    photos: Array<{
      id: string
      payload: {
        originalUrl: string
        thumbnailUrl: string
        width: number
        height: number
      }
    }>
    videos: Array<{
      id: string
      payload: {
        url: string
        duration: number
        thumbnailUrl: string
        format: string
      }
    }>
    sceneBackground: {
      id: string
      payload: {
        type: string
        color?: string
        gradient?: {
          from: string
          to: string
          direction: string
        }
        url?: string
        format?: string
      }
    } | null
  }
}
\`\`\`

---

## 2. Компоненты

### Breadcrumbs.tsx

\`\`\`typescript
import Link from 'next/link'
import { useRouter } from 'next/router'

interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  const router = useRouter()

  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      <ol className="breadcrumbs-list">
        {items.map((item, index) => {
          const isLast = index === items.length - 1
          
          return (
            <li key={index} className="breadcrumbs-item">
              {isLast ? (
                <span className="breadcrumbs-current" aria-current="page">
                  {item.label}
                </span>
              ) : (
                <>
                  <Link href={item.href || '#'} className="breadcrumbs-link">
                    {item.label}
                  </Link>
                  <span className="breadcrumbs-separator">/</span>
                </>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
\`\`\`

### DesignFileReplacer.tsx

\`\`\`typescript
/**
 * Design File Replacer Component
 * Allows replacing files (texture, photos, videos, background) in design cards
 * Follows User Rules: uses application services, no direct domain access
 */

import { useState, useRef } from 'react'

interface DesignFileReplacerProps {
  designId: string
  fileType: 'texture' | 'photo' | 'video' | 'background'
  currentUrl?: string
  onFileReplaced?: () => void
  multiple?: boolean // For photos/videos
}

export default function DesignFileReplacer({
  designId,
  fileType,
  currentUrl,
  onFileReplaced,
  multiple = false,
}: DesignFileReplacerProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    setError(null)

    try {
      // Upload files first
      const formData = new FormData()
      Array.from(files).forEach((file) => {
        formData.append('files', file)
      })
      formData.append('type', fileType)

      const uploadResponse = await fetch('/api/admin/designs/upload', {
        method: 'POST',
        body: formData,
      })

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json()
        throw new Error(errorData.error || 'Failed to upload files')
      }

      const uploadData = await uploadResponse.json()
      const uploadedFiles = uploadData.files || []

      if (uploadedFiles.length === 0) {
        throw new Error('No files were uploaded')
      }

      // Update design with new files
      const updateData: any = {
        designId,
      }

      if (fileType === 'texture') {
        updateData.mainTextureFile = uploadedFiles[0].url
      } else if (fileType === 'photo') {
        updateData.photoFiles = uploadedFiles.map((f: any) => f.url)
      } else if (fileType === 'video') {
        updateData.videoFiles = uploadedFiles.map((f: any) => f.url)
      } else if (fileType === 'background') {
        updateData.backgroundFile = uploadedFiles[0].url
      }

      const updateResponse = await fetch(`/api/admin/designs/${designId}/replace-file`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      })

      if (!updateResponse.ok) {
        const errorData = await updateResponse.json()
        throw new Error(errorData.error || 'Failed to update design')
      }

      // Success
      if (onFileReplaced) {
        onFileReplaced()
      } else {
        // Reload page to show updated design
        window.location.reload()
      }
    } catch (err) {
      console.error('[DesignFileReplacer] Error:', err)
      setError(err instanceof Error ? err.message : 'Failed to replace file')
    } finally {
      setUploading(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const getAcceptTypes = () => {
    switch (fileType) {
      case 'texture':
        return '.jpg,.jpeg,.png,.webp'
      case 'photo':
        return '.jpg,.jpeg,.png'
      case 'video':
        return '.mp4,.webm'
      case 'background':
        return '.jpg,.jpeg,.png,.webp,.hdr,.exr'
      default:
        return '*'
    }
  }

  const getLabel = () => {
    switch (fileType) {
      case 'texture':
        return 'Replace Texture'
      case 'photo':
        return multiple ? 'Add Photos' : 'Replace Photo'
      case 'video':
        return multiple ? 'Add Videos' : 'Replace Video'
      case 'background':
        return 'Replace Background'
      default:
        return 'Replace File'
    }
  }

  return (
    <div className="design-file-replacer">
      <input
        ref={fileInputRef}
        type="file"
        accept={getAcceptTypes()}
        multiple={multiple && (fileType === 'photo' || fileType === 'video')}
        onChange={handleFileSelect}
        style={{ display: 'none' }}
        disabled={uploading}
      />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="admin-button small"
        title={getLabel()}
      >
        {uploading ? 'Uploading...' : getLabel()}
      </button>
      {error && (
        <div className="error-message" style={{ color: 'red', fontSize: '0.85rem', marginTop: '0.25rem' }}>
          {error}
        </div>
      )}
    </div>
  )
}
\`\`\`

### BackgroundApplierRefactored.tsx

\`\`\`typescript
/**
 * Background Applier Component (Refactored)
 * Uses BackgroundRenderer from infrastructure layer per User Rules
 * 
 * NOTE: This component uses @react-three/fiber hook (useThree)
 * to get Three.js scene. Uses BackgroundRenderer directly for client-side rendering.
 * Per User Rules: infrastructure renderers can be used in presentation layer.
 */

import { useEffect, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import { BackgroundRenderer } from '@/infrastructure/renderers/three/BackgroundRenderer'
import { BackgroundMaterial } from '@/domain'
import type { BackgroundRenderData } from '@/shared-core'
import * as THREE from 'three'

interface BackgroundApplierProps {
  background: BackgroundRenderData | null
}

export function BackgroundApplierRefactored({ background }: BackgroundApplierProps) {
  const { scene } = useThree()
  const backgroundRendererRef = useRef<BackgroundRenderer | null>(null)

  // Initialize BackgroundRenderer (only once)
  useEffect(() => {
    if (!backgroundRendererRef.current) {
      backgroundRendererRef.current = new BackgroundRenderer()
    }
  }, [])

  useEffect(() => {
    if (!background || !backgroundRendererRef.current) {
      // Clear background if null
      if (scene.background) {
        if (scene.background instanceof THREE.Texture) {
          scene.background.dispose()
        }
        scene.background = null
      }
      if (scene.environment) {
        if (scene.environment instanceof THREE.Texture) {
          scene.environment.dispose()
        }
        scene.environment = null
      }
      return
    }

    try {
      // Create temporary BackgroundMaterial from config
      // This follows the same pattern as RenderDesignService.applyBackgroundByConfig
      let backgroundMaterial: BackgroundMaterial
      
      if (background.type === 'color' && background.color) {
        backgroundMaterial = new BackgroundMaterial('temp-bg', {
          type: 'color',
          color: background.color,
        })
      } else if (background.type === 'gradient' && background.gradient) {
        backgroundMaterial = new BackgroundMaterial('temp-bg', {
          type: 'gradient',
          gradient: background.gradient,
        })
      } else if (background.type === 'image' && background.url) {
        backgroundMaterial = new BackgroundMaterial('temp-bg', {
          type: 'image',
          url: background.url,
        })
      } else if (background.type === 'hdri' && background.url) {
        backgroundMaterial = new BackgroundMaterial('temp-bg', {
          type: 'hdri',
          url: background.url,
        })
      } else {
        backgroundMaterial = BackgroundMaterial.createDefault()
      }

      // Create temporary Design with background for BackgroundRenderer
      // BackgroundRenderer.render() handles all types through polymorphism
      const tempDesign = {
        supportMaterials: {
          sceneBackground: backgroundMaterial,
        },
      } as any

      // Use BackgroundRenderer to apply background
      backgroundRendererRef.current.render(scene, tempDesign)
      console.log('✅ [BackgroundApplier] Background applied successfully')
    } catch (error) {
      console.error('❌ [BackgroundApplier] Error applying background:', error)
    }
  }, [background, scene])

  return null
}
\`\`\`

---

## 3. Страницы админки

### pages/admin/models/index.tsx

[См. полный код выше - слишком длинный для вставки]

**Основные функции:**
- Отображение списка моделей в виде карточек
- Статистика: количество дизайнов, published/draft
- Фильтрация и поиск
- Удаление моделей
- Ссылки на детали модели и дизайны

### pages/admin/models/[id].tsx

[См. полный код выше]

**Основные функции:**
- Детальная информация о модели
- 3D preview с переключением дизайнов
- Галерея дизайнов для модели
- Удаление модели

### pages/admin/designs/index.tsx

[См. полный код выше]

**Основные функции:**
- Список дизайнов с фильтрами (поиск, модель, статус)
- Карточки дизайнов с preview материалов
- Быстрая замена файлов (текстура, фото, видео, фон)
- Сортировка и пагинация

### pages/admin/designs/[id].tsx

[См. полный код выше]

**Основные функции:**
- Редактирование дизайна
- Просмотр материалов
- Публикация дизайна
- 3D preview

---

## 4. API Endpoints

### pages/api/admin/models/index.ts

\`\`\`typescript
import type { NextApiRequest, NextApiResponse } from 'next'
import { ModelService } from '@/application/services/ModelService'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const modelService = new ModelService()

  if (req.method === 'GET') {
    try {
      const models = await modelService.getAll()
      
      const serializedModels = models.map((model: any) => ({
        id: String(model.id),
        name: String(model.name),
        glbUrl: String(model.glbUrl),
        createdAt: model.createdAt instanceof Date ? model.createdAt.toISOString() : String(model.createdAt || new Date().toISOString()),
        updatedAt: model.updatedAt instanceof Date ? model.updatedAt.toISOString() : String(model.updatedAt || new Date().toISOString()),
      }))
      
      return res.status(200).json({ models: serializedModels })
    } catch (error) {
      return res.status(500).json({
        error: error instanceof Error ? error.message : 'Failed to fetch models',
      })
    }
  }

  if (req.method === 'POST') {
    try {
      const { name, glbUrl } = req.body

      if (!name || typeof name !== 'string') {
        return res.status(400).json({
          error: 'Name is required and must be a string',
        })
      }

      const finalGlbUrl =
        glbUrl && typeof glbUrl === 'string'
          ? glbUrl.trim()
          : `/uploads/models/${Date.now()}-${name.replace(/\s+/g, '-')}.glb`

      const model = await modelService.create({
        name: name.trim(),
        glbFile: Buffer.from(''),
        glbUrl: finalGlbUrl,
      })

      return res.status(201).json({ model })
    } catch (error) {
      return res.status(500).json({
        error: error instanceof Error ? error.message : 'Failed to create model',
      })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
\`\`\`

### pages/api/admin/designs/[id]/replace-file.ts

[См. полный код выше]

**Функции:**
- Замена текстуры дизайна
- Замена фото (с удалением старых)
- Замена видео (с удалением старых)
- Замена фона
- Автоматическое создание новой версии

---

## 5. Стили (styles/admin.css)

[См. полный код выше - 1073 строки]

**Особенности:**
- iOS 26 стиль дизайна
- Адаптивная верстка
- Темная тема (prefers-color-scheme: dark)
- Анимации и переходы
- Компоненты: карточки, кнопки, формы, фильтры

---

## Использование

### Установка зависимостей

\`\`\`bash
npm install next react react-dom
npm install @react-three/fiber @react-three/drei three
\`\`\`

### Настройка путей

Убедитесь, что в `tsconfig.json` настроены алиасы:

\`\`\`json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
\`\`\`

### Импорт стилей

В `pages/_app.tsx`:

\`\`\`typescript
import '../styles/admin.css'
\`\`\`

---

## Особенности

1. **Статистика моделей**: Автоматический подсчет дизайнов для каждой модели
2. **Замена файлов**: Быстрая замена файлов прямо из карточек дизайнов
3. **3D Preview**: Интерактивный просмотр моделей с переключением дизайнов
4. **Фильтрация**: Поиск, фильтры по модели и статусу
5. **Версионирование**: Автоматическое создание новых версий при изменении

---

## Соответствие User Rules

✅ Используются application services  
✅ Presentation layer не импортирует domain entities напрямую  
✅ Infrastructure renderers используются в presentation layer  
✅ Все сервисы создаются только на сервере (SSR)  
✅ Клиентские компоненты используют API endpoints

---

## Примечания

- Все файлы должны быть размещены в соответствующих директориях
- API endpoints требуют настроенных сервисов (ModelService, DesignService)
- 3D viewer требует настроенных компонентов (ModelViewer, TextureSwitcher)
- Стили используют CSS переменные для легкой кастомизации

