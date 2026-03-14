# Анализ противоречий в User Rules

## 🔍 ОБНАРУЖЕННЫЕ ПРОТИВОРЕЧИЯ

### 1. ❌ Clean Slate Migration vs Integration Task
**Правило:** "Clean Slate Migration - Create NEW empty project folder, DO NOT import old files"
**Реальность:** Пользователь просил интегрировать новый движок в СУЩЕСТВУЮЩИЙ проект, сохраняя UI

**Противоречие:**
- Правило требует создавать новый проект с нуля
- Задача требует интеграции в существующий проект
- Правило запрещает импорт старых файлов
- Задача требует сохранения UI из старого проекта

**Решение:** Правило Clean Slate относится к НОВОМУ проекту (scooter-wraps-platform), а не к текущему (scooter-wraps-landing)

---

### 2. ❌ Three.js Isolation vs Current Implementation
**Правило:** "NO Three.js/WebGL in React components", "Three.js exists ONLY in infrastructure/three/"
**Реальность:** `components/ScooterViewer3D.tsx` использует Three.js напрямую

**Противоречие:**
```typescript
// components/ScooterViewer3D.tsx (PRESENTATION LAYER)
import * as THREE from 'three'  // ❌ Нарушение правила
import { Canvas, useFrame, useThree } from '@react-three/fiber'
```

**Правило говорит:**
- ✅ Three.js exists ONLY in infrastructure/three/
- ❌ React NEVER imports 'three'
- ❌ React NEVER knows about UV, wrapS, repeat

**Текущая реализация:**
- `components/ScooterViewer3D.tsx` импортирует `three` напрямую
- Использует `THREE.TextureLoader`, `THREE.MeshStandardMaterial` и т.д.
- Это presentation layer, но использует Three.js напрямую

**Решение:** Согласно правилам, Three.js должен быть изолирован в `infrastructure/renderers/three/`, а React компоненты должны использовать сервисы из application layer

---

### 3. ⚠️ Registry Pattern vs Direct Material Access
**Правило:** "NO if/switch on material format/type", "Registry pattern is MANDATORY"
**Реальность:** В `ScooterViewer3D.tsx` есть прямые проверки типов материалов

**Противоречие:**
```typescript
// components/ScooterViewer3D.tsx
if (selectedDesign.textures) {
  // New format: multiple textures
} else if (selectedDesign.texture) {
  // Legacy format: single texture
}
```

**Правило говорит:**
- ❌ Forbidden: `if (format === 'texture') { ... }`
- ✅ Required: `processorRegistry.get('texture').process(file)`

**Текущая реализация:**
- Есть if/else проверки формата текстур
- Нет использования registry pattern

**Решение:** Согласно правилам, нужно использовать registry pattern для обработки материалов

---

### 4. ⚠️ Domain Entities vs Presentation Types
**Правило:** "Presentation layer не должен импортировать domain entities напрямую"
**Реальность:** В некоторых местах могут быть прямые импорты

**Проверка требуется:**
- Нужно проверить, импортирует ли presentation layer domain entities
- Согласно правилам, presentation должен использовать только application services и shared-core

---

### 5. ✅ Material Structure - НЕТ противоречия
**Правило:** "NO textures[], videos[], photos[] arrays in Design"
**Реальность:** Используется структура `mainTexture` и `supportMaterials`

**Статус:** ✅ Соответствует правилам

---

## 📋 ИТОГОВАЯ ТАБЛИЦА ПРОТИВОРЕЧИЙ

| # | Противоречие | Правило | Реальность | Критичность |
|---|-------------|---------|------------|-------------|
| 1 | Clean Slate vs Integration | Создать новый проект | Интеграция в существующий | ⚠️ Средняя (объяснено) |
| 2 | Three.js Isolation | Только в infrastructure | В presentation компонентах | ❌ Высокая |
| 3 | Registry Pattern | Обязателен | Прямые if/switch | ⚠️ Средняя |
| 4 | Domain Entities Import | Запрещен в presentation | Требует проверки | ⚠️ Средняя |

## 🔧 РЕКОМЕНДАЦИИ ПО УСТРАНЕНИЮ

### 1. Three.js Isolation (Критично)
**Текущее состояние:**
- `components/ScooterViewer3D.tsx` использует Three.js напрямую
- Это нарушает архитектурные границы

