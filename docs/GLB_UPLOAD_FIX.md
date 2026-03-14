# Исправление проблемы загрузки GLB через админку

## Проблема
При загрузке GLB файлов через админку возникала ошибка "Failed to fetch" в процессе клиентского сжатия.

## Причины
1. **DRACO декодеры** - GLB файл может использовать DRACO compression, требующий внешние декодеры с CDN
2. **Сетевые ошибки** - Проблемы с загрузкой декодеров с `https://www.gstatic.com/draco/v1/decoders/`
3. **Внешние ресурсы** - GLB файл может содержать ссылки на внешние текстуры, которые не могут быть загружены

## Решение

### 1. Улучшенная обработка ошибок в `client-glb-compressor.ts`
- Добавлен retry механизм: если загрузка с DRACO loader не удалась, пытаемся загрузить без DRACO
- Улучшена обработка сетевых ошибок
- Более информативные сообщения об ошибках

### 2. Опциональное сжатие в `FileUpload.tsx`
- Сжатие теперь опционально - если не удалось, используется оригинальный файл
- Добавлен таймаут 60 секунд для сжатия
- Улучшено логирование процесса

### Изменения:

**`lib/utils/client-glb-compressor.ts`:**
```typescript
// Retry без DRACO loader при сетевых ошибках
if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')) {
  console.log('🔄 Пытаемся загрузить без DRACO loader...')
  const simpleLoader = new GLTFLoader()
  simpleLoader.load(
    retryObjectUrl,
    (retryGltf: any) => resolve(retryGltf),
    undefined,
    (retryError: any) => reject(retryError)
  )
  return
}
```

**`components/FileUpload.tsx`:**
```typescript
// Таймаут для сжатия
const compressionPromise = compressGLBInBrowser(file, 7)
const timeoutPromise = new Promise((resolve) => {
  setTimeout(() => resolve({ success: false, error: 'Timeout' }), 60000)
})

const compressionResult = await Promise.race([compressionPromise, timeoutPromise])

// Если сжатие не удалось, используем оригинальный файл
if (!compressionResult.success) {
  console.warn('⚠️ Сжатие не удалось, используем оригинальный файл')
  // Продолжаем с оригинальным файлом
}
```

## Результат
- ✅ GLB файлы загружаются даже если DRACO декодеры недоступны
- ✅ Retry механизм для файлов без DRACO compression
- ✅ Опциональное сжатие - не блокирует загрузку
- ✅ Улучшенное логирование для диагностики
- ✅ Таймауты предотвращают зависание

## Проверка
1. Откройте `/admin/models/new`
2. Попробуйте загрузить GLB файл
3. Проверьте консоль браузера - должны быть логи процесса
4. Файл должен загрузиться даже если сжатие не удалось




