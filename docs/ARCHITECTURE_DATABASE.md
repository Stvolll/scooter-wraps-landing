# 🏗️ Архитектура с базой данных

## 📊 Структура системы

```
┌──────────────────────────────────────────────────────────────────┐
│                          ФРОНТЕНД                                │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐│
│  │ app/page.tsx                                               ││
│  │ (Главная страница с 3D-моделью и дизайнами)              ││
│  └────────────────────────────────────────────────────────────┘│
│                              ↓                                   │
│                    GET /api/scooters                             │
│                              ↓                                   │
│  ┌────────────────────────────────────────────────────────────┐│
│  │ Prisma Client                                              ││
│  │ → PostgreSQL                                                ││
│  └────────────────────────────────────────────────────────────┘│
│                              ↓ (если ошибка)                     │
│  ┌────────────────────────────────────────────────────────────┐│
│  │ Fallback: config/scooters.js                               ││
│  └────────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                          АДМИНКА                                 │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐│
│  │ app/admin/models/page.tsx                                  ││
│  │ (Список моделей)                                           ││
│  └────────────────────────────────────────────────────────────┘│
│                              ↓                                   │
│                    GET /api/admin/models                         │
│                              ↓                                   │
│  ┌────────────────────────────────────────────────────────────┐│
│  │ Prisma Client                                              ││
│  │ → PostgreSQL (ScooterModel)                                 ││
│  └────────────────────────────────────────────────────────────┘│
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐│
│  │ ModelsListClient                                           ││
│  │ (Клиентский компонент для CRUD)                            ││
│  └────────────────────────────────────────────────────────────┘│
│                              ↓                                   │
│           POST/PUT/DELETE /api/admin/models/[id]                 │
│                              ↓                                   │
│  ┌────────────────────────────────────────────────────────────┐│
│  │ ✅ Удаление работает!                                       ││
│  │ ✅ Каскадное удаление дизайнов                              ││
│  │ ✅ Type-safe операции                                       ││
│  └────────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                       БАЗА ДАННЫХ                                │
│                                                                  │
│  ┌─────────────────────┐         ┌───────────────────────────┐  │
│  │ ScooterModel        │         │ Design                    │  │
│  │─────────────────────│         │───────────────────────────│  │
│  │ id (cuid)           │         │ id (cuid)                 │  │
│  │ slug (unique) ──────┼────┐    │ scooterModelId ───────────│  │
│  │ name                │    │    │ title                     │  │
│  │ model (path)        │    │    │ slug (unique)             │  │
│  │ panorama (path)     │    └───→│ ...                        │  │
│  │ active              │         │                           │  │
│  │ order               │         │                           │  │
│  │ createdAt           │         └───────────────────────────┘  │
│  │ updatedAt           │                   ↓ 1:N                │
│  └─────────────────────┘         ┌───────────────────────────┐  │
│            ↓ 1:N                  │ DesignTexture             │  │
│                                   │───────────────────────────│  │
│                                   │ id (cuid)                 │  │
│                                   │ designId                  │  │
│                                   │ url                       │  │
│                                   │ type (diffuse/normal/..)  │  │
│                                   │ format (webp/png)         │  │
│                                   └───────────────────────────┘  │
│                                                                  │
│  PostgreSQL (production) / SQLite (не поддерживается)           │
└──────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Потоки данных

### 1. Загрузка моделей на фронтенде

```
User → app/page.tsx
         ↓
      useEffect()
         ↓
   fetch('/api/scooters')
         ↓
   GET /api/scooters (route.ts)
         ↓
   prisma.scooterModel.findMany()
         ↓
   PostgreSQL
         ↓
   Response: { scooters: {...} }
         ↓
   setState(scooters)
         ↓
   Render (ScooterViewer + DesignCards)
```

**Fallback:**
```
fetch('/api/scooters') → Error
         ↓
   import('@/config/scooters')
         ↓
   Response: { scooters: {...} }
```

---

### 2. Удаление модели в админке

```
User → Нажимает "🗑️ Удалить"
         ↓
   ModelsListClient.handleDelete()
         ↓
   confirm("Вы уверены?")
         ↓
   fetch('/api/admin/models/[id]', { method: 'DELETE' })
         ↓
   DELETE /api/admin/models/[id]/route.ts
         ↓
   prisma.scooterModel.delete({ where: { slug } })
         ↓
   PostgreSQL (CASCADE удаляет связанные designs)
         ↓
   Response: { message: 'Model deleted successfully' }
         ↓
   setState(updatedScooters) // Удаляем из UI
         ↓
   alert('Модель успешно удалена')
```

**✨ Ключевое изменение:** 
- **До**: Пытался изменить файл `config/scooters.js` через API → **Ошибка**
- **Теперь**: Удаляет из БД через Prisma → **Работает!**

---

### 3. Создание новой модели

```
User → /admin/models/new
         ↓
   Заполняет форму (name, id, model, panorama)
         ↓
   Загружает файлы через FileUpload
         ↓
   POST /api/admin/models
         ↓
   prisma.scooterModel.create({ data: {...} })
         ↓
   PostgreSQL
         ↓
   Response: { model: {...} }
         ↓
   router.push('/admin/models')
