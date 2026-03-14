# Диагностика Error Code: -102

**Дата:** 2025-01-XX  
**URL:** http://localhost:3000/

## 🔍 Анализ проблемы

Error Code: -102 не найден в коде проекта. Это указывает на проблему на уровне браузера или загрузки ресурсов.

## ⚠️ Возможные причины

### 1. Проблема с model-viewer Web Component

**Симптомы:**
- Ошибка появляется при загрузке страницы
- Связана с загрузкой внешнего скрипта

**Проверка:**
```html
<!-- app/layout.tsx -->
<script
  type="module"
  src="https://ajax.googleapis.com/ajax/libs/model-viewer/3.4.0/model-viewer.min.js"
/>
```

**Возможные проблемы:**
- Скрипт не загружается (CORS, сеть)
- Content Security Policy блокирует загрузку
- Версия model-viewer несовместима

### 2. Content Security Policy (CSP)

**Проверка:** `next.config.js`
```javascript
"script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com https://ajax.googleapis.com https://unpkg.com https://cdn.jsdelivr.net https://maps.googleapis.com"
```

**Проблема:** `https://ajax.googleapis.com` должен быть разрешен для model-viewer

**Решение:** Убедиться, что CSP разрешает загрузку скрипта

### 3. Проблема с портом 3000

**Проверка:**
```bash
# Проверить, занят ли порт 3000
lsof -i :3000

# Или
netstat -ano | findstr :3000  # Windows
```

**Решение:**
- Остановить процесс, занимающий порт
- Или использовать другой порт: `PORT=3001 npm run dev`

### 4. Проблема с Next.js dev server

**Проверка:**
```bash
# Очистить кэш и перезапустить
rm -rf .next
npm run dev
```

## 🔧 Решения

### Решение 1: Проверить загрузку model-viewer

**В браузере (F12 → Console):**
```javascript
// Проверить, загружен ли model-viewer
console.log(window.customElements?.get('model-viewer'))

// Проверить загрузку скрипта
fetch('https://ajax.googleapis.com/ajax/libs/model-viewer/3.4.0/model-viewer.min.js')
  .then(r => console.log('✅ Script loaded:', r.status))
  .catch(e => console.error('❌ Script error:', e))
```

### Решение 2: Исправить CSP (если проблема)

**Файл:** `next.config.js`

Убедиться, что CSP разрешает:
```javascript
"script-src 'self' 'unsafe-eval' 'unsafe-inline' https://ajax.googleapis.com ..."
```

### Решение 3: Альтернативная загрузка model-viewer

**Вариант A:** Использовать Next.js Script компонент
```tsx
import Script from 'next/script'

<Script
  src="https://ajax.googleapis.com/ajax/libs/model-viewer/3.4.0/model-viewer.min.js"
  strategy="beforeInteractive"
/>
```

**Вариант B:** Загрузить локально
```bash
# Скачать model-viewer
curl -o public/model-viewer.min.js https://ajax.googleapis.com/ajax/libs/model-viewer/3.4.0/model-viewer.min.js
```

Затем в `app/layout.tsx`:
```tsx
<script type="module" src="/model-viewer.min.js" />
```

### Решение 4: Проверить консоль браузера

**Шаги:**
1. Открыть DevTools (F12)
2. Перейти на вкладку Console
3. Проверить ошибки и предупреждения
4. Перейти на вкладку Network
5. Проверить загрузку ресурсов (особенно model-viewer.min.js)

### Решение 5: Очистить кэш

```bash
# Очистить Next.js кэш
rm -rf .next

# Очистить node_modules (если нужно)
rm -rf node_modules
npm install

# Перезапустить dev server
npm run dev
```

## 📋 Чеклист диагностики

- [ ] Проверить консоль браузера (F12 → Console)
- [ ] Проверить Network tab (загрузка model-viewer.min.js)
- [ ] Проверить, запущен ли dev server (`npm run dev`)
- [ ] Проверить порт 3000 (не занят ли другим процессом)
- [ ] Очистить кэш (`.next` директория)
- [ ] Проверить CSP headers в Network tab
- [ ] Проверить версию model-viewer (3.4.0)
- [ ] Проверить интернет-соединение (для загрузки внешних скриптов)

## 🎯 Рекомендуемые действия

1. **Сначала:** Проверить консоль браузера для деталей ошибки
2. **Затем:** Проверить Network tab для загрузки ресурсов
3. **Если проблема с model-viewer:** Использовать альтернативную загрузку
4. **Если проблема с портом:** Использовать другой порт или освободить 3000

## 📝 Дополнительная информация

Error Code: -102 часто связан с:
- Ошибками загрузки внешних ресурсов
- CORS проблемами
- CSP блокировкой
- Проблемами с портами
- Проблемами с Next.js dev server

**Следующие шаги:**
1. Открыть браузер DevTools (F12)
2. Проверить Console и Network tabs
3. Скопировать детали ошибки
4. Применить соответствующие решения из списка выше




