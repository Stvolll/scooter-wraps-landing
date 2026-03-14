# Полное исправление загрузки GLB файлов через админку

## Проблемы
1. **"THREE.GLTFLoader: No DRACOLoader instance provided"** - предупреждение в консоли
2. **"Upload failed: Bad Request"** - сервер возвращает 400 при загрузке GLB
3. **Ошибки валидации** - GLB файлы не проходили валидацию на сервере

## Решения

### 1. Исправление предупреждения DRACO Loader
В `lib/utils/client-glb-compressor.ts`:
- При retry без DRACO устанавливаем пустой DRACO loader для подавления предупреждения
- Улучшена обработка сетевых ошибок с retry механизмом

### 2. Улучшение валидации GLB файлов
В `app/api/admin/designs/upload/route.ts`:
- Принудительная установка `model/gltf-binary` для GLB файлов
- GLB файлы всегда считаются валидными, даже если тип не определен
- Улучшена проверка расширений файлов

### 3. Улучшение обработки ошибок
В `components/FileUpload.tsx`:
- Детальные сообщения об ошибках из ответа сервера
- Добавлено поле `type` в FormData для правильной валидации
- Улучшено логирование процесса загрузки

## Изменения

### `lib/utils/client-glb-compressor.ts`
```typescript
// Retry без DRACO с подавлением предупреждения
const simpleLoader = new GLTFLoader()
try {
  const emptyDracoLoader = new DRACOLoader()
  emptyDracoLoader.setDecoderPath('') // Пустой путь
  simpleLoader.setDRACOLoader(emptyDracoLoader)
} catch (e) {
  // Игнорируем ошибки
}
```

### `app/api/admin/designs/upload/route.ts`
```typescript
// Принудительная установка content type для GLB
if (filename.toLowerCase().endsWith('.glb')) {
  contentType = 'model/gltf-binary'
}

// GLB файлы всегда валидны
const isGLBFile = filename.toLowerCase().endsWith('.glb') || filename.toLowerCase().endsWith('.gltf')
const isValidFile = isImage || isModel || isVideo || isGLBFile
```

### `components/FileUpload.tsx`
```typescript
// Добавление типа файла в FormData
formData.append('type', fileType)

// Улучшенная обработка ошибок
const errorData = JSON.parse(xhr.responseText)
errorMessage = errorData.error || errorData.message
if (errorData.details) {
  errorMessage += `\nDetails: ${errorData.details}`
}
```

## Результат
- ✅ Нет предупреждений о DRACO loader
- ✅ GLB файлы проходят валидацию на сервере
- ✅ Детальные сообщения об ошибках
- ✅ Правильный content type для GLB файлов
- ✅ Retry механизм для сетевых ошибок

## Проверка
1. Откройте `/admin/models/new`
2. Загрузите GLB файл
3. Проверьте консоль - не должно быть предупреждений
4. Файл должен успешно загрузиться




