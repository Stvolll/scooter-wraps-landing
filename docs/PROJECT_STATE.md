# PROJECT_STATE.md

Документ описывает текущее состояние проекта: компоненты, данные, стили и их использование.

---

## 1. Все компоненты карточек

### 1.1 LandingDesignCard.tsx
- **Путь:** `components/LandingDesignCard.tsx`
- **Строк кода:** 220
- **Props:**
```typescript
interface LandingDesignCardProps {
  design: any
  modelName: string
  modelId: string
  index: number
  isSelected: boolean
  onImageClick: () => void
  onDetailsClick: () => void
}
```
- **Использование:**
  - `app/page.tsx` - главная страница, отображение дизайнов в горизонтальном скролле
  - Пример:
```tsx
<LandingDesignCard
  design={design}
  modelName={modelName}
  modelId={modelId}
  index={index}
  isSelected={selectedDesign?.id === design.id}
  onImageClick={() => handleDesignSelect(design)}
  onDetailsClick={() => router.push(`/designs/${modelId}/${design.id}`)}
/>
```
- **Особенности:**
  - iOS 26 Glassmorphism стиль
  - Framer Motion анимации (hover, scale, y)
  - Поддержка статусов: FOR_SALE, SOLD, IN_DEVELOPMENT
  - Приоритет изображений: preview > coverImage > images[0] > materials (cover) > materials (photo) > textureUrl
  - Мультиязычность через `useLanguage()`

---

### 1.2 DesignCard.tsx
- **Путь:** `components/DesignCard.tsx`
- **Строк кода:** 101
- **Props:**
```typescript
interface DesignCardProps {
  design: {
    id: string
    name: string
    slug: string
    texture_webp: string | null
    bg_webp: string | null
    design_info: {
      film_type: string | null
      seo_title: string
    }
    media: string[]
    preview: string | null
    description: string | null
    price: string | undefined
    editions: number
    available: number
  }
  onClick?: () => void
  isSelected?: boolean
}
```
- **Использование:**
  - `app/model/[id]/page.tsx` - страница модели, отображение дизайнов в табах
  - Пример:
```tsx
<DesignCard
  design={design}
  onClick={() => setSelectedDesignIndex(index)}
  isSelected={selectedDesignIndex === index}
/>
```
- **Особенности:**
  - Поддержка `bg_webp` для 3D preview эффекта
  - Badge с типом пленки (`film_type`)
  - Отображение доступности: `available / editions`

---

### 1.3 PrismaDesignCard.tsx
- **Путь:** `components/PrismaDesignCard.tsx`
- **Строк кода:** 96
- **Props:**
```typescript
{
  design: any // Prisma Design object
}
```
- **Использование:**
  - Админ панель (вероятно)
  - Отображение дизайнов из базы данных Prisma
- **Особенности:**
  - iOS 26 Glassmorphism стиль
  - Отображение стадий разработки (`stages`)
  - Статусы: Published, In Development, Sold Out
  - Кнопки: "Buy / Deal Open", "In Development", "Sold Out"

---

### 1.4 GalleryCard.tsx
- **Путь:** `components/GalleryCard.tsx`
- **Строк кода:** 96
- **Props:**
```typescript
interface GalleryCardProps {
  design: Design // из @/lib/designsData
  language: 'en' | 'vi'
  onClick: () => void
}
```
- **Использование:**
  - Галерея дизайнов (вероятно `app/designs/page.tsx` или секция Gallery)
- **Особенности:**
  - Использует класс `premium-card` из `globals.css`
  - Framer Motion анимация `whileHover={{ y: -8 }}`
  - Поддержка мультиязычности (en/vi)
  - Badge "NEW" для новых дизайнов
  - Теги стилей (`style` массив)
  - Цена с опцией "from $" (`priceFrom`)

---

## 2. Все 3D компоненты

