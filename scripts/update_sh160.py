#!/usr/bin/env python3
"""Скрипт для обновления модели Honda SH160i и всех связанных файлов"""

import shutil
import os
import sys

source_dir = '/Users/anatolii/3D Models Blender/KIRI models/Honda SH160i/MODEL '
target_dir = '/Users/anatolii/scooter-wraps-landing/public'

print('🔄 Обновление модели и материалов для Honda SH160i...')
print('')

try:
    # 1. Основная модель
    print('1. Обновление основной модели...')
    shutil.copy2(f'{source_dir}MODEL_Honda SH160i_.glb', f'{target_dir}/models/sh160/model.glb')
    print('✅ Модель обновлена')
    
    # 2. Текстуры Design 1 (одна общая текстура)
    print('2. Обновление текстуры Design 1...')
    os.makedirs(f'{target_dir}/textures/sh160/design-1', exist_ok=True)
    shutil.copy2(f'{source_dir}DESIGNS/SH160_Design-1/UV Textures/D1_UV_SH160_Z-parts.webp', f'{target_dir}/textures/sh160/design-1/D1_UV_SH160_Z-parts.webp')
    print('✅ Текстура Design 1 обновлена')
    
    # 3. Текстуры Design 2 (одна общая текстура)
    print('3. Обновление текстуры Design 2...')
    os.makedirs(f'{target_dir}/textures/sh160/design-2', exist_ok=True)
    shutil.copy2(f'{source_dir}DESIGNS/SH160_Design-2/UV Textures/D2_UV_SH160_Z-parts.webp', f'{target_dir}/textures/sh160/design-2/D2_UV_SH160_Z-parts.webp')
    print('✅ Текстура Design 2 обновлена')
    
    # 4. Панорамы
    print('4. Обновление панорам...')
    os.makedirs(f'{target_dir}/hdr/sh160', exist_ok=True)
    shutil.copy2(f'{source_dir}DESIGNS/SH160_Design-1/panoram_D1.webp', f'{target_dir}/hdr/sh160/design-1.webp')
    shutil.copy2(f'{source_dir}DESIGNS/SH160_Design-2/panoram_D2.webp', f'{target_dir}/hdr/sh160/design-2.webp')
    print('✅ Панорамы обновлены')
    
    # 5. Видео
    print('5. Обновление видео...')
    os.makedirs(f'{target_dir}/videos/sh160', exist_ok=True)
    shutil.copy2(f'{source_dir}DESIGNS/SH160_Design-1/Visuals/Video_D1_SH160.mp4', f'{target_dir}/videos/sh160/design-1.mp4')
    shutil.copy2(f'{source_dir}DESIGNS/SH160_Design-2/Visuals/Video_D2_SH160.mp4', f'{target_dir}/videos/sh160/design-2.mp4')
    print('✅ Видео обновлены')
    
    # 6. Изображения для галереи карточки товара (из папки Visuals)
    print('6. Обновление изображений для галереи...')
    os.makedirs(f'{target_dir}/images/sh160/design-1', exist_ok=True)
    os.makedirs(f'{target_dir}/images/sh160/design-2', exist_ok=True)
    # Design 1
    shutil.copy2(f'{source_dir}DESIGNS/SH160_Design-1/Visuals/PHOTO-D1_SH160_1.png', f'{target_dir}/images/sh160/design-1/PHOTO-D1_SH160_1.png')
    shutil.copy2(f'{source_dir}DESIGNS/SH160_Design-1/Visuals/PHOTO-D1_SH160_2.png', f'{target_dir}/images/sh160/design-1/PHOTO-D1_SH160_2.png')
    shutil.copy2(f'{source_dir}DESIGNS/SH160_Design-1/Visuals/PHOTO-D1_SH160_3.png', f'{target_dir}/images/sh160/design-1/PHOTO-D1_SH160_3.png')
    # Design 2
    shutil.copy2(f'{source_dir}DESIGNS/SH160_Design-2/Visuals/PHOTO-D2_SH160_1.png', f'{target_dir}/images/sh160/design-2/PHOTO-D2_SH160_1.png')
    shutil.copy2(f'{source_dir}DESIGNS/SH160_Design-2/Visuals/PHOTO-D2_SH160_2.png', f'{target_dir}/images/sh160/design-2/PHOTO-D2_SH160_2.png')
    shutil.copy2(f'{source_dir}DESIGNS/SH160_Design-2/Visuals/PHOTO-D2_SH160_3.png', f'{target_dir}/images/sh160/design-2/PHOTO-D2_SH160_3.png')
    print('✅ Изображения для галереи обновлены')
    
    print('')
    print('✅ Все файлы успешно обновлены!')
    print('')
    print('📋 Обновлено:')
    print('1. ✅ Основная модель: /public/models/sh160/model.glb')
    print('2. ✅ Текстура Design 1: D1_UV_SH160_Z-parts.webp (одна общая текстура)')
    print('3. ✅ Текстура Design 2: D2_UV_SH160_Z-parts.webp (одна общая текстура)')
    print('4. ✅ Панорамы: design-1.webp, design-2.webp')
    print('5. ✅ Видео: design-1.mp4, design-2.mp4')
    print('6. ✅ Изображения для галереи: PHOTO-D1_SH160_*.png, PHOTO-D2_SH160_*.png')
    print('')
    print('💡 Конфигурация в config/scooters.js уже настроена правильно')
    print('💡 Все связи с моделью сохранены')
    
except Exception as e:
    print(f'❌ Ошибка: {e}')
    import traceback
    traceback.print_exc()
    sys.exit(1)

