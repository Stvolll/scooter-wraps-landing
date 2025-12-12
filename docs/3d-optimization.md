# 3D Asset Optimization Guide

Руководство по оптимизации 3D моделей и текстур для веб-приложения.

## Инструменты

### gltfpack (рекомендуется)

```bash
# Установка
npm install -g gltfpack

# Сжатие GLB файлов
gltfpack -i public/models/*.glb -o public/models/optimized/ -c
```

### gltf-pipeline (альтернатива)

```bash
# Установка
npm install -g gltf-pipeline

# Сжатие с Draco
gltf-pipeline -i public/models/model.glb -o public/models/optimized/model.draco.glb --draco.compressionLevel 10
```

### toktx (для текстур KTX2)

```bash
# Установка (зависит от системы)
# macOS: brew install ktx-software
# Linux: apt-get install libktx-dev

# Конвертация в KTX2
toktx --t2 --genmipmap public/textures/*.jpg public/textures/ktx2/
```

## Workflow

### 1. Оптимизация 3D моделей

```bash
# Сжать все GLB файлы
npm run gltf:compress

# Или вручную:
gltfpack -i public/models/honda-lead.glb -o public/models/optimized/honda-lead.glb -c
```

**Результат:**

- Уменьшение размера файла на 60-80%
- Сохранение качества визуализации
- Поддержка Draco compression

### 2. Оптимизация текстур

**Вариант A: KTX2/Basis (лучшее сжатие)**

```bash
toktx --t2 --genmipmap public/textures/*.jpg public/textures/ktx2/
```

**Вариант B: WebP/AVIF (универсальность)**

```bash
npm run texture:optimize
```

**Результат:**

- Уменьшение размера на 70-90%
- Поддержка mipmaps
- Адаптивная загрузка

### 3. Загрузка на CDN/S3

После оптимизации:

1. Загрузите файлы на S3/CDN
2. Обновите пути в `config/scooters.js` или базе данных
3. Удалите исходные файлы из репозитория (оставьте только README)

## Рекомендации

### Размеры файлов

- **GLB модели**: < 5MB (оптимально < 2MB)
- **Текстуры**: < 2MB каждая (оптимально < 500KB)
- **HDR окружения**: < 10MB

### Форматы

- **Модели**: `.glb` с Draco compression
- **Текстуры**: `.ktx2` (Basis) или `.webp`/`.avif`
- **HDR**: `.hdr` или `.exr` (сжатые)

### LOD (Level of Detail)

Для больших моделей создайте несколько версий:

- `model-lod0.glb` - высокое качество (desktop)
- `model-lod1.glb` - среднее качество (tablet)
- `model-lod2.glb` - низкое качество (mobile)

## Интеграция в проект

После оптимизации обновите пути в:

1. `config/scooters.js` - пути к моделям
2. База данных (Design.glbModelUrl, Design.textureUrl)
3. Компоненты 3D viewer

## Скрипты

Добавлены в `package.json`:

- `gltf:compress` - сжатие GLB файлов
- `texture:ktx2` - конвертация в KTX2
- `texture:optimize` - оптимизация в WebP/AVIF

## Дополнительные ресурсы

- [gltfpack documentation](https://github.com/zeux/meshoptimizer/tree/master/gltf)
- [KTX2 specification](https://www.khronos.org/ktx/)
- [Basis Universal](https://github.com/BinomialLLC/basis_universal)