### 2.1 ScooterViewer3D.tsx
- **Путь:** `components/ScooterViewer3D.tsx`
- **Строк кода:** 907
- **Что делает:**
  - Основной 3D viewer с React Three Fiber
  - Поддержка множественных текстур (body, plastic, accents)
  - Кэширование текстур
  - Динамическое освещение на основе rotationY
  - OrbitControls с autoRotate (скорость 0.5)
  - Panorama background поддержка
  - Параметры камеры: theta: -90, phi: 90, radius: 2.5, target: (0, 0.5, 0), FOV: 30
  - Material-specific texture application по именам мешей/материалов

---

### 2.2 ScooterViewer3DWithDesigns.tsx
- **Путь:** `components/ScooterViewer3DWithDesigns.tsx`
- **Строк кода:** 400
- **Что делает:**
  - Интеграция нового движка Model-Design
  - Сохраняет ВСЕ визуальные параметры из ScooterViewer3D.tsx
  - Использует `RenderDesignService` для применения дизайнов
  - Динамическое освещение (полностью сохранено)
  - Клиентская обёртка для изоляции Three.js зависимостей

---

### 2.3 ScooterViewer3DClient.tsx
- **Путь:** `components/ScooterViewer3DClient.tsx`
- **Строк кода:** 73
- **Что делает:**
  - Клиентская обёртка для ScooterViewer3D.tsx
  - Предотвращает SSR ошибки (ReactCurrentOwner)
  - Использует `dynamic` import с `ssr: false`
  - Проверка `isMounted` перед рендерингом

---

### 2.4 ScooterViewer3DWithDesignsWrapper.tsx
- **Путь:** `components/ScooterViewer3DWithDesignsWrapper.tsx`
- **Строк кода:** 61
- **Что делает:**
  - Wrapper для ScooterViewer3DWithDesigns
  - Suspense boundary с ThreeDViewerPlaceholder
  - Безопасный импорт для избежания SSR проблем

---

### 2.5 SafeScooterViewer.tsx
- **Путь:** `components/SafeScooterViewer.tsx`
- **Строк кода:** 307
- **Что делает:**
  - Использует Google's `<model-viewer>` Web Component
  - НЕ требует Three.js на сервере
  - Параметры из OLD_SITE_ANALYSIS.md: camera-orbit="-90deg 90deg 2.5m", camera-target="0m 0.5m 0m", field-of-view="30deg"
  - Fallback на случай ошибок загрузки
  - WebGL проверка

---

### 2.6 ClientScooterViewer.tsx
- **Путь:** `components/ClientScooterViewer.tsx`
- **Строк кода:** 165
- **Что делает:**
  - Клиентский компонент с безопасной загрузкой Three.js
  - Динамический импорт SceneRenderer
  - Проверка `isClient` перед рендерингом
  - Suspense с ScooterViewerLoading

---

### 2.7 AdminScooterViewer.tsx
- **Путь:** `components/AdminScooterViewer.tsx`
- **Строк кода:** 611
- **Что делает:**
  - Упрощённый 3D viewer для админ панели
  - Без зависимостей на @/src/ модули
  - Только React Three Fiber
  - Сохраняет параметры камеры и освещения
  - Props: `modelPath`, `textures?`, `panoramaUrl?`

---

### 2.8 ScooterViewer.jsx
- **Путь:** `components/ScooterViewer.jsx`
- **Строк кода:** 1869
- **Что делает:**
  - Старый компонент (JSX, не TypeScript)
  - Вероятно legacy код
  - Большой размер - возможно содержит много логики

---

### 2.9 ThreeDViewer.tsx
- **Путь:** `components/ThreeDViewer.tsx`
- **Строк кода:** 192
- **Что делает:**
  - Общий 3D viewer компонент
  - Вероятно используется в разных местах

---

### 2.10 DesignTextureViewer.tsx
- **Путь:** `components/DesignTextureViewer.tsx`
- **Строк кода:** 101
- **Что делает:**
  - Просмотр текстур дизайна
  - Вероятно для админ панели или детальной страницы дизайна

---

### 2.11 Hero3DShowcase.tsx
- **Путь:** `components/Hero3DShowcase.tsx`
- **Строк кода:** 263
- **Что делает:**
  - Hero секция с 3D showcase
  - Вероятно для главной страницы

---

