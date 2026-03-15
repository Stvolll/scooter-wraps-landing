# Отчёт: устройство 3D-сцены для стороннего разработчика

Документ описывает два варианта реализации 3D-сцены: референс (GitHub + Vercel) и текущий проект `scooter-wraps-landing`.

---

## Вариант 1. Как устроена 3D-сцена по референсам

**Источники:**
- Репозиторий: [https://github.com/Stvolll/scooter-wraps-landing](https://github.com/Stvolll/scooter-wraps-landing)
- Продакшен: [https://scooter-wraps-landing.vercel.app/](https://scooter-wraps-landing.vercel.app/)

### Стек и окружение

- **Framework:** Next.js 14 (App Router)
- **3D:** Three.js, `@react-three/fiber`, `@react-three/drei`
- **Данные:** модели скутеров и дизайны приходят из API или конфига (PostgreSQL + Prisma на бэкенде)

### Роль 3D на главной

- На лендинге отображаются несколько моделей (Honda Vision, Honda Lead, Honda SH, Honda PCX, Yamaha NVX).
- Пользователь выбирает модель из меню; для выбранной модели показывается 3D-модель скутера и список дизайнов.
- Герой-блок — полноэкранная (или крупная) 3D-сцена с одной выбранной моделью и опционально применённым дизайном (текстура + фон).

### Архитектура 3D (референсный вариант)

1. **Два пути рендера**
   - **Упрощённый:** один компонент-вьюер (например, обёртка над R3F Canvas), получает `modelUrl` и `panoramaUrl`, рендерит модель и фон.
   - **Полный (Design Lifecycle):** слой домена (Design, TextureMaterial, BackgroundMaterial, SupportMaterials), сервис рендера (`RenderDesignService`), репозиторий дизайнов (API). Применение дизайна = текстуры на меши + фон сцены.

2. **Модель (GLB)**
   - Один GLB на модель скутера (например, Honda Vision).
   - Загрузка через `useGLTF(modelUrl)` (drei).
   - Позиционирование: по bounding box модель центрируется и при необходимости ставится «на пол» (смещение по Y так, чтобы низ bbox был на заданном уровне пола).

3. **Фон сцены (панорама 2:1)**
   - **Без геометрии:** не сфера и не цилиндр.
   - Панорама задаётся как **текстура на `scene.background`**.
   - Загрузка: `THREE.TextureLoader().load(panoramaUrl, ...)`.
   - Настройки текстуры:
     - `texture.mapping = THREE.EquirectangularReflectionMapping` — чтобы Three.js рисовал 2:1 equirectangular как фон.
     - `texture.colorSpace = THREE.SRGBColorSpace` (при необходимости).
   - Приоритет источника фона: Panorama-материал из дизайна → fallback URL (например, из модели/дизайна) → дефолтный градиент (canvas 256×256, например #1a1a1a → #0a0a0a).
   - Реализация в коде: класс `BackgroundRenderer` (или аналог), метод `render(scene, design, fallbackUrl)` — очистка старого фона, загрузка текстуры по URL, присвоение `scene.background = texture` и при необходимости `scene.environment = texture` для HDRI.

4. **Камера**
   - PerspectiveCamera.
   - Начальная позиция: боковой вид (например, `position (0, 0.4, 2.5)`, `lookAt(0, 0.4, 0)`).
   - FOV обычно 30°.
   - Target (точка наведения) задаётся для OrbitControls и камеры одинаково (например, по вертикали на уровне «пола» или центра модели).

5. **Управление**
   - OrbitControls: вращение вокруг модели, зум (ограничения min/max distance), ограничение полярного угла (не смотреть строго сверху/снизу), опционально autoRotate.

6. **Текстура дизайна на модель**
   - На меши накладывается только там, где имя меша указывает на UV-часть (например, содержит `Z-places` или `UV`).
   - Остальные меши сохраняют исходный материал модели.
   - Загрузка текстуры по URL дизайна (например, `design.texture` / `textureUrl`), применение через `material.map = texture`.

7. **Освещение**
   - Ambient + directional/area-лайты в зависимости от реализации (в референсе может быть статичный набор или динамика по углу поворота модели).

### Итог по варианту 1

- Модель: один GLB на модель, центрирование по bbox, пол на заданном Y.
- Фон: **только `scene.background`** с текстурой в **EquirectangularReflectionMapping**, без мешей-сфер/цилиндров.
- Данные: модель и панорама приходят из API (модель скутера + выбранный дизайн или модель по умолчанию).

---

## Вариант 2. Как устроена 3D-сцена в проекте scooter-wraps-landing

**Контекст:** локальный/форк того же продукта (TXD Premium Vinyl Wraps for Scooters). Цель — совпадение визуала и контракта с референсом, с явными константами и правилами.

### Место в приложении

- **Главная страница:** `app/page.tsx`.
- Данные: `GET /api/scooters` — список моделей с полями `id`, `name`, `model` / `glbModelUrl`, `panorama`, `designs[]`. Fallback при недоступности API: `config/scooters.js`.
- Выбор модели: `selectedModel` (slug), выбор дизайна: `selectedDesign` (первый дизайн модели по умолчанию).
- Герой: фиксированная секция 70vh, внутри — один компонент 3D-вьюера.

### Компонент 3D-сцены

- **Файл:** `components/ScooterViewer3D.tsx`.
- **Рендер:** React Three Fiber (`Canvas` из `@react-three/fiber`), внутри одна сцена с моделью, фоном, светом и OrbitControls.

### Пропсы вьюера

| Проп            | Тип     | Описание |
|-----------------|---------|----------|
| `modelPath`     | string  | URL GLB-модели (например, `currentScooter.glbModelUrl \|\| currentScooter.model`) |
| `selectedDesign`| object  | Опционально. Объект дизайна с полем `texture` (URL текстуры для UV-мешей). |
| `panoramaUrl`   | string  | URL панорамы 2:1 для фона. Если нет — используется `/hdr/panoramic_3.webp`. |
| `className`     | string  | Опционально, для обёртки. |

На главной передаётся:
- `modelPath={currentScooter.glbModelUrl || currentScooter.model}`
- `selectedDesign={selectedDesign}`
- `panoramaUrl={currentPanorama}` (см. ниже).

### Модель (GLB)

- Загрузка: `useGLTF(modelPath)` (drei), используется `gltf.scene`.
- Позиционирование «на пол»:
  - Константа пола: `FLOOR_Y = 0.12` (в мировых единицах).
  - После загрузки: `box = new THREE.Box3().setFromObject(scene)`, затем `scene.position.y = FLOOR_Y - box.min.y`, чтобы низ модели (колёса) визуально совпадал с уровнем пола под кнопками меню.
- Текстура дизайна: если есть `selectedDesign.texture`, загружается через `THREE.TextureLoader`, накладывается **только** на меши, у которых в имени есть `Z-places`, `UV` или `uv`; остальные меши не трогаются. `flipY = false`, цветовое пространство sRGB.

### Фон сцены (панорама)

- Реализация: компонент **PanoramaBackground** внутри того же R3F-дерева.
- Логика:
  - Берёт `scene` через `useThree()`.
  - Загружает текстуру по `panoramaUrl` (или `/hdr/panoramic_3.webp`) через `THREE.TextureLoader`.
  - Настройки: `tex.mapping = THREE.EquirectangularReflectionMapping`, `tex.colorSpace = THREE.SRGBColorSpace`.
  - Присвоение: `scene.background = tex`.
  - При отсутствии URL или ошибке загрузки: `scene.background = new THREE.Color(0x0a0a0a)`.
  - При размонтировании или смене URL: dispose предыдущей текстуры (если это была текстура), снова ставится цвет `0x0a0a0a`.
- Геометрия фона **не используется** (ни сфера, ни цилиндр).

### Камера и target

- Константы:
  - `FLOOR_Y = 0.12`
  - `ORBIT_TARGET_Y = FLOOR_Y + 0.28`
- Начальная камера (в `useEffect` по `camera`):
  - `camera.position.set(0, ORBIT_TARGET_Y, 2.5)`
  - `camera.lookAt(0, ORBIT_TARGET_Y, 0)`
  - `camera.fov = 30`, `camera.updateProjectionMatrix()`.
- OrbitControls: `target={[0, ORBIT_TARGET_Y, 0]}`, т.е. точка наведения совпадает с центром обзора по вертикали.

### OrbitControls

- `enableZoom={true}`, `enablePan={false}`.
- `minDistance={1.5}`, `maxDistance={5}`, `zoomSpeed={0.8}`.
- `minPolarAngle={Math.PI / 4}`, `maxPolarAngle={Math.PI / 2.1}` (ограничение по вертикальному углу).
- `autoRotate`, `autoRotateSpeed={0.5}`.

### Освещение

- Компонент **DynamicLighting** по углу поворота модели (`rotationY` в градусах):
  - Боковые виды (около 0°/180°): rim light (directional сзади), интенсивность выше.
  - Фронтовые (40°–140°, 220°–320°): студийный свет (rectAreaLight key + fill + directional сверху), плавный переход по углу.
- Дополнительно в сцене: `ambientLight intensity={0.5}`, `directionalLight position={[5,5,5]} intensity={1}`.

### Откуда берутся modelPath и panoramaUrl на главной

- **modelPath:** из объекта текущей модели: `currentScooter.glbModelUrl || currentScooter.model`. `currentScooter` — модель, соответствующая `selectedModel`, из ответа `/api/scooters` (или из `config/scooters.js`).
- **panoramaUrl:** в коде главной страницы задаётся как `currentPanorama`:
  - Сейчас: если есть `selectedDesign`, то `selectedDesign.panorama || selectedDesign.background`; если URL начинается с `/hdr/`, используется он, иначе fallback `/hdr/panoramic_3.webp`.
  - В API дизайны приходят с полем `panorama` (или `bg_webp` / материалы PANORAMA); при необходимости можно передавать в герой панораму дизайна или панораму модели (`currentScooter.panorama`) по той же схеме, что и в референсе.

### Правила позиционирования моделей (общие)

- Документ: `docs/3D_MODEL_POSITIONING_RULES.md`.
- Все модели должны визуально вести себя одинаково: позиция модели (0,0,0), rotation (0,0,0), scale (1,1,1) после коррекции по bbox; камера и target — единые (в текущем коде target по Y = ORBIT_TARGET_Y). Новые GLB должны быть рассчитаны на те же правила (центрирование и пол на FLOOR_Y).

### Итог по варианту 2

- Один компонент: **ScooterViewer3D** (R3F, один Canvas).
- Модель: GLB по `modelPath`, пол на `FLOOR_Y`, текстура дизайна только на UV-меши.
- Фон: **только `scene.background`** с текстурой **EquirectangularReflectionMapping**, без мешей.
- Камера: FOV 30°, target и позиция привязаны к `ORBIT_TARGET_Y`.
- Управление: OrbitControls с зумом и ограничением полярного угла, autoRotate.
- Данные: модель и панорама из `/api/scooters` и выбранного дизайна.

---

## Сводная таблица

| Аспект              | Вариант 1 (референс GitHub/Vercel)     | Вариант 2 (проект scooter-wraps-landing)        |
|---------------------|----------------------------------------|-------------------------------------------------|
| Фон                 | scene.background + EquirectangularReflectionMapping | То же (PanoramaBackground)                      |
| Геометрия фона      | Нет                                    | Нет                                             |
| Модель              | useGLTF, центрирование по bbox         | useGLTF, пол на FLOOR_Y (0.12)                  |
| Текстура дизайна    | На UV-меши (по имени)                  | На меши с Z-places/UV/uv в имени               |
| Камера              | Боковой вид, FOV 30°                   | (0, ORBIT_TARGET_Y, 2.5), target Y = 0.4       |
| Target              | По уровню пола/модели                  | (0, ORBIT_TARGET_Y, 0), ORBIT_TARGET_Y = 0.4   |
| OrbitControls       | Зум, ограничение углов                 | minDistance 1.5, max 5, polarAngle π/4…π/2.1   |
| Источник данных     | API / конфиг                           | GET /api/scooters + config/scooters.js         |

---

## Что передать стороннему разработчику

1. **Ссылки:** [GitHub](https://github.com/Stvolll/scooter-wraps-landing), [Vercel](https://scooter-wraps-landing.vercel.app/).
2. **Этот отчёт** — `docs/3D_SCENE_REPORT_FOR_DEVELOPERS.md` (варианты 1 и 2).
3. **Ключевые файлы в проекте:**
   - `components/ScooterViewer3D.tsx` — реализация сцены (модель, фон, камера, свет, OrbitControls).
   - `app/page.tsx` — использование вьюера, откуда берутся `modelPath`, `panoramaUrl`, `selectedDesign`.
   - `docs/3D_MODEL_POSITIONING_RULES.md` — правила координат и масштаба для всех моделей.
   - `docs/3D_ARCHITECTURE.md` — уровни 3D (модель, UV, текстуры).
4. **Формат панорамы:** 2:1 equirectangular (WebP/JPG/PNG); для фона обязательно `EquirectangularReflectionMapping`, без отдельной геометрии.

При необходимости можно вынести константы сцены (FLOOR_Y, ORBIT_TARGET_Y, limиты камеры) в один конфиг и сослаться на него в отчёте.
