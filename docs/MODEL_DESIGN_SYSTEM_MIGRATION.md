# Миграция Model-Design System согласно документации

## Выполнено

✅ Создана структура `components/model-design-system/` согласно `MODEL_DESIGN_SYSTEM_AUTONOMOUS.md`:
- `types.ts` - Типы и интерфейсы
- `domain.ts` - Domain entities (Design, Materials, DesignVersion)
- `renderers.ts` - Three.js renderers (TextureRenderer, BackgroundRenderer)
- `service.ts` - Application service (RenderDesignService)
- `component.tsx` - React компонент (ModelScene3D)

✅ Создана обертка `ModelScene3DWrapper.tsx` для интеграции с текущим UI:
- Адаптирует формат `selectedDesign` к `designId`
- Сохраняет параметры камеры из текущего UI
- Использует `next/dynamic` для предотвращения SSR проблем

✅ Интегрирован в `app/page.tsx`:
- Заменен `ScooterViewer3DClient` на `ModelScene3DWrapper`
- Сохранен текущий UI и параметры камеры

## Структура

```
components/
├── model-design-system/
│   ├── types.ts              # Типы и интерфейсы
│   ├── domain.ts             # Domain entities
│   ├── renderers.ts           # Three.js renderers
│   ├── service.ts             # Application service
│   └── component.tsx         # React компонент ModelScene3D
└── ModelScene3DWrapper.tsx   # Обертка для интеграции с UI
```

## Использование

Компонент `ModelScene3D` работает с `designId` (string), который загружает дизайн через API `/api/designs/${id}`.

Текущий формат `selectedDesign` с `{ id, name, texture, textures }` адаптируется через `ModelScene3DWrapper`, который извлекает `designId` из `selectedDesign.id`.

## Особенности

1. **Сохранение оригинальных текстур**: Оригинальные текстуры модели из Blender сохраняются постоянно
2. **UV-меши**: Дизайн-текстуры применяются только к UV-мешам (имена содержат "Texture_" или "UV_")
3. **Управление памятью**: Автоматическая очистка текстур и фонов
4. **Race conditions**: Обработка через AbortController
5. **Версионирование**: Поддержка версий дизайнов
6. **Фоны**: Поддержка цветов, градиентов, изображений и HDRI

## API Endpoint

Компонент ожидает API endpoint `/api/designs/[id]`, который должен возвращать данные в формате:

```json
{
  "design": {
    "id": "design-123",
    "modelId": "model-456",
    "name": "Design Name",
    "mainTexture": {
      "id": "texture-789",
      "payload": {
        "url": "/textures/texture.jpg",
        "width": 2048,
        "height": 2048,
        "format": "jpg"
      }
    },
    "supportMaterials": {
      "photos": [],
      "videos": [],
      "sceneBackground": null
    },
    "version": {
      "major": 1,
      "minor": 0,
      "patch": 0,
      "status": "published"
    },
    "status": "published",
    "previewImageUrl": "/previews/preview.jpg",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

## Примечания

- Система работает с моделями GLB/GLTF
- UV-меши определяются по имени (паттерны: `Texture_*`, `UV_*`)
- Оригинальные текстуры сохраняются по имени меша
- Все Three.js логика изолирована в renderers
- Domain entities не зависят от Three.js