### 2.12 Вспомогательные компоненты:
- **ScooterViewerLoading.tsx** (18 строк) - загрузочный экран
- **ScooterViewerFallback.tsx** (46 строк) - fallback при ошибках
- **ThreeDViewerPlaceholder.tsx** (21 строка) - placeholder для Suspense

---

## 3. Где используются карточки

### 3.1 LandingDesignCard
**Файл:** `app/page.tsx`
```tsx
import LandingDesignCard from '@/components/LandingDesignCard'

// Использование в горизонтальном скролле:
<LandingDesignCard
  design={design}
  modelName={modelName}
  modelId={modelId}
  index={index}
  isSelected={selectedDesign?.id === design.id}
  onImageClick={() => handleDesignSelect(design)}
  onDetailsClick={() => router.push(`/designs/${modelId}/${design.id}`)}
/>
```

---

### 3.2 DesignCard
**Файл:** `app/model/[id]/page.tsx`
```tsx
import DesignCard from '@/components/DesignCard'

// Использование в табах дизайнов:
<DesignCard
  design={design}
  onClick={() => setSelectedDesignIndex(index)}
  isSelected={selectedDesignIndex === index}
/>
```

---

### 3.3 GalleryCard
**Использование:** Вероятно в секции Gallery или на странице `/designs`

---

### 3.4 PrismaDesignCard
**Использование:** Админ панель (точное место не найдено в grep)

---

## 4. Где хранятся данные дизайнов

### 4.1 lib/designsData.ts
- **Путь:** `lib/designsData.ts`
- **Тип:** TypeScript файл с mock данными
- **Структура:**
```typescript
export interface Design {
  id: string
  modelId: string
  slug: string
  name: string
  nameVi: string
  description: string
  descriptionVi: string
  price: number
  priceFrom?: boolean
  image: string
  style: string[]
  includedPanels: string[]
  isNew?: boolean
}
```
- **Пример первого дизайна:**
```typescript
{
  id: '1',
  modelId: 'honda-lead-110',
  slug: 'design-0',
  name: 'Design 1',
  nameVi: 'Thiết Kế 1',
  description: 'Premium vinyl wrap design for Honda Lead 110.',
  descriptionVi: 'Thiết kế bọc phim cao cấp cho Honda Lead 110.',
  price: 450,
  priceFrom: false,
  image: '/images/designs/honda lead/honda-lead-0.jpg',
  style: ['premium', 'custom'],
  includedPanels: ['Full body kit'],
  isNew: true,
}
```

---

### 4.2 lib/design-service-client.ts
- **Путь:** `lib/design-service-client.ts`
- **Тип:** Клиентский сервис для работы с дизайнами
- **Что делает:**
  - Клиентская обёртка для RenderDesignService
  - Изолирует Three.js зависимости
  - Загружает модули динамически

---

### 4.3 src/presentation/types/design-adapter.ts
- **Путь:** `src/presentation/types/design-adapter.ts`
- **Тип:** Адаптер для конвертации старых дизайнов в новый формат
- **Что делает:**
  - Конвертирует LegacyDesign в новый Design entity
  - Поддерживает старый формат: `textures: { body, plastic, accents }`
  - Создаёт TextureMaterial и PanoramaMaterial

---

### 4.4 API Endpoints
- `/api/scooters` - получение всех моделей и дизайнов
- `/api/models/[id]` - получение конкретной модели с дизайнами
- `/api/designs/[id]` - получение конкретного дизайна

---

## 5. Какие стили используются

### 5.1 Классы с "card" в названии

Из `app/globals.css`:

```css
/* Premium card styles */
.premium-card {
  @apply bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300;
  @apply border border-neutral-100;
}
```

**Использование:**
- `GalleryCard.tsx` использует класс `premium-card`

---

### 5.2 Классы с "design" в названии

В `app/globals.css` **НЕТ** классов с "design" в названии.

---

### 5.3 iOS 26 Glassmorphism стили

**Используются в компонентах карточек:**

