# Финальное исправление ошибки ReactCurrentOwner

## Проблема

Ошибка `Cannot read properties of undefined (reading 'ReactCurrentOwner')` возникает на строке 9 файла `ScooterViewer3D.tsx` при парсинге модуля, даже если импорты R3F динамические.

## Причина

Проблема в том, что даже при динамическом импорте, если на верхнем уровне модуля используются типы или константы из R3F (например, `THREE.Texture`, `THREE.Group`), это может вызвать обращение к React internals до их инициализации.

## Решение

### 1. Убраны все использования THREE на верхнем уровне

- `textureCache` и `loadTexture` теперь инициализируются только после загрузки THREE
- Все типы `THREE.*` заменены на `any` в refs и типах
- Добавлены проверки `!THREE` во всех функциях, использующих THREE

### 2. Динамическая инициализация texture loader

```typescript
let textureCache: Map<string, any> | null = null
let loadTexture: ((url: string) => Promise<any>) | null = null

const initTextureLoader = () => {
  if (!THREE || textureCache !== null) return
  // Инициализация только после загрузки THREE
}
```

### 3. Проверки наличия THREE во всех useEffect

Все `useEffect` и функции, использующие THREE, теперь проверяют его наличие:

```typescript
useEffect(() => {
  if (!scene || !THREE) return
  // Использование THREE
}, [scene])
```

### 4. Использование next/dynamic в главной странице

```typescript
const ScooterViewer = dynamic(() => import('@/components/ScooterViewer3DClient'), {
  ssr: false,
  loading: () => <LoadingPlaceholder />
})
```

## Результат

✅ Нет обращений к THREE на верхнем уровне модуля
✅ Все типы заменены на `any` для избежания проблем с парсингом
✅ Проверки наличия THREE во всех местах использования
✅ Правильная последовательность загрузки модулей




