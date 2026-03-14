# Руководство по динамической смене текстур на 3D модели

## 📋 Обзор

Компонент `ScooterViewer3D` поддерживает динамическую смену текстур на 3D модели скутера без перезагрузки модели. Система работает с несколькими текстурами для разных материалов (Body, Plastic, Accents) и включает кеширование для оптимизации производительности.

## 🏗️ Архитектура

### Три уровня текстур

1. **Body** - Основной материал корпуса скутера
2. **Plastic** - Пластиковые элементы (обвесы, детали)
3. **Accents** - Акцентные элементы (декоративные детали)

### Важно: Базовая модель не заменяется

- **Базовая 3D-модель (Mesh)** всегда остается неизменной
- **Текстуры дизайна** накладываются поверх базовой модели
- **GLB файлы с дизайном** используются только как reference (не заменяют модель)
- Все текстуры находятся в тех же базовых координатах (UV-лекала)

### Формат данных

```typescript
interface TextureSet {
  body?: string    // Путь к текстуре для Body материала
  plastic?: string // Путь к текстуре для Plastic материала
  accents?: string // Путь к текстуре для Accents материала
}

interface Design {
  id: string
  name: string
  textures?: TextureSet  // Новый формат: несколько текстур
  texture?: string       // Legacy: одна текстура для всех материалов
}
```

## 🎨 Использование

### Базовое использование (одна текстура)

```tsx
<ScooterViewer3D
  modelPath="/models/MODEL_Honda SH160i_.glb"
  selectedDesign={{
    id: 'design-01',
    name: 'Neon Blade',
    texture: '/textures/designs/neon-blade.webp' // Применяется ко всем материалам
  }}
/>
```

### Продвинутое использование (несколько текстур)

```tsx
<ScooterViewer3D
  modelPath="/models/MODEL_Honda SH160i_.glb"
  selectedDesign={{
    id: 'design-01',
    name: 'Neon Blade',
    textures: {
      body: '/textures/designs/neon-blade-body.webp',
      plastic: '/textures/designs/neon-blade-plastic.webp',
      accents: '/textures/designs/neon-blade-accents.webp'
    }
  }}
/>
```

### Интеграция с карточками дизайнов

```tsx
function DesignGallery() {
  const [selectedDesign, setSelectedDesign] = useState(null)
  
  const designs = [
    {
      id: '01',
      name: 'Neon Blade',
      textures: {
        body: '/textures/designs/neon-blade-body.webp',
        plastic: '/textures/designs/neon-blade-plastic.webp',
        accents: '/textures/designs/neon-blade-accents.webp'
      }
    },
    // ... другие дизайны
  ]
  
  return (
    <div>
      <ScooterViewer3D
        modelPath="/models/MODEL_Honda SH160i_.glb"
        selectedDesign={selectedDesign}
      />
      
      <div className="design-cards">
        {designs.map(design => (
          <div
            key={design.id}
            onClick={() => setSelectedDesign(design)}
            className="design-card"
          >
            {design.name}
          </div>
        ))}
      </div>
    </div>
  )
}
```

## 🔧 Технические детали

### Определение материалов

Система автоматически определяет тип материала по его имени:

- **Body**: `body`, `main`, `primary`, `base`
- **Plastic**: `plastic`, `trim`, `secondary`
- **Accents**: `accent`, `detail`, `highlight`, `decoration`

Если материал не распознан, используется текстура `body` как fallback.

### Кеширование текстур

Все текстуры кешируются в памяти для избежания повторной загрузки:

```typescript
const textureCache = new Map<string, THREE.Texture>()
```

При повторном выборе того же дизайна текстуры загружаются из кеша мгновенно.

### Настройки текстур

- `flipY = false` - Важно для glTF/GLB формата
- `wrapS/T = RepeatWrapping` - Повторение текстуры
- `colorSpace = SRGBColorSpace` - Правильное цветовое пространство
- `needsUpdate = true` - Принудительное обновление

### UV-координаты

