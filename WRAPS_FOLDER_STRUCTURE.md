# Структура папок для материалов по пленкам (Wraps)

## Обзор
Эта структура папок организована для хранения всех материалов, связанных с дизайнами пленок для скутеров.

## Структура директорий

```
public/
├── wraps/
│   ├── textures/          # Текстуры для 3D моделей
│   │   ├── honda-lead/
│   │   │   ├── carbon-black.jpg
│   │   │   ├── beach-sunset.jpg
│   │   │   ├── neon-green.jpg
│   │   │   └── ...
│   │   ├── honda-vision/
│   │   │   ├── racing-red.jpg
│   │   │   └── ...
│   │   ├── honda-air-blade/
│   │   ├── yamaha-nvx/
│   │   │   ├── matte-blue.jpg
│   │   │   ├── racing-yellow.jpg
│   │   │   └── ...
│   │   ├── vinfast/
│   │   └── vespa/
│   │
│   ├── designs/            # Файлы дизайнов (PSD, AI, SVG)
│   │   ├── honda-lead/
│   │   ├── honda-vision/
│   │   ├── honda-air-blade/
│   │   ├── yamaha-nvx/
│   │   ├── vinfast/
│   │   └── vespa/
│   │
│   └── previews/           # Превью изображения дизайнов
│       ├── honda-lead/
│       ├── honda-vision/
│       ├── honda-air-blade/
│       ├── yamaha-nvx/
│       ├── vinfast/
│       └── vespa/
│
├── models/                 # 3D модели скутеров
│   ├── honda-lead.glb
│   ├── honda-vision.glb
│   ├── honda-air-blade.glb
│   ├── yamaha-nvx.glb
│   ├── vinfast.glb
│   └── vespa.glb
│
└── textures/               # Базовые текстуры моделей
    ├── honda-lead/
    │   └── 3DModel.jpg
    └── yamaha-nvx/
        └── 3DModel.jpg
```

## Описание папок

### `/wraps/textures/`
**Назначение:** Текстуры для применения на 3D модели в формате изображений

**Формат файлов:**
- JPG/PNG (рекомендуется PNG для прозрачности)
- Разрешение: минимум 2048x2048px (для качества)
- Формат: UV-маппинг должен соответствовать модели

**Структура:**
- Каждая модель имеет свою папку
- Имена файлов должны быть описательными (например: `carbon-black.jpg`, `racing-stripes-red.jpg`)

### `/wraps/designs/`
**Назначение:** Исходные файлы дизайнов для редактирования

**Формат файлов:**
- PSD (Adobe Photoshop)
- AI (Adobe Illustrator)
- SVG (векторная графика)
- PDF (для печати)

**Структура:**
- Организация по моделям скутеров
- Внутри каждой папки могут быть подпапки по стилям (sport, racing, classic, local)

### `/wraps/previews/`
**Назначение:** Превью изображения для галереи и карточек дизайнов

**Формат файлов:**
- JPG/PNG
- Разрешение: 600x600px - 1200x1200px
- Оптимизированные для веб (сжатие)

**Использование:**
- Отображаются в галерее дизайнов
- Используются в карточках продуктов
- Могут быть миниатюрами для быстрого просмотра

## Рекомендации по именованию

### Текстуры
```
{model}-{style}-{color/pattern}.jpg
Примеры:
- honda-lead-carbon-black.jpg
- yamaha-nvx-racing-yellow.jpg
- honda-vision-beach-sunset.jpg
```

### Дизайны
```
{model}-{design-name}-{version}.psd
Примеры:
- honda-lead-carbon-fiber-v1.psd
- yamaha-nvx-racing-stripes-v2.ai
```

### Превью
```
{model}-{design-id}.jpg
Примеры:
- honda-lead-001.jpg
- yamaha-nvx-003.jpg
```

## Интеграция с кодом

### В `preview.html`
Текстуры используются в объекте `designs`:
```javascript
{
    id: 1,
    model: 'honda-lead',
    textureUrl: '/wraps/textures/honda-lead/carbon-black.jpg',
    imageUrl: '/wraps/previews/honda-lead/001.jpg'
}
```

### Пути к моделям
В объекте `models`:
```javascript
{
    'honda-lead': {
        modelUrl: '/models/honda-lead.glb',
        defaultTexture: '/textures/honda-lead/3DModel.jpg'
    }
}
```

## Workflow для добавления нового дизайна

1. **Создание дизайна**
   - Создать файл в `/wraps/designs/{model}/`
   - Использовать шаблон модели для точности

2. **Экспорт текстуры**
   - Экспортировать UV-маппинг в `/wraps/textures/{model}/`
   - Убедиться в правильном разрешении

3. **Создание превью**
   - Создать превью изображение в `/wraps/previews/{model}/`
   - Оптимизировать для веб

4. **Обновление данных**
   - Добавить запись в массив `designs` в `preview.html`
   - Указать правильные пути к файлам

## Примечания

- Все изображения должны быть оптимизированы для веб
- Текстуры должны соответствовать UV-маппингу 3D моделей
- Рекомендуется использовать версионирование для дизайнов
- Регулярно проверять размеры файлов для производительности

