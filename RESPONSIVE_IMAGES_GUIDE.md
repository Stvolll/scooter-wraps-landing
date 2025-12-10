# Responsive Images Guide

Руководство по использованию responsive изображений в проекте.

## Что сделано

### 1. Скрипт генерации responsive изображений

Создан `scripts/generate-responsive-images.js`, который:

- Находит все изображения в `public/images/designs/`
- Генерирует версии для разных размеров экрана:
  - `mobile` (640px)
  - `tablet` (1024px)
  - `desktop` (1920px)
  - `2x` (3840px) - Retina
- Конвертирует в WebP или AVIF формат
- Создает `manifest.json` с метаданными

### 2. Интеграция в процесс билда

Добавлен `prebuild` скрипт в `package.json`:

```json
"prebuild": "npm run generate:responsive"
```

Теперь при каждом билде автоматически генерируются responsive версии.

### 3. Замена `<img>` на `<Image>`

Все компоненты обновлены для использования `next/image`:

- ✅ `components/DesignCard.tsx`
- ✅ `components/admin/SKUForm.tsx`
- ✅ `components/admin/SKUPreview.tsx`
- ✅ `app/designs/[model]/[slug]/page.tsx`
- ✅ `components/DesignModal.jsx`
- ✅ `components/CheckoutModal.tsx`
- ✅ `components/Reviews.tsx`
- ✅ `components/ProductionQC.tsx`
- ✅ `components/DesignCatalog.tsx`

### 4. Добавлены alt атрибуты

Все изображения теперь имеют описательные alt атрибуты для доступности.

## Использование

### Генерация responsive изображений

```bash
# WebP формат (по умолчанию)
npm run generate:responsive

# AVIF формат (лучшее сжатие)
npm run generate:responsive -- --format=avif
```

### Структура после генерации

```
public/images/designs/
├── honda lead/
│   ├── honda-lead-0.jpg (оригинал)
│   └── ...
└── optimized/
    └── honda lead/
        ├── honda-lead-0.mobile.webp
        ├── honda-lead-0.tablet.webp
        ├── honda-lead-0.desktop.webp
        ├── honda-lead-0.2x.webp
        └── manifest.json
```

### Использование в компонентах

```tsx
import Image from 'next/image'
;<Image
  src="/images/designs/honda-lead/honda-lead-0.jpg"
  alt="Honda Lead Design"
  fill
  className="object-cover"
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
/>
```

## Преимущества

- ✅ **Автоматическая оптимизация** - Next.js оптимизирует изображения на лету
- ✅ **Lazy loading** - изображения загружаются по мере необходимости
- ✅ **Responsive** - правильные размеры для разных экранов
- ✅ **WebP/AVIF** - современные форматы с лучшим сжатием
- ✅ **SEO** - правильные alt атрибуты
- ✅ **Производительность** - уменьшение размера страницы

## Примечания

- SVG логотипы в `Header.tsx` и `ScooterViewer.jsx` оставлены как `<img>` (Next.js Image не всегда хорошо работает с SVG и фильтрами)
- Изображения из CDN/S3 автоматически поддерживаются через `remotePatterns` в `next.config.js`
- Manifest файл содержит все метаданные для программного использования

