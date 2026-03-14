# Исправление зацикленных ошибок

## Найденные проблемы

### 1. `app/page.tsx` - useEffect с зависимостью от `scooters`

**Проблема:**
```typescript
useEffect(() => {
  // ...
  setSelectedModel(prevModel => { ... })
}, [isMounted]) // Но использует scooters внутри, который может изменяться
```

**Решение:**
- Использовать ref для отслеживания изменений ключей scooters
- Добавить проверку на изменение перед обновлением состояния
- Использовать строку ключей вместо объекта для сравнения

### 2. `app/page.tsx` - useEffect для установки дизайна по умолчанию

**Проблема:**
```typescript
useEffect(() => {
  if (lastModelRef.current === selectedModel) return
  // ...
  setSelectedDesign(prevDesign => { ... })
}, [selectedModel, isMounted]) // Может вызываться при каждом изменении scooters
```

**Решение:**
- Добавить проверку на изменение ID дизайна
- Использовать ref для отслеживания последнего установленного дизайна
- Пропускать обновление если дизайн уже установлен

### 3. `components/ScooterViewer3D.tsx` - Дублирующиеся зависимости

**Проблема:**
```typescript
useEffect(() => {
  // ...
}, [
  selectedDesign,        // Включает все свойства
  selectedDesign?.id,   // Дублирует selectedDesign
  selectedDesign?.textures?.body,
  // ...
])
```

**Решение:**
- Убрать `selectedDesign` из зависимостей
- Оставить только конкретные свойства: `selectedDesign?.id`, `selectedDesign?.textures?.body`, и т.д.

## Исправления

### 1. Улучшена проверка изменений scooters

```typescript
const lastScootersKeysRef = useRef<string>('')
const lastSelectedModelRef = useRef<string | null>(null)

useEffect(() => {
  const currentKeys = Object.keys(scooters).sort().join(',')
  const scootersChanged = lastScootersKeysRef.current !== currentKeys
  
  if (scootersChanged) {
    lastScootersKeysRef.current = currentKeys
  }
  
  // Пропускаем если модель валидна и scooters не изменились
  if (isModelValid && !scootersChanged && lastSelectedModelRef.current === currentModel) {
    return
  }
  
  // Обновляем только при необходимости
}, [isMounted, lastScootersKeysRef.current])
```

### 2. Улучшена проверка изменений дизайна

```typescript
const lastModelRef = useRef<string | null>(null)
const lastDesignIdRef = useRef<string | null>(null)

useEffect(() => {
  // Пропускаем если модель уже обработана И дизайн уже установлен
  if (lastModelRef.current === selectedModel) {
    const firstDesignId = scooter.designs[0]?.id
    if (firstDesignId && lastDesignIdRef.current === firstDesignId) {
      return // Все уже установлено правильно
    }
  }
  
  // Пропускаем если ID дизайна не изменился
  if (lastDesignIdRef.current === firstDesignId) {
    return
  }
  
  lastDesignIdRef.current = firstDesignId
  // ...
}, [selectedModel, isMounted])
```

### 3. Убраны дублирующиеся зависимости

```typescript
// До:
}, [
  selectedDesign,        // ❌ Дублирует все ниже
  selectedDesign?.id,
  selectedDesign?.textures?.body,
  // ...
])

// После:
}, [
  selectedDesign?.id,   // ✅ Только конкретные свойства
  selectedDesign?.textures?.body,
  selectedDesign?.textures?.plastic,
  selectedDesign?.textures?.accents,
  scene,
])
```

## Результат

- ✅ Устранены бесконечные циклы в useEffect
- ✅ Улучшена производительность за счет предотвращения лишних ререндеров
- ✅ Сохранена функциональность - все обновления происходят только при необходимости




