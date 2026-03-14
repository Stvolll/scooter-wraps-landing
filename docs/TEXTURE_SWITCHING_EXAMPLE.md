# Пример использования динамической смены текстур

## 🎯 Быстрый старт

### Пример 1: Базовое использование с одной текстурой

```tsx
import ScooterViewer3D from '@/components/ScooterViewer3D'

function MyComponent() {
  return (
    <ScooterViewer3D
      modelPath="/models/MODEL_Honda SH160i_.glb"
      selectedDesign={{
        id: 'design-01',
        name: 'Neon Blade',
        texture: '/textures/designs/neon-blade.webp'
      }}
    />
  )
}
```

### Пример 2: Использование с несколькими текстурами

```tsx
import ScooterViewer3D from '@/components/ScooterViewer3D'

function MyComponent() {
  const design = {
    id: 'design-01',
    name: 'Racing Stripes',
    textures: {
      body: '/textures/designs/racing-body.webp',
      plastic: '/textures/designs/racing-plastic.webp',
      accents: '/textures/designs/racing-accents.webp'
    }
  }

  return (
    <ScooterViewer3D
      modelPath="/models/MODEL_Honda SH160i_.glb"
      selectedDesign={design}
    />
  )
}
```

### Пример 3: Интеграция с карточками дизайнов

```tsx
'use client'

import { useState } from 'react'
import ScooterViewer3D from '@/components/ScooterViewer3D'

const designs = [
  {
    id: '01',
    name: 'Neon Blade',
    textures: {
      body: '/textures/designs/neon-blade-body.webp',
      plastic: '/textures/designs/neon-blade-plastic.webp',
      accents: '/textures/designs/neon-blade-accents.webp'
    },
    preview: '/images/previews/neon-blade.jpg'
  },
  {
    id: '02',
    name: 'Carbon Fiber',
    textures: {
      body: '/textures/designs/carbon-body.webp',
      plastic: '/textures/designs/carbon-plastic.webp',
      accents: '/textures/designs/carbon-accents.webp'
    },
    preview: '/images/previews/carbon.jpg'
  },
  // ... другие дизайны
]

export default function DesignGallery() {
  const [selectedDesign, setSelectedDesign] = useState(designs[0])

  return (
    <div className="flex gap-6">
      {/* 3D Viewer */}
      <div className="flex-1 h-[600px]">
        <ScooterViewer3D
          modelPath="/models/MODEL_Honda SH160i_.glb"
          selectedDesign={selectedDesign}
        />
      </div>

      {/* Design Cards */}
      <div className="w-80 space-y-4">
        {designs.map(design => (
          <div
            key={design.id}
            onClick={() => setSelectedDesign(design)}
            className={`p-4 rounded-xl cursor-pointer ${
              selectedDesign.id === design.id
                ? 'bg-[#00FFA9]/20 border-2 border-[#00FFA9]'
                : 'bg-white/5 border border-white/10 hover:bg-white/10'
            }`}
          >
            <img
              src={design.preview}
              alt={design.name}
              className="w-full h-32 object-cover rounded-lg mb-2"
            />
            <h3 className="text-white font-semibold">{design.name}</h3>
          </div>
        ))}
      </div>
    </div>
  )
}
```

## 🔧 Настройка имен материалов в Blender

Для правильной работы системы именуйте материалы в Blender следующим образом:

### Рекомендуемые имена:

- **Body материалы**: `Body`, `Main`, `Primary`, `Base`
- **Plastic материалы**: `Plastic`, `Trim`, `Secondary`
- **Accents материалы**: `Accent`, `Detail`, `Highlight`, `Decoration`

### Пример структуры в Blender:

```
Model_Honda_SH160i
├── Body_Main (материал)
├── Plastic_Trim (материал)
└── Accent_Detail (материал)
```

## 📁 Структура файлов

```
public/
├── models/
│   └── MODEL_Honda SH160i_.glb
└── textures/
    └── designs/
        ├── neon-blade-body.webp
        ├── neon-blade-plastic.webp
        ├── neon-blade-accents.webp
        ├── carbon-body.webp
        ├── carbon-plastic.webp
        └── carbon-accents.webp
```

## ✅ Проверка работы

1. Откройте консоль браузера (F12)
2. Выберите дизайн из карточек
3. Проверьте логи:
   - `🎨 [ScooterViewer3D] Loading texture:` - текстуры загружаются
   - `✅ [ScooterViewer3D] Texture applied:` - текстуры применены
   - `📊 [ScooterViewer3D] Texture application:` - статистика

4. При повторном выборе того же дизайна текстуры должны загрузиться мгновенно (из кеша)

## 🐛 Решение проблем

### Текстуры не применяются

1. Проверьте имена материалов в Blender
2. Убедитесь, что материалы содержат ключевые слова (body, plastic, accents)
3. Проверьте пути к текстурам в консоли

### Текстуры не соответствуют UV

1. Убедитесь, что текстуры созданы на основе правильных SVG-лекал
2. Проверьте, что UV-координаты в Blender соответствуют лекалам
3. Экспортируйте UV-лекала из Blender и сравните с текстурами

### Производительность

1. Используйте формат `.webp` для лучшего сжатия
2. Оптимизируйте разрешение текстур (2048x2048px достаточно)
3. Кеширование работает автоматически