Текстуры должны быть созданы на основе SVG-лекал, строго соответствующих UV-координатам модели. Система автоматически обновляет UV-атрибуты при смене текстур:

```typescript
geometry.uvsNeedUpdate = true
geometry.attributes.uv.needsUpdate = true
```

## 📝 Требования к текстурам

### Формат файлов

- **Рекомендуется**: `.webp` (лучшее сжатие)
- **Поддерживается**: `.png`, `.jpg`

### Разрешение

- **Рекомендуется**: 2048x2048px (степени двойки)
- **Минимум**: 1024x1024px
- **Максимум**: 4096x4096px (для производительности)

### UV-маппинг

1. Экспортируйте UV-лекала из Blender как SVG
2. Создайте текстуры в графическом редакторе, следуя SVG-координатам
3. Убедитесь, что текстуры точно соответствуют UV-островкам
4. Экспортируйте в `.webp` формат

## 🎯 Оптимизация

### Предзагрузка текстур

```typescript
// Предзагрузить текстуры для популярных дизайнов
const preloadTextures = async (designs: Design[]) => {
  for (const design of designs) {
    if (design.textures) {
      await Promise.all([
        design.textures.body && loadTexture(design.textures.body),
        design.textures.plastic && loadTexture(design.textures.plastic),
        design.textures.accents && loadTexture(design.textures.accents),
      ])
    }
  }
}
```

### Очистка кеша

```typescript
import { textureCache } from '@/components/ScooterViewer3D'

// Очистить кеш при необходимости
textureCache.clear()
```

## 🐛 Отладка

### Логирование

Компонент выводит подробные логи в консоль:

- `🎨 [ScooterViewer3D] Loading texture:` - Начало загрузки
- `✅ [ScooterViewer3D] Texture loaded:` - Успешная загрузка
- `✅ [ScooterViewer3D] Texture applied:` - Применение к материалу
- `📊 [ScooterViewer3D] Texture application:` - Статистика применения
- `❌ [ScooterViewer3D] Error:` - Ошибки

### Проверка материалов

Откройте консоль браузера и проверьте:
1. Загружаются ли текстуры
2. Применяются ли они к правильным материалам
3. Соответствуют ли имена материалов паттернам

### Частые проблемы

**Проблема**: Текстуры не применяются
- **Решение**: Проверьте имена материалов в Blender, они должны содержать ключевые слова (body, plastic, accents)

**Проблема**: Текстуры перевернуты
- **Решение**: Убедитесь, что `flipY = false` (уже установлено по умолчанию)

**Проблема**: Текстуры не соответствуют UV
- **Решение**: Проверьте, что текстуры созданы на основе правильных SVG-лекал

## 📚 Примеры

### Пример 1: Простой дизайн с одной текстурой

```tsx
const design = {
  id: 'simple-01',
  name: 'Solid Color',
  texture: '/textures/solid-red.webp'
}
```

### Пример 2: Сложный дизайн с несколькими текстурами

```tsx
const design = {
  id: 'complex-01',
  name: 'Racing Stripes',
  textures: {
    body: '/textures/racing/body-stripes.webp',
    plastic: '/textures/racing/plastic-black.webp',
    accents: '/textures/racing/accents-gold.webp'
  }
}
```

### Пример 3: Дизайн с частичными текстурами

```tsx
const design = {
  id: 'partial-01',
  name: 'Custom Body Only',
  textures: {
    body: '/textures/custom/body-only.webp'
    // plastic и accents используют оригинальные материалы
  }
}
```

## 🔄 Миграция с legacy формата

Если у вас есть старые дизайны с одной текстурой:

```typescript
// Старый формат
const oldDesign = {
  texture: '/textures/old-design.webp'
}

// Новый формат (автоматически поддерживается)
const newDesign = {
  textures: {
    body: '/textures/new-design-body.webp',
    plastic: '/textures/new-design-plastic.webp',
    accents: '/textures/new-design-accents.webp'
  }
}

// Оба формата работают!
```

