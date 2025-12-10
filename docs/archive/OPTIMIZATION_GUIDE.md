# 3D Assets Optimization Guide

Полное руководство по оптимизации 3D-ассетов и текстур для проекта.

## Обзор

Этот процесс оптимизирует:

- **GLB модели**: Сжатие с помощью Draco (50-70% уменьшение размера)
- **Текстуры**: Конвертация в WebP/AVIF с версиями для мобильных/десктопа
- **CDN загрузка**: Автоматическая загрузка на S3/CDN

## Быстрый старт

```bash
# 1. Оптимизировать все ассеты
npm run optimize:all

# 2. Загрузить на CDN (dry run для проверки)
npm run upload:cdn:dry

# 3. Загрузить на CDN (реальная загрузка)
npm run upload:cdn

# 4. Обновить пути в конфигурации
CDN_URL=https://your-cdn.com npm run update-asset-paths
```

## Детальная инструкция

### Шаг 1: Оптимизация GLB моделей

```bash
npm run optimize:3d
```

**Что делает:**

- Находит все `.glb` файлы в `public/models/`
- Применяет Draco-компрессию (качество 7 из 10)
- Сохраняет оптимизированные файлы в `public/models/optimized/`
- Показывает статистику уменьшения размера

**Результат:**

- `yamaha-nvx.glb` (11 MB) → `yamaha-nvx.draco.glb` (~3-5 MB)

### Шаг 2: Оптимизация текстур

```bash
# WebP формат (рекомендуется)
npm run optimize:textures

# AVIF формат (лучшее сжатие, но меньше поддержки)
npm run optimize:textures:avif
```

**Что делает:**

- Находит все `.jpg`, `.jpeg`, `.png` в `public/textures/`
- Создает версии для мобильных (512x512) и десктопа (1024x1024)
- Конвертирует в WebP или AVIF
- Сохраняет в `public/textures/optimized/`

**Результат:**

- `carbon.png` → `carbon.mobile.webp` + `carbon.desktop.webp`
- Обычно 60-80% уменьшение размера

### Шаг 3: Загрузка на CDN/S3

**Настройка переменных окружения:**

Добавьте в `.env.local`:

```bash
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
CDN_BUCKET_NAME=your-bucket-name
CDN_PREFIX=assets
AWS_CLOUDFRONT_DOMAIN=d1234567890.cloudfront.net  # опционально
```

**Тестовая загрузка (dry run):**

```bash
npm run upload:cdn:dry
```

**Реальная загрузка:**

```bash
npm run upload:cdn
```

**Результат:**

- Создается `cdn-manifest.json` с URL всех загруженных файлов
- Файлы доступны по CDN URL

### Шаг 4: Обновление путей в коде

```bash
CDN_URL=https://your-cdn.com npm run update-asset-paths
```

Или вручную обновите `config/scooters.js`:

```javascript
model: 'https://cdn.example.com/assets/models/yamaha-nvx.draco.glb',
texture: 'https://cdn.example.com/assets/textures/vision/carbon.desktop.webp',
```

## Структура файлов после оптимизации

```
public/
├── models/
│   ├── yamaha-nvx.glb (оригинал, 11 MB)
│   └── optimized/
│       └── yamaha-nvx.draco.glb (оптимизированный, ~3-5 MB)
│
└── textures/
    ├── vision/
    │   ├── carbon.png (оригинал)
    │   └── ...
    └── optimized/
        └── vision/
            ├── carbon.mobile.webp
            └── carbon.desktop.webp
```

## Использование в коде

### Адаптивная загрузка текстур

```javascript
// В компоненте
const isMobile = window.innerWidth < 768
const textureSize = isMobile ? 'mobile' : 'desktop'
const textureUrl = `https://cdn.example.com/assets/textures/vision/carbon.${textureSize}.webp`
```

### Поддержка форматов

```javascript
// Проверка поддержки AVIF
const supportsAVIF =
  document.createElement('canvas').toDataURL('image/avif').indexOf('data:image/avif') === 0
const format = supportsAVIF ? 'avif' : 'webp'
const textureUrl = `https://cdn.example.com/assets/textures/vision/carbon.desktop.${format}`
```

## NPM скрипты

| Команда                          | Описание                                  |
| -------------------------------- | ----------------------------------------- |
| `npm run optimize:3d`            | Оптимизировать GLB модели                 |
| `npm run optimize:textures`      | Оптимизировать текстуры (WebP)            |
| `npm run optimize:textures:avif` | Оптимизировать текстуры (AVIF)            |
| `npm run optimize:all`           | Оптимизировать все ассеты                 |
| `npm run upload:cdn`             | Загрузить на CDN/S3                       |
| `npm run upload:cdn:dry`         | Тестовая загрузка (без реальной загрузки) |

## Рекомендации

### GLB модели

- **Качество Draco**: 7 (баланс размера/качества)
- **Размер после оптимизации**: Ожидайте 50-70% уменьшение
- **Тестирование**: Всегда проверяйте визуальное качество после оптимизации

### Текстуры

- **WebP**: Лучшая поддержка браузерами
- **AVIF**: Лучшее сжатие, но требует fallback
- **Размеры**: Mobile (512px) и Desktop (1024px) обычно достаточно

### CDN

- **Кэширование**: Файлы кэшируются на 1 год (immutable)
- **CloudFront**: Рекомендуется для лучшей производительности
- **CORS**: Убедитесь, что CORS настроен правильно

## Troubleshooting

### Ошибка: "gltf-pipeline not found"

```bash
npm install --save-dev gltf-pipeline
```

### Ошибка: "sharp not found"

```bash
npm install --save-dev sharp
```

### Ошибка при загрузке на S3

- Проверьте AWS credentials в `.env.local`
- Убедитесь, что bucket существует
- Проверьте IAM permissions

### Модели не загружаются после оптимизации

- Проверьте, что Draco decoder загружен в браузере
- Убедитесь, что CDN URL правильные
- Проверьте CORS настройки

## Дополнительные ресурсы

- [gltf-pipeline documentation](https://github.com/CesiumGS/gltf-pipeline)
- [Draco compression](https://google.github.io/draco/)
- [WebP format](https://developers.google.com/speed/webp)
- [AVIF format](https://avif.io/)
