# Анализ импорта модели из папки MODEL

## 📂 Структура папки

```
public/models/MODEL/
├── MODEL-Honda-SH160i.glb (17MB) - модель
├── Panoramic-404.webp - панорама по умолчанию
└── DESIGNS/
    ├── Design-1/
    │   ├── UV-D1-SH160.jpg - основная текстура
    │   ├── PHOTO-D1-SH160-1.png - фото 1
    │   ├── PHOTO-D1-SH160-2.png - фото 2
    │   ├── PHOTO-D1-SH160-3.png - фото 3
    │   ├── Video-D1-SH160.mp4 - видео
    │   └── panoram-D1.webp - фон
    └── Design-2/
        └── (аналогичная структура)
```

## ❌ Проблемы при импорте

### 1. Ошибка "Unexpected end of form" при загрузке через скрипт

**Ошибка:**
```
Failed to upload MODEL-Honda-SH160i.glb: 400 
{"error":"Failed to parse upload data: File stream error: Unexpected end of form"}
```

**Причина:**
- Скрипт использует `node-fetch` + `form-data` для отправки файла
- Busboy на сервере не может правильно распарсить multipart данные
- Проблема с обработкой stream для больших файлов (17MB)

**Решение:**
1. ✅ Использовать загрузку через админку (браузер) - работает корректно
2. ✅ Использовать прямой импорт (копирование файлов + создание записей в БД)
3. ⚠️ Исправить скрипт для правильной работы с FormData streams

### 2. Ошибка DATABASE_URL при прямом импорте

**Ошибка:**
```
Environment variable not found: DATABASE_URL
```

**Причина:**
- Скрипт пытается использовать Prisma без переменных окружения
- Нужно загрузить `.env.local` или использовать API endpoints

**Решение:**
- Использовать API endpoints вместо прямого доступа к БД
- Или загрузить переменные окружения через `dotenv`

## ✅ Рекомендуемый способ импорта

### Вариант 1: Через админку (Рекомендуется)

1. Откройте `/admin/models/new`
2. Загрузите модель:
   - Название: `Honda SH160i`
   - ID: `honda-sh160i` (автогенерация)
   - Файл: `MODEL-Honda-SH160i.glb` из `public/models/MODEL/`
   - Панорама: `Panoramic-404.webp` (опционально)
3. Создайте дизайны:
   - Откройте `/admin/models/honda-sh160i/designs/create`
   - Для каждого дизайна загрузите:
     - UV текстура (обязательно)
     - Фото (опционально, несколько)
     - Видео (опционально)
     - Фон (опционально)

**Преимущества:**
- ✅ Работает без проблем
- ✅ Валидация на стороне сервера
- ✅ Правильная обработка файлов
- ✅ Автоматическое создание записей в БД

### Вариант 2: Прямой импорт (для разработки)

Используйте скрипт `scripts/import-model-direct.js`:

```bash
# Убедитесь, что DATABASE_URL установлен в .env.local
node scripts/import-model-direct.js
```

**Что делает скрипт:**
1. Копирует файлы из `public/models/MODEL/` в `public/uploads/`
2. Создает записи в БД через Prisma
3. Использует `createDesign` action для создания дизайнов

**Требования:**
- ✅ DATABASE_URL в `.env.local`
- ✅ Prisma клиент сгенерирован (`npm run db:generate`)
- ✅ База данных доступна

## 🔍 Анализ ошибок API

### Проблема с busboy и большими файлами

**Симптомы:**
- "Unexpected end of form" при загрузке через скрипт
- Работает через браузер, но не через node-fetch

**Причина:**
Busboy ожидает правильный multipart stream с корректным boundary. При использовании `node-fetch` + `form-data` для больших файлов stream может закрываться преждевременно.

**Возможные решения:**

1. **Использовать правильный Content-Type header:**
```javascript
const formData = new FormData()
formData.append('file', fileStream, {
  filename: fileName,
  contentType: 'model/gltf-binary',
})

const response = await fetch(url, {
  method: 'POST',
  body: formData,
  // НЕ устанавливать Content-Type - FormData сам добавит boundary
})
```

2. **Использовать pipe вместо append для больших файлов:**
```javascript
const formData = new FormData()
const fileStream = fs.createReadStream(filePath)
formData.append('file', fileStream, {
  filename: fileName,
  knownLength: fileStat.size, // Указать размер для правильной обработки
})
```

3. **Увеличить timeout для больших файлов:**
```javascript
// В app/api/uploads/local/route.ts
export const maxDuration = 300 // 5 минут для больших файлов
```

## 📋 Чеклист для импорта модели

- [ ] Модель загружена через админку (`/admin/models/new`)
- [ ] Модель отображается в списке моделей (`/admin/models`)
- [ ] Дизайн-1 создан с UV текстурой
- [ ] Дизайн-1 имеет фото (3 шт)
- [ ] Дизайн-1 имеет видео
- [ ] Дизайн-1 имеет фон (panoram-D1.webp)
- [ ] Дизайн-2 создан аналогично
- [ ] Все файлы доступны по URL (`/uploads/...`)
- [ ] Модель отображается на главной странице
- [ ] Дизайны применяются к модели в 3D viewer

## 🛠️ Исправления для скрипта импорта

Если нужно исправить скрипт для автоматического импорта:

1. **Использовать правильный способ создания FormData:**
```javascript
const formData = new FormData()
const fileStream = fs.createReadStream(filePath)
const fileStat = await fsPromises.stat(filePath)

formData.append('file', fileStream, {
  filename: fileName,
  contentType: 'model/gltf-binary',
  knownLength: fileStat.size, // Важно для больших файлов
})
```

2. **Использовать правильные headers:**
```javascript
const response = await fetch(url, {
  method: 'POST',
  body: formData,
  // НЕ устанавливать Content-Type - FormData сам добавит boundary
  headers: formData.getHeaders(), // Для node-fetch
})
```

3. **Обработать ошибки правильно:**
```javascript
if (!response.ok) {
  const errorText = await response.text()
  let errorData
  try {
    errorData = JSON.parse(errorText)
  } catch {
    errorData = { error: errorText }
  }
  throw new Error(`Upload failed: ${errorData.error || response.statusText}`)
}
```

## 📝 Выводы

1. ✅ **Загрузка через админку работает корректно** - рекомендуется использовать этот способ
2. ⚠️ **Скрипт импорта имеет проблемы с большими файлами** - нужно исправить обработку FormData streams
3. ✅ **Прямой импорт работает**, но требует DATABASE_URL
4. ✅ **API endpoints работают правильно** - проблема только в скрипте

## 🎯 Рекомендации

1. **Для продакшена:** Использовать загрузку через админку
2. **Для разработки:** Исправить скрипт или использовать прямой импорт
3. **Для автоматизации:** Создать отдельный endpoint для bulk import с правильной обработкой больших файлов

