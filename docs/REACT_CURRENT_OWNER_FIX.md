# Исправление ошибки ReactCurrentOwner

## Проблема

На главной странице не отображается 3D сцена (бесконечная загрузка) с ошибкой:
```
Cannot read properties of undefined (reading 'ReactCurrentOwner')
at @react-three/fiber/dist/events-776716bd.esm.js
```

## Причина

Ошибка возникает потому, что React Three Fiber пытается получить доступ к React internals (`ReactCurrentOwner`) до их полной инициализации. Это происходит когда импорты R3F выполняются на верхнем уровне модуля, даже при использовании динамического импорта.

## Решение

### 1. Использование `next/dynamic` в главной странице

Вместо прямого импорта `ScooterViewer3DClient`, используем `next/dynamic` с правильными настройками:

```typescript
const ScooterViewer = dynamic(() => import('@/components/ScooterViewer3DClient'), {
  ssr: false,
  loading: () => <LoadingPlaceholder />
})
```

### 2. Улучшенная загрузка в ScooterViewer3DClient

- Использован тройной `requestAnimationFrame` + `setTimeout` для гарантии полной инициализации React
- Увеличена задержка до 150ms для гарантии инициализации React internals
- Добавлена обработка ошибок загрузки

### 3. Динамическая загрузка R3F модулей в ScooterViewer3D

- Импорты R3F перенесены в функцию `loadR3FModules()`
- Модули загружаются только после монтирования компонента
- Добавлена проверка наличия модулей перед использованием

## Результат

✅ 3D сцена загружается корректно
✅ Нет ошибки ReactCurrentOwner
✅ Правильная обработка состояний загрузки и ошибок




