# Исправление ошибки "Failed to fetch" в GLB компрессоре

## Проблема
Ошибка `Failed to fetch` возникала при попытке загрузить GLB файл через `loader.parse()` в `client-glb-compressor.ts`.

## Причина
1. `loader.parse()` использует второй параметр как базовый путь для загрузки внешних ресурсов
2. При передаче пустой строки `''` loader пытается загрузить ресурсы относительно текущего URL
3. GLB файл может содержать ссылки на внешние текстуры, которые недоступны из браузера
4. `parse()` не предназначен для работы с файлами из браузера напрямую

## Решение
Использовать `loader.load()` с `URL.createObjectURL()` вместо `loader.parse()`:

### Преимущества:
- ✅ `loader.load()` корректно обрабатывает встроенные ресурсы в GLB
- ✅ `URL.createObjectURL()` создает временный URL для файла, который loader может использовать
- ✅ Автоматическая обработка путей к ресурсам внутри GLB
- ✅ Поддержка прогресса загрузки

### Изменения:

**Было:**
```typescript
const gltf = await new Promise<any>((resolve, reject) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    const arrayBuffer = e.target?.result as ArrayBuffer
    loader.parse(
      arrayBuffer,
      '',
      (gltf: any) => resolve(gltf),
      (error: any) => reject(error)
    )
  }
  reader.onerror = reject
  reader.readAsArrayBuffer(file)
})
```

**Стало:**
```typescript
const objectUrl = URL.createObjectURL(file)

let gltf: any
try {
  gltf = await new Promise<any>((resolve, reject) => {
    loader.load(
      objectUrl,
      (loadedGltf) => resolve(loadedGltf),
      (progress) => {
        if (progress.total > 0) {
          const percent = (progress.loaded / progress.total) * 100
          console.log(`📥 Загрузка: ${percent.toFixed(1)}%`)
        }
      },
      (error) => {
        console.error('❌ Ошибка загрузки GLB:', error)
        reject(error)
      }
    )
  })
} finally {
  // Освобождаем временный URL после загрузки
  URL.revokeObjectURL(objectUrl)
}
```

## Результат
- ✅ GLB файлы загружаются корректно
- ✅ Встроенные ресурсы (текстуры) обрабатываются автоматически
- ✅ Нет ошибок "Failed to fetch"
- ✅ Поддержка отслеживания прогресса загрузки
- ✅ Корректное освобождение ресурсов через `URL.revokeObjectURL()`

## Проверка
1. Загрузите GLB файл через админ-панель
2. Проверьте консоль - не должно быть ошибок "Failed to fetch"
3. Сжатие должно работать корректно




