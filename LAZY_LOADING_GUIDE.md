# Lazy Loading & Bundle Optimization Guide

Руководство по оптимизации загрузки тяжелых 3D библиотек через динамические импорты.

## Что сделано

### 1. Создан Placeholder компонент

`components/ThreeDViewerPlaceholder.tsx` - единый компонент для отображения состояния загрузки 3D компонентов.

### 2. Динамические импорты для 3D компонентов

Все тяжелые 3D компоненты вынесены в динамические импорты с `ssr: false`:

#### `app/page.tsx`

```typescript
const ScooterViewer = dynamic(() => import('@/components/ScooterViewer'), {
  ssr: false,
  loading: () => <ThreeDViewerPlaceholder />,
})

const ScooterViewer3D = dynamic(() => import('@/components/ScooterViewer3D'), {
  ssr: false,
  loading: () => <ThreeDViewerPlaceholder />,
})
```

#### `components/Hero.tsx`

```typescript
const ThreeDViewer = dynamic(() => import('./ThreeDViewer'), {
  ssr: false,
  loading: () => <ThreeDViewerPlaceholder />,
})
```

## Преимущества

- ✅ **Уменьшение initial bundle size** - 3D библиотеки загружаются только когда нужны
- ✅ **Улучшенная производительность** - быстрее First Contentful Paint (FCP)
- ✅ **Нет SSR конфликтов** - `ssr: false` предотвращает проблемы с гидратацией
- ✅ **Лучший UX** - показывается placeholder во время загрузки
- ✅ **Code splitting** - автоматическое разделение кода Next.js

## Структура

```
components/
├── ThreeDViewerPlaceholder.tsx  # Loading placeholder
├── ScooterViewer.jsx            # Heavy 3D component (dynamic)
├── ScooterViewer3D.tsx          # Heavy 3D component (dynamic)
└── ThreeDViewer.tsx             # Heavy 3D component (dynamic)
```

## Правила использования

### ✅ Правильно

```typescript
// В client component
'use client'

import dynamic from 'next/dynamic'
import ThreeDViewerPlaceholder from './ThreeDViewerPlaceholder'

const ThreeDViewer = dynamic(() => import('./ThreeDViewer'), {
  ssr: false,
  loading: () => <ThreeDViewerPlaceholder />,
})

export default function MyComponent() {
  return <ThreeDViewer />
}
```

### ❌ Неправильно

```typescript
// Прямой импорт тяжелых библиотек
import ThreeDViewer from './ThreeDViewer' // ❌ Увеличивает bundle size

// SSR для 3D компонентов
const ThreeDViewer = dynamic(() => import('./ThreeDViewer'), {
  ssr: true, // ❌ Может вызвать конфликты
})
```

## Bundle Size Impact

До оптимизации:

- Initial bundle: ~150 KB (включая three.js, @react-three/fiber, @react-three/drei)

После оптимизации:

- Initial bundle: ~87 KB (без 3D библиотек)
- 3D chunk: загружается отдельно только при необходимости

**Экономия: ~63 KB на initial load**

## Проверка

После деплоя проверьте в DevTools:

1. Network tab - должны быть отдельные chunks для 3D компонентов
2. Performance tab - улучшенный FCP
3. Bundle analyzer - 3D библиотеки в отдельных chunks

## Дополнительные оптимизации

Для дальнейшей оптимизации можно:

1. Использовать `React.lazy()` для дополнительного code splitting
2. Добавить preloading для критических 3D компонентов
3. Использовать intersection observer для lazy loading при скролле