1. **LandingDesignCard.tsx:**
```tsx
style={{
  background: isSelected 
    ? 'rgba(255, 255, 255, 0.12)' 
    : 'rgba(255, 255, 255, 0.08)',
  backdropFilter: 'blur(20px) saturate(180%)',
  WebkitBackdropFilter: 'blur(20px) saturate(180%)',
  border: isSelected 
    ? '1.5px solid rgba(0, 255, 169, 0.4)' 
    : '1px solid rgba(255, 255, 255, 0.1)',
  boxShadow: isSelected
    ? '0 12px 40px -4px rgba(0, 255, 169, 0.3), 0 0 0 1px rgba(0, 255, 169, 0.2) inset, 0 0 30px rgba(0, 255, 169, 0.15)'
    : '0 8px 32px -4px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.1) inset',
}}
```

2. **PrismaDesignCard.tsx:**
```tsx
style={{
  background: 'rgba(255, 255, 255, 0.08)',
  backdropFilter: 'blur(20px) saturate(180%)',
  WebkitBackdropFilter: 'blur(20px) saturate(180%)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  boxShadow: '0 8px 32px -4px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.1) inset',
}}
```

---

### 5.4 Другие важные стили из globals.css

```css
/* iOS 26 Glassmorphism Button Animation */
.ios-glass-button-active {
  animation: ios-glow-pulse 3s ease-in-out infinite;
}

/* Logo color change animation */
.logo-animated {
  animation: logo-color-shift 8s ease-in-out infinite;
}

/* Premium button styles */
.btn-primary {
  @apply px-8 py-4 bg-accent-neon text-accent-dark font-semibold rounded-lg;
  @apply hover:bg-accent-neon/90 transition-all duration-300;
  @apply shadow-lg hover:shadow-xl transform hover:-translate-y-0.5;
}

.btn-secondary {
  @apply px-8 py-4 bg-transparent border-2 border-accent-neon text-accent-neon font-semibold rounded-lg;
  @apply hover:bg-accent-neon hover:text-accent-dark transition-all duration-300;
}
```

---

## 6. Статистика компонентов

### Карточки:
- **LandingDesignCard:** 220 строк
- **DesignCard:** 101 строка
- **PrismaDesignCard:** 96 строк
- **GalleryCard:** 96 строк
- **Всего:** 513 строк

### 3D Компоненты:
- **ScooterViewer.jsx:** 1869 строк (legacy)
- **ScooterViewer3D.tsx:** 907 строк
- **AdminScooterViewer.tsx:** 611 строк
- **ScooterViewer3DWithDesigns.tsx:** 400 строк
- **SafeScooterViewer.tsx:** 307 строк
- **Hero3DShowcase.tsx:** 263 строк
- **ClientScooterViewer.tsx:** 165 строк
- **ThreeDViewer.tsx:** 192 строк
- **DesignTextureViewer.tsx:** 101 строка
- **Остальные:** < 100 строк каждый
- **Всего:** ~6988 строк

---

## 7. Зависимости и интеграции

### Карточки используют:
- `framer-motion` - анимации
- `next/image` - оптимизированные изображения
- `@/contexts/LanguageContext` - мультиязычность
- `@/lib/materials/registry` - работа с материалами (LandingDesignCard)

### 3D компоненты используют:
- `@react-three/fiber` - React обёртка для Three.js
- `@react-three/drei` - утилиты для R3F
- `three` - Three.js библиотека
- `next/dynamic` - динамические импорты для SSR

---

## 8. Рекомендации

1. **Унификация карточек:** Все карточки используют похожий iOS 26 Glassmorphism стиль, но с разными реализациями. Можно создать общий базовый компонент.

2. **3D компоненты:** Много дублирующихся компонентов. Рекомендуется:
   - Оставить `ScooterViewer3D.tsx` как основной
   - `ScooterViewer3DWithDesigns.tsx` для нового движка
   - Остальные использовать только при необходимости

3. **Данные:** Mock данные в `lib/designsData.ts` должны быть заменены на реальные API вызовы в production.

4. **Стили:** Glassmorphism стили дублируются в компонентах. Можно вынести в общие CSS классы.

---

**Дата создания:** 2024-01-XX
**Версия проекта:** 1.0.0

