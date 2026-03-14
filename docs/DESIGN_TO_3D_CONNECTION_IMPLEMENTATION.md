# Реализация связки дизайна с 3D по DESIGN_TO_3D_CONNECTION.md

## Текущая реализация

Связка уже реализована в проекте, но была улучшена согласно документации:

### Архитектура (соответствует документации)

```
LandingDesignCard (карточки) 
    ↓ onClick → handleDesignSelect(design)
app/page.tsx (Hero - управляет состоянием)
    ↓ selectedDesign state
ScooterViewer3DClient (3D вьюер)
    ↓ selectedDesign prop
ScooterViewer3DWithDesigns (сцена)
    ↓ selectedDesign.id → RenderDesignService
RenderDesignService (применяет текстуру и фон)
    ↓ через ClientDesignRepository.getById(designId)
ClientDesignRepository (загружает дизайн через API)
    ↓ преобразует в domain entities
TextureRenderer + BackgroundRenderer (применяют материалы)
```

## Компоненты

### 1. `app/page.tsx` - Hero компонент
- ✅ Управляет состоянием `selectedDesign`
- ✅ Обработчик `handleDesignSelect(design)` обновляет состояние
- ✅ Передает `selectedDesign` в `ScooterViewer`

```typescript
const [selectedDesign, setSelectedDesign] = useState<any>(null)

const handleDesignSelect = (design: any) => {
  setSelectedDesign(design)
}

<ScooterViewer
  selectedDesign={selectedDesign}
  ...
/>
```

### 2. `components/LandingDesignCard.tsx` - Карточки дизайнов
- ✅ При клике вызывает `onImageClick()` callback
- ✅ Показывает состояние `isSelected` для подсветки

```typescript
<div onClick={onImageClick}>
  {/* Карточка дизайна */}
</div>
```

### 3. `components/ScooterViewer3DWithDesigns.tsx` - 3D Сцена
- ✅ Получает `selectedDesign` prop
- ✅ Использует `RenderDesignService` для применения дизайна
- ✅ Обрабатывает очистку при отсутствии дизайна
- ✅ Использует `AbortController` для предотвращения race conditions

```typescript
useEffect(() => {
  if (!selectedDesign?.id) {
    // Очищаем текстуры и фон
    return
  }
  
  renderServiceRef.current
    .render3DSceneGroup(designId, threeScene, scene, signal)
    .then(() => console.log('✅ Design applied'))
}, [selectedDesign?.id, scene, threeScene])
```

### 4. `lib/design-service-client.ts` - Клиентская обёртка
- ✅ Создает `RenderDesignService` с `ClientDesignRepository`
- ✅ Изолирует Three.js зависимости
- ✅ Загружает модули динамически

### 5. `lib/client-design-repository.ts` - Репозиторий
- ✅ Загружает дизайны через API (`/api/admin/designs/[id]`)
- ✅ Преобразует данные API в domain entities
- ✅ Поддерживает разные форматы данных (legacy и новый)

### 6. `src/application/services/RenderDesignService.ts` - Сервис
- ✅ Принимает `designId` (string) и загружает через repository
- ✅ Применяет текстуру через `TextureRenderer`
- ✅ Применяет фон через `BackgroundRenderer`

## Поток данных при клике на карточку

```
1. Пользователь кликает на LandingDesignCard
   ↓
2. onImageClick() → handleDesignSelect(design)
   ↓
3. setSelectedDesign(design) в app/page.tsx
   ↓
4. ScooterViewer получает новый selectedDesign prop
   ↓
5. ScooterViewer3DWithDesigns useEffect срабатывает (selectedDesign.id изменился)
   ↓
6. renderServiceRef.current.render3DSceneGroup(designId, ...)
   ↓
7. RenderDesignService загружает дизайн через ClientDesignRepository.getById(designId)
   ↓
8. ClientDesignRepository загружает через API и преобразует в domain entity
   ↓
9. TextureRenderer применяет mainTexture к мешам модели
   ↓
10. BackgroundRenderer применяет sceneBackground к сцене
   ↓
11. 3D модель обновляется с новой текстурой и фоном ✅
```

## Ключевые улучшения

1. ✅ **Очистка при отсутствии дизайна** - текстуры и фон очищаются
2. ✅ **Race condition protection** - AbortController отменяет предыдущие операции
3. ✅ **Загрузка через repository** - соответствует DDD архитектуре
4. ✅ **Domain entities** - данные преобразуются в domain entities
5. ✅ **Улучшенное логирование** - детальные логи для диагностики

## Соответствие документации

- ✅ Hero управляет состоянием `selectedDesign`
- ✅ LandingDesignCard вызывает callback при клике
- ✅ ScooterViewer3DWithDesigns получает `selectedDesign` prop
- ✅ RenderDesignService применяет дизайн через repository
- ✅ TextureRenderer и BackgroundRenderer применяют материалы
- ✅ Reactive updates через useEffect

## Проверка

1. Откройте главную страницу
2. Кликните на карточку дизайна
3. Проверьте консоль - должны быть логи применения дизайна
4. 3D модель должна обновиться с новой текстурой и фоном




