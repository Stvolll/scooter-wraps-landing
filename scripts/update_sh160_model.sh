#!/bin/bash

# Скрипт для обновления модели Honda SH160i и всех связанных файлов

SOURCE_DIR="/Users/anatolii/3D Models Blender/KIRI models/Honda SH160i/MODEL "
TARGET_DIR="/Users/anatolii/scooter-wraps-landing/public"

echo "🔄 Обновление модели и материалов для Honda SH160i..."
echo ""

# 1. Основная модель
echo "1. Обновление основной модели..."
cp "${SOURCE_DIR}MODEL_Honda SH160i_.glb" "${TARGET_DIR}/models/sh160/model.glb"
echo "✅ Модель обновлена: ${TARGET_DIR}/models/sh160/model.glb"

# 2. Текстуры Design 1
echo ""
echo "2. Обновление текстур Design 1..."
cp "${SOURCE_DIR}DESIGNS/SH160_Design-1/UV Textures/UV_SH160_A-face.webp" "${TARGET_DIR}/textures/sh160/design-1/a-face.webp"
cp "${SOURCE_DIR}DESIGNS/SH160_Design-1/UV Textures/UV_SH160_RL-place.webp" "${TARGET_DIR}/textures/sh160/design-1/rl-place.webp"
cp "${SOURCE_DIR}DESIGNS/SH160_Design-1/UV Textures/UV_SH160_Z-parts.webp" "${TARGET_DIR}/textures/sh160/design-1/z-parts.webp"
echo "✅ Текстуры Design 1 обновлены"

# 3. Текстуры Design 2
echo ""
echo "3. Обновление текстур Design 2..."
cp "${SOURCE_DIR}DESIGNS/SH160_Design-2/UV Textures/UV_SH160_A-face.webp" "${TARGET_DIR}/textures/sh160/design-2/a-face.webp"
cp "${SOURCE_DIR}DESIGNS/SH160_Design-2/UV Textures/UV_SH160_RL-place.webp" "${TARGET_DIR}/textures/sh160/design-2/rl-place.webp"
cp "${SOURCE_DIR}DESIGNS/SH160_Design-2/UV Textures/UV_SH160_Z-parts.webp" "${TARGET_DIR}/textures/sh160/design-2/z-parts.webp"
echo "✅ Текстуры Design 2 обновлены"

# 4. Панорамы
echo ""
echo "4. Обновление панорам..."
mkdir -p "${TARGET_DIR}/hdr/sh160"
cp "${SOURCE_DIR}DESIGNS/SH160_Design-1/panoram_D1.webp" "${TARGET_DIR}/hdr/sh160/design-1.webp"
cp "${SOURCE_DIR}DESIGNS/SH160_Design-2/panoram_D2.webp" "${TARGET_DIR}/hdr/sh160/design-2.webp"
echo "✅ Панорамы обновлены"

# 5. Видео
echo ""
echo "5. Обновление видео..."
mkdir -p "${TARGET_DIR}/videos/sh160"
cp "${SOURCE_DIR}DESIGNS/SH160_Design-1/Visuals/Video_D1_SH160.mp4" "${TARGET_DIR}/videos/sh160/design-1.mp4"
cp "${SOURCE_DIR}DESIGNS/SH160_Design-2/Visuals/Video_D2_SH160.mp4" "${TARGET_DIR}/videos/sh160/design-2.mp4"
echo "✅ Видео обновлены"

echo ""
echo "✅ Все файлы успешно обновлены!"
echo ""
echo "📋 Обновлено:"
echo "1. ✅ Основная модель: /public/models/sh160/model.glb"
echo "2. ✅ Текстуры Design 1: a-face.webp, rl-place.webp, z-parts.webp"
echo "3. ✅ Текстуры Design 2: a-face.webp, rl-place.webp, z-parts.webp"
echo "4. ✅ Панорамы: design-1.webp, design-2.webp"
echo "5. ✅ Видео: design-1.mp4, design-2.mp4"
echo ""
echo "💡 Конфигурация в config/scooters.js уже настроена правильно"






