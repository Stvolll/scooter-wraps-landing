# Исправление проблемы зависания сайта

## Проблема
Сайт зависал из-за нескольких проблем в `app/page.tsx`:

1. **Нестабильная функция `loadScooters`** - создавалась заново при каждом рендере, вызывая бесконечные перерисовки
2. **Отсутствие защиты от параллельных запросов** - несколько запросов могли выполняться одновременно
3. **Слишком частые проверки** - `setInterval` каждые 2 секунды создавал излишнюю нагрузку
4. **Отсутствие проверки видимости страницы** - периодическая перезагрузка работала даже когда страница в фоне

## Исправления

### 1. Стабилизация `loadScooters` через `useMemo`
```typescript
const loadScooters = useMemo(() => {
  return async (force = false) => {
    // ... implementation
  }
}, []) // Empty deps - function is stable
```

### 2. Защита от параллельных запросов
```typescript
const isLoadingRef = useRef(false)

if (isLoadingRef.current && !force) {
  return // Skip if already loading
}
isLoadingRef.current = true
// ... request
finally {
  isLoadingRef.current = false
}
```

### 3. Уменьшение таймаута запроса
- Было: 5 секунд
- Стало: 3 секунды (быстрее fallback)

### 4. Увеличение интервалов проверки
- `checkAdminUpdate`: 2s → 5s
- Периодическая перезагрузка: 30s → 60s

### 5. Проверка видимости страницы
```typescript
if (document.visibilityState === 'visible') {
  // Only reload if page is visible
  loadScooters(true)
}
```

### 6. Обработка ошибок localStorage
```typescript
try {
  const lastUpdate = localStorage.getItem('admin-update')
  // ...
} catch (e) {
  // Ignore localStorage errors (private browsing, etc.)
}
```

## Результат
- ✅ Нет бесконечных перерисовок
- ✅ Нет параллельных запросов
- ✅ Меньше нагрузка на сервер
- ✅ Быстрый fallback при проблемах с API
- ✅ Работает даже в приватном режиме браузера

## Проверка
1. Очистить кеш: `rm -rf .next`
2. Запустить сервер: `npm run dev`
3. Открыть `http://localhost:3000`
4. Проверить консоль браузера - не должно быть бесконечных запросов




