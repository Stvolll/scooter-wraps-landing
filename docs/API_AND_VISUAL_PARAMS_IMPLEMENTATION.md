# Реализация API endpoint и визуальных параметров

## ✅ Выполнено

### 1. API Endpoint `/api/designs/[id]/route.ts`

Создан endpoint согласно документации `MODEL_DESIGN_SYSTEM_AUTONOMOUS.md`:

- ✅ Определяет URL главной текстуры из разных полей (textureWebp, textureUrl, texture, image, textures?.body)
- ✅ Определяет формат изображения по расширению
- ✅ Получает конфигурацию фона (bgWebp, background, panorama)
- ✅ Поддерживает HDRI (hdr, exr) и обычные изображения
- ✅ Работает с базой данных (Prisma) и fallback (designsData)
- ✅ Возвращает правильный JSON формат согласно документации

**Формат ответа:**
```json
{
  "design": {
    "id": "1",
    "modelId": "honda-lead-110",
    "name": "Design 1",
    "mainTexture": {
      "id": "main-texture",
      "payload": {
        "url": "/textures/texture.jpg",
        "width": 2048,
        "height": 2048,
        "format": "jpg"
      },
      "type": "texture"
    },
    "supportMaterials": {
      "photos": [],
      "videos": [],
      "sceneBackground": null
    },
    "version": {
      "major": 1,
      "minor": 0,
      "patch": 0,
      "status": "published"
    },
    "status": "published",
    "previewImageUrl": "/textures/texture.jpg",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

### 2. Визуальные параметры в `ModelScene3D`

Все параметры из `OLD_SITE_ANALYSIS.md` (раздел 3.1) сохранены:

#### 2.1. Параметры камеры ✅
```typescript
const BASE_CAMERA_ORBIT = {
  theta: -90,   // ← строго боковой вид
  phi: 90,      // ← горизонтальный
  radius: 2.5   // ← расстояние 2.5 метра
}
const BASE_CAMERA_TARGET = { 
  x: 0, 
  y: 0.5,  // ← центр на высоте 0.5м
  z: 0 
}
const BASE_FIELD_OF_VIEW = 30  // ← угол обзора 30 градусов
```

#### 2.2. DynamicLighting ✅
- ✅ Rim light: position [0, 2, -5], intensity 2.5→0.3
- ✅ Studio key: position [3, 1.5, 2], width 4, height 4, intensity 0→1.5
- ✅ Studio fill: position [-2, 1, 2], width 3, height 3, intensity 0→0.8
- ✅ Top light: position [0, 5, 0], intensity 0→0.6
- ✅ Ambient: intensity 0.2
- ✅ Диапазоны углов: 40-140°, 140-180°, 220-320°, 320-360°
- ✅ Lerp factor: 0.1

#### 2.3. OrbitControls ✅
```typescript
<OrbitControls
  enableZoom={true}              // ← из документа
  enablePan={false}              // ← из документа
  minDistance={1.2}              // ← из документа
  maxDistance={4}                // ← из документа
  zoomSpeed={0.8}                // ← из документа
  minPolarAngle={(70 * Math.PI) / 180}   // ← 70deg из документа
  maxPolarAngle={(95 * Math.PI) / 180}   // ← 95deg из документа
  minAzimuthAngle={-Infinity}    // ← из документа
  maxAzimuthAngle={Infinity}     // ← из документа
  target={[0, 0.5, 0]}           // ← из документа
  autoRotate                     // ← ВКЛЮЧЕНО из документа
  autoRotateSpeed={0.5}          // ← скорость 0.5 из документа
/>
```

#### 2.4. Canvas настройки ✅
```typescript
<Canvas
  shadows                        // ← из документа
  gl={{
    antialias: true,             // ← из документа
    toneMapping: THREE.ACESFilmicToneMapping,     // ← из документа
    toneMappingExposure: 1.2,    // ← из документа
  }}
/>
```

#### 2.5. Центрирование модели ✅
```typescript
// Центрирование модели (из OLD_SITE_ANALYSIS.md)
clonedScene.traverse((child) => {
  if (child instanceof THREE.Mesh || child instanceof THREE.Group) {
    child.position.sub(center)
  }
})

clonedScene.position.set(0, 0, 0)    // ← из документа
clonedScene.rotation.set(0, 0, 0)    // ← из документа
clonedScene.scale.set(1, 1, 1)       // ← из документа
clonedScene.updateMatrixWorld(true)
```

#### 2.6. Фон контейнера ✅
```typescript
<div
  className={`relative w-full h-full ${className}`}
  style={{ 
    background: 'linear-gradient(180deg, #1a1a1a 0%, #0a0a0a 100%)' 
  }}  // ← ТОЧНЫЙ градиент из документа
>
```

#### 2.7. Настройки текстур ✅
```typescript
// При загрузке текстур (из OLD_SITE_ANALYSIS.md):
texture.flipY = false                     // ← из документа
texture.wrapS = THREE.RepeatWrapping      // ← из документа
texture.wrapT = THREE.RepeatWrapping      // ← из документа
texture.colorSpace = THREE.SRGBColorSpace // ← из документа
```

## Тестирование

### 1. Проверка API endpoint

```bash
# Перезапусти сервер
npm run dev

# Открой в браузере:
http://localhost:3000/api/designs/1
```

**Ожидаемый результат:**
- JSON с полем `design`
- `design.mainTexture.payload.url` содержит URL текстуры
- `design.supportMaterials.sceneBackground` может быть null или объект с фоном

### 2. Проверка главной страницы

Открой `http://localhost:3000`

**В консоли браузера должно быть:**
```
🔍 [API] Fetching design: 1
✅ [API] Design serialized: Design 1
```

### 3. Визуальная проверка

**Чеклист:**

- [ ] **Камера**: Боковой вид модели (строго сбоку, не спереди)
- [ ] **Автовращение**: Модель плавно вращается (скорость 0.5)
- [ ] **Освещение**: Свет меняется при вращении модели
  - При повороте 40-140° - свет усиливается
  - При повороте 140-180° - свет ослабевает
- [ ] **Zoom**: Можно приблизить/отдалить колесом мыши
  - Минимум: близко к модели (1.2m)
  - Максимум: далеко от модели (4m)
- [ ] **Градиент фона**: Темный градиент (#1a1a1a → #0a0a0a)
- [ ] **Дизайн применяется**: При клике на карточку текстура меняется
- [ ] **Карточки**: iOS 26 Glassmorphism стиль сохранён

## Файлы изменены

1. ✅ `app/api/designs/[id]/route.ts` - создан API endpoint
2. ✅ `components/model-design-system/component.tsx` - добавлены визуальные параметры
3. ✅ `components/model-design-system/renderers.ts` - обновлены настройки текстур
4. ✅ `components/ModelScene3DWrapper.tsx` - обновлены настройки Canvas

## Готово! 🎉

Все параметры из `OLD_SITE_ANALYSIS.md` сохранены и применены в компоненте `ModelScene3D`.




