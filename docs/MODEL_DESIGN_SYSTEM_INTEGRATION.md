# Интеграция модуля Модель-Дизайн в проект

## 📋 Обзор

Модуль Модель-Дизайн и админка успешно интегрированы в текущий проект `scooter-wraps-landing`.

## ✅ Выполненные задачи

### 1. Обновлен PROJECT_STATE.md
- Добавлена информация о текущих настройках 3D сцены
- Зафиксированы параметры камеры (Orbit: -90deg 90deg 2.5m, Target: 0m 0.5m 0m, FOV: 30deg)
- Зафиксированы правила позиционирования моделей (Position: 0,0,0, Rotation: 0,0,0, Scale: 1,1,1)
- Добавлена информация о UI стилях (iOS 26 Glassmorphism)

### 2. Созданы типы для админки
**Файл:** `src/presentation/types/admin.ts`
- `SerializedModel` - сериализованная модель
- `SerializedDesign` - сериализованный дизайн
- `SerializedDesignWithMaterials` - дизайн с материалами

### 3. Созданы компоненты админки
**Директория:** `src/presentation/components/admin/`

- **Breadcrumbs.tsx** - навигационные крошки
- **DesignFileReplacer.tsx** - компонент замены файлов (текстура, фото, видео, фон)
- **BackgroundApplierRefactored.tsx** - применение фона в 3D сцене

### 4. Создан API endpoint для замены файлов
**Файл:** `app/api/admin/designs/[id]/replace-file/route.ts`
- POST `/api/admin/designs/[id]/replace-file`
- Поддерживает замену:
  - `mainTextureFile` - основная текстура
  - `photoFiles` - массив фото
  - `videoFiles` - массив видео
  - `backgroundFile` - фон сцены
- Автоматически удаляет старые файлы при замене

## 🔧 Использование существующих сервисов

Модуль использует существующую архитектуру проекта:

- **RenderDesignService** (`src/application/services/RenderDesignService.ts`)
- **TextureRenderer** (`src/infrastructure/renderers/TextureRenderer.ts`)
- **BackgroundRenderer** (`src/infrastructure/renderers/BackgroundRenderer.ts`)
- **DesignService** (`src/application/services/DesignService.ts`)
- **ApplicationContext** (`src/application/ApplicationContext.ts`)

## 📁 Структура файлов

```
src/presentation/
├── types/
│   └── admin.ts                    # Типы для админки
└── components/
    └── admin/
        ├── Breadcrumbs.tsx         # Навигация
        ├── DesignFileReplacer.tsx  # Замена файлов
        └── BackgroundApplierRefactored.tsx  # Применение фона

app/api/admin/designs/[id]/
└── replace-file/
    └── route.ts                    # API endpoint для замены файлов
```

## 🎯 Особенности реализации

### Соответствие User Rules
✅ Используются application services  
✅ Presentation layer не импортирует domain entities напрямую  
✅ Infrastructure renderers используются в presentation layer  
✅ Все сервисы создаются только на сервере (SSR)  
✅ Клиентские компоненты используют API endpoints

### Адаптация под текущую структуру
- Используется `app/` вместо `pages/` (Next.js App Router)
- Используются существующие сервисы из `src/application/` и `src/infrastructure/`
- API endpoints используют Next.js 16 App Router формат (`route.ts`)
- Компоненты используют `'use client'` директиву для клиентских компонентов

## 📝 Использование компонентов

### Breadcrumbs
```tsx
import Breadcrumbs from '@/src/presentation/components/admin/Breadcrumbs'

<Breadcrumbs items={[
  { label: 'Admin', href: '/admin' },
  { label: 'Models', href: '/admin/models' },
  { label: model.name }
]} />
```

### DesignFileReplacer
```tsx
import DesignFileReplacer from '@/src/presentation/components/admin/DesignFileReplacer'

<DesignFileReplacer
  designId={design.id}
  fileType="texture"
  currentUrl={design.mainTexture?.payload.url}
  onFileReplaced={() => {
    // Обновить UI после замены
  }}
/>
```

### BackgroundApplierRefactored
```tsx
import { BackgroundApplierRefactored } from '@/src/presentation/components/admin/BackgroundApplierRefactored'

// Внутри Canvas компонента
<BackgroundApplierRefactored
  background={{
    type: 'image',
    url: '/images/background.jpg'
  }}
/>
```

## 🔄 API Endpoints

### POST /api/admin/designs/[id]/replace-file
Замена файлов дизайна.

**Request Body:**
```json
{
  "designId": "design-123",
  "mainTextureFile": "/uploads/textures/texture.jpg",
  "photoFiles": ["/uploads/photos/photo1.jpg"],
  "videoFiles": ["/uploads/videos/video1.mp4"],
  "backgroundFile": "/uploads/backgrounds/bg.hdr"
}
```

**Response:**
```json
{
  "success": true,
  "design": { /* обновленный дизайн */ },
  "message": "Files replaced successfully"
}
```

## 📚 Связанные документы

- `PROJECT_STATE.md` - текущее состояние проекта
- `docs/3D_MODEL_POSITIONING_RULES.md` - правила позиционирования 3D моделей
- `docs/ARCHITECTURE_PRINCIPLES.md` - архитектурные принципы
- `MD/MODEL_DESIGN_SYSTEM_AUTONOMOUS.md` - автономный код системы
- `MD/ADMIN_PANEL_MODEL_DESIGN_SYSTEM.md` - документация админки

## ⚠️ Важные замечания

1. **Сохранение оригинальных текстур**: Система сохраняет оригинальные текстуры модели из Blender (wheels, seat, etc.)

2. **UV-меши**: Дизайн-текстуры применяются только к UV-мешам (имена содержат "Texture_", "UV_", или паттерны body/plastic/accents)

3. **Позиционирование моделей**: Все модели автоматически центрируются при загрузке (см. `docs/3D_MODEL_POSITIONING_RULES.md`)

4. **Версионирование**: При замене файлов автоматически обновляется `updatedAt`, но версионирование дизайнов должно быть реализовано отдельно

## 🚀 Следующие шаги

1. Обновить существующие страницы админки для использования новых компонентов
2. Добавить стили админки (если нужно)
3. Реализовать версионирование дизайнов при замене файлов
4. Добавить валидацию файлов при загрузке

---

**Дата создания:** 2025-01-XX  
**Версия:** 1.0.0