```

---

## 📦 Файловая структура

```
scooter-wraps-landing/
├── app/
│   ├── page.tsx                          # Фронтенд (загружает из API)
│   ├── admin/
│   │   └── models/
│   │       ├── page.tsx                  # Список моделей (SSR + Prisma)
│   │       ├── ModelsListClient.tsx      # Клиент для CRUD
│   │       ├── [id]/
│   │       │   ├── page.tsx             # Детали модели
│   │       │   ├── edit/page.tsx        # Редактирование
│   │       │   └── designs/...          # Дизайны
│   │       └── new/page.tsx             # Создание модели
│   └── api/
│       ├── scooters/
│       │   └── route.ts                 # Публичный API (GET)
│       └── admin/
│           └── models/
│               ├── route.ts             # GET (list) + POST (create)
│               └── [id]/
│                   └── route.ts         # GET/PUT/DELETE для конкретной модели
│
├── lib/
│   ├── prisma.ts                        # Prisma Client (singleton)
│   └── api/
│       └── scooters.ts                  # Utility функции для API
│
├── prisma/
│   ├── schema.prisma                    # Схема БД
│   └── seed.ts                          # Seed скрипт (config → БД)
│
└── config/
    └── scooters.js                      # Fallback данные
```

---

## 🔐 Type Safety с Prisma

### До (без типов):
```typescript
const scooters = require('@/config/scooters')
// Нет типов, можно ошибиться
scooters.someModel.nonExistentField // ❌ Ошибка в runtime
```

### После (с Prisma):
```typescript
import { prisma } from '@/lib/prisma'

const model = await prisma.scooterModel.findUnique({
  where: { slug: 'vision' }
})
// ✅ TypeScript знает все поля
model.nonExistentField // ❌ Ошибка компиляции (IDE подсветит)
```

---

## 🚀 Преимущества новой архитектуры

| Аспект | До | После |
|--------|----|----|
| **Хранение** | Файл `config/scooters.js` | PostgreSQL БД |
| **Удаление** | ❌ Не работает | ✅ Работает |
| **Персистентность** | ❌ Терялось при рестарте | ✅ Сохраняется |
| **Типизация** | ❌ Нет типов | ✅ Type-safe с Prisma |
| **Масштабируемость** | ❌ Один файл | ✅ Миллионы записей |
| **Связи** | ❌ Вручную | ✅ Foreign keys + CASCADE |
| **Миграции** | ❌ Ручное изменение файла | ✅ Prisma Migrate |
| **GUI** | ❌ Текстовый редактор | ✅ Prisma Studio |
| **Production** | ❌ Не готово | ✅ Готово (Neon/Supabase) |

---

## 🛡️ Fallback механизм

Если БД не настроена или недоступна:

1. **API попробует подключиться к БД**
2. **При ошибке** → автоматически загрузит `config/scooters.js`
3. **Админка покажет предупреждение** о том, что БД не настроена
4. **Фронтенд продолжит работать** с файловыми данными

```typescript
try {
  const models = await prisma.scooterModel.findMany()
  return models
} catch (error) {
  console.warn('DB not available, using fallback')
  const { scooters } = await import('@/config/scooters')
  return scooters
}
```

**Преимущество**: Приложение никогда не упадет из-за отсутствия БД!

---

## 📈 Production Setup

### Development (Local):
```
PostgreSQL (Docker) ← Prisma Client ← Next.js Dev Server
```

### Production (Vercel + Neon):
```
Neon PostgreSQL ← Prisma Client ← Vercel Serverless Functions
```

### CI/CD Pipeline:
```bash
# package.json
{
  "scripts": {
    "vercel-build": "prisma generate && prisma migrate deploy && next build"
  }
}
```

**Результат**: Автоматическая миграция БД при каждом деплое!

---

## 🔄 Миграции

### Создание миграции:
```bash
# 1. Изменяем schema.prisma
# 2. Создаём миграцию
npx prisma migrate dev --name add_new_field

# 3. Prisma автоматически:
#    - Создаёт SQL файл в prisma/migrations/
#    - Применяет миграцию к БД
#    - Обновляет Prisma Client
```

### Production миграция:
```bash
# Применяет все pending миграции
npx prisma migrate deploy
```

---

## 🎯 Итог

**Админка теперь:**
- ✅ Работает с PostgreSQL
- ✅ Поддерживает все CRUD операции
- ✅ Type-safe с TypeScript + Prisma
- ✅ Имеет fallback на файлы
- ✅ Готова к production
- ✅ Легко масштабируется
- ✅ Удобна для разработки (Prisma Studio)

**Следующие шаги:**
1. Настройте PostgreSQL (Docker или Neon)
2. Запустите миграции
3. Перенесите данные через seed
4. Наслаждайтесь работающей админкой! 🎉