**Решение:**
- Переместить всю Three.js логику в `infrastructure/renderers/three/`
- Создать сервисы в `application/services/` для рендеринга
- React компоненты должны только вызывать сервисы

### 2. Registry Pattern (Средний приоритет)
**Текущее состояние:**
- Есть if/else проверки типов материалов

**Решение:**
- Создать `ProcessorRegistry` для обработки материалов
- Использовать registry вместо прямых проверок

### 3. Clean Slate (Объяснено)
**Решение:**
- Правило относится к новому проекту, не к текущему
- Текущий проект - это интеграция, не новый проект

## ✅ ВЫВОДЫ

1. **Основное противоречие:** Three.js используется в presentation layer, но должен быть только в infrastructure
2. **Среднее противоречие:** Registry pattern не используется везде, где требуется
3. **Объясненное противоречие:** Clean Slate правило относится к другому проекту

## 📝 ПРИОРИТЕТЫ ИСПРАВЛЕНИЯ

1. **Высокий:** Изолировать Three.js в infrastructure layer
2. **Средний:** Внедрить registry pattern для материалов
3. **Низкий:** Проверить импорты domain entities в presentation


## 🔍 ДОПОЛНИТЕЛЬНЫЕ ПРОВЕРКИ

### Проверка импортов domain entities в presentation layer

**Найдено:**
- ✅ `components/LandingDesignCard.tsx` - использует только `MaterialFormat` из `@/lib/materials/types` (не domain)
- ✅ `components/GalleryCard.tsx` - использует `Design` из `@/lib/designsData` (не domain entity)
- ✅ `components/ScooterViewer3DWithDesigns.tsx` - использует `createDesignService` из `@/lib/design-service-client` (application service)
- ✅ `app/api/admin/designs/[id]/route.ts` - использует `MaterialFormat` из `@/src/shared-core/types/MaterialFormat` (shared-core, разрешено)

**Вывод:** ✅ Прямых импортов domain entities в presentation layer не обнаружено

---

## 📊 ФИНАЛЬНАЯ ОЦЕНКА ПРОТИВОРЕЧИЙ

### Критические противоречия (требуют исправления):

1. **❌ Three.js в Presentation Layer** (КРИТИЧНО)
   - **Файлы:** `components/ScooterViewer3D.tsx`, `components/ThreeDViewer.tsx`, `components/scooter-viewer/SceneRenderer.tsx`
   - **Нарушение:** Three.js импортируется напрямую в React компонентах
   - **Правило:** "Three.js exists ONLY in infrastructure/three/"
   - **Решение:** Переместить всю Three.js логику в infrastructure/renderers/three/

### Средние противоречия (желательно исправить):

2. **⚠️ Registry Pattern не используется везде**
   - **Файлы:** `components/ScooterViewer3D.tsx` (if/else проверки формата)
   - **Нарушение:** Прямые проверки типов вместо registry
   - **Правило:** "NO if/switch on material format/type"
   - **Решение:** Внедрить ProcessorRegistry

3. **⚠️ Clean Slate правило (объяснено)**
   - **Статус:** Не противоречие - правило относится к новому проекту
   - **Объяснение:** Текущий проект - интеграция, не новый проект

### Нет противоречий:

4. **✅ Domain Entities Import** - НЕ обнаружено прямых импортов
5. **✅ Material Structure** - Соответствует правилам (mainTexture + supportMaterials)

---

## 🎯 РЕКОМЕНДАЦИИ

### Приоритет 1 (Критично):
1. Изолировать Three.js в infrastructure layer
   - Создать `infrastructure/renderers/three/TextureRenderer.ts`
   - Создать `infrastructure/renderers/three/BackgroundRenderer.ts`
   - Переместить всю Three.js логику из `components/ScooterViewer3D.tsx`
   - React компоненты должны использовать только сервисы из application layer

### Приоритет 2 (Желательно):
2. Внедрить Registry Pattern для материалов
   - Создать `ProcessorRegistry` для обработки материалов
   - Заменить if/else проверки на registry.get()

### Приоритет 3 (Низкий):
3. Продолжить мониторинг импортов domain entities

---

## ✅ ЗАКЛЮЧЕНИЕ

**Основное противоречие:** Three.js используется в presentation layer, но должен быть только в infrastructure layer.

**Статус:** Проект работает, но нарушает архитектурные границы. Требуется рефакторинг для полного соответствия правилам.

