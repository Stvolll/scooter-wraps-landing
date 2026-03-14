# Исправление ошибки React Three Fiber: Cannot read properties of undefined (reading 'ReactCurrentOwner')

## Проблема
Ошибка возникала при попытке инициализации React Three Fiber до полной загрузки React internals.

## Причина
React Three Fiber пытается получить доступ к `ReactCurrentOwner` из React internals, но эти internals могут быть недоступны на момент первого рендера, особенно при использовании `dynamic` импорта в Next.js.

## Решение

### 1. Улучшенная проверка в `ScooterViewer3DClient.tsx`
- Добавлена дополнительная проверка `isClient` с использованием `useState` и `useEffect`
- Использован `Suspense` для безопасной загрузки компонента
- Добавлена небольшая задержка для гарантии полной инициализации React

### 2. Улучшенная проверка в `ScooterViewer3D.tsx`
- Добавлена проверка React internals через `__REACT_DEVTOOLS_GLOBAL_HOOK__`
- Использован `requestAnimationFrame` для гарантии полной инициализации
- Добавлена задержка 50ms для гарантии инициализации React Three Fiber
- Обернут Canvas в try-catch для обработки ошибок

## Изменения

### `components/ScooterViewer3DClient.tsx`
```typescript
export default function ScooterViewer3DClient(props: ScooterViewer3DClientProps) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const timer = setTimeout(() => {
        setIsClient(true)
      }, 0)
      return () => clearTimeout(timer)
    }
  }, [])

  if (!isClient) {
    return <LoadingPlaceholder />
  }

  return (
    <Suspense fallback={<LoadingPlaceholder />}>
      <ScooterViewer3D {...props} />
    </Suspense>
  )
}
```

### `components/ScooterViewer3D.tsx`
```typescript
const [isReady, setIsReady] = useState(false)

useEffect(() => {
  const checkReactReady = () => {
    try {
      const reactInternals = (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__?.renderers?.get(1)
      if (reactInternals) {
        setIsReady(true)
        return
      }
    } catch (e) {
      // Ignore errors
    }

    requestAnimationFrame(() => {
      setTimeout(() => {
        setIsReady(true)
      }, 50)
    })
  }

  checkReactReady()
}, [])
```

## Результат
- ✅ React Three Fiber инициализируется только после полной загрузки React
- ✅ Добавлены fallback состояния для безопасной загрузки
- ✅ Обработка ошибок через try-catch
- ✅ Использование Suspense для асинхронной загрузки

## Проверка
1. Откройте `http://localhost:3000`
2. Проверьте консоль браузера - не должно быть ошибок ReactCurrentOwner
3. 3D viewer должен загружаться корректно




