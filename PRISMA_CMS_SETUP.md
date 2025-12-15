# Prisma CMS Setup Guide

Руководство по настройке самописной CMS на Next.js + Prisma для управления дизайнами.

## Установка

### 1. Установить зависимости

```bash
npm install prisma @prisma/client
```

### 2. Настроить базу данных

Создайте файл `.env.local` на основе `.env.example`:

```bash
DATABASE_URL=postgresql://user:pass@localhost:5432/dbname
```

**Варианты базы данных:**

- **PostgreSQL** (рекомендуется) - локально или через [Supabase](https://supabase.com), [Neon](https://neon.tech), [Railway](https://railway.app)
- **MySQL** - измените `provider = "mysql"` в `schema.prisma`
- **SQLite** (для разработки) - измените `provider = "sqlite"` в `schema.prisma`

### 3. Инициализировать Prisma

```bash
# Создать миграцию
npx prisma migrate dev --name init

# Сгенерировать Prisma Client
npx prisma generate
```

### 4. Запустить проект

```bash
npm run dev
```

## Структура

### Модели данных

**Design** - основная модель дизайна:

- `id` - уникальный идентификатор
- `title` - название дизайна
- `slug` - URL-friendly идентификатор
- `scooterModel` - модель скутера
- `price` - цена
- `editionTotal` - общее количество экземпляров
- `editionAvailable` - доступное количество
- `coverImage` - обложка (URL)
- `galleryImages` - галерея изображений (массив URL)
- `glbModelUrl` - ссылка на 3D модель
- `textureUrl` - ссылка на текстуру
- `stages` - JSON с этапами производства
- `published` - статус публикации

**Deal** - сделки/заказы:

- `id` - уникальный идентификатор
- `designId` - связь с дизайном
- `buyerName` - имя покупателя
- `buyerEmail` - email покупателя
- `status` - статус (open | paid)
- `createdAt` - дата создания

### API Routes

- `POST /api/admin/designs/[id]/stages` - обновление этапов производства

### Server Actions

- `createDesign(data)` - создание нового дизайна
- `updateStages(designId, stages)` - обновление этапов
- `togglePublish(designId, publish)` - публикация/снятие с публикации
- `createDeal(designId, buyerName, buyerEmail)` - создание сделки
- `markDealPaid(dealId)` - отметка сделки как оплаченной

### Admin Pages

- `/admin/designs` - список всех дизайнов
- `/admin/designs/new` - создание нового дизайна
- `/admin/designs/[id]` - редактирование дизайна и управление этапами

### Компоненты

- `StageChecklist` - чеклист этапов производства
- `PrismaDesignCard` - карточка дизайна для фронтенда

## Использование

### Создание дизайна

1. Перейдите в `/admin/designs/new`
2. Заполните форму:
   - Title (обязательно)
   - Slug (обязательно, уникальный)
   - Scooter Model (обязательно)
   - Price (опционально)
   - Edition Total (по умолчанию 5)
   - Description (опционально)
3. Нажмите "Create Design"

### Управление этапами

1. Откройте дизайн в `/admin/designs/[id]`
2. В разделе "Production Stages" отметьте выполненные этапы:
   - **creative** - креативная разработка
   - **model3d** - 3D моделирование
   - **uv** - UV развертка
   - **printing** - печать
   - **published** - публикация

### Публикация дизайна

1. Откройте дизайн в `/admin/designs/[id]`
2. Нажмите кнопку "Publish" для публикации
3. Нажмите "Unpublish" для снятия с публикации

## Интеграция с S3

Для загрузки медиа-файлов используйте существующую систему S3:

1. Загрузите файлы через `/api/upload`
2. Получите URL из `/api/upload/url?key=...`
3. Сохраните URL в поле `coverImage`, `galleryImages`, `glbModelUrl`, `textureUrl`

## Пример использования на фронтенде

```tsx
import { prisma } from '@/lib/prisma'
import PrismaDesignCard from '@/components/PrismaDesignCard'

export default async function DesignsPage() {
  const designs = await prisma.design.findMany({
    where: { published: true },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="grid grid-cols-3 gap-4">
      {designs.map(design => (
        <PrismaDesignCard key={design.id} design={design} />
      ))}
    </div>
  )
}
```

## Миграции

После изменения `schema.prisma`:

```bash
# Создать новую миграцию
npx prisma migrate dev --name your_migration_name

# Применить миграции в продакшене
npx prisma migrate deploy
```

## Prisma Studio

Для визуального управления данными:

```bash
npx prisma studio
```

Откроется веб-интерфейс на `http://localhost:5555`

## Troubleshooting

### Ошибка подключения к БД

Проверьте `DATABASE_URL` в `.env.local`:

```bash
DATABASE_URL=postgresql://user:password@host:5432/database
```

### Prisma Client не найден

```bash
npx prisma generate
```

### Ошибки миграции

```bash
# Сбросить БД (только для разработки!)
npx prisma migrate reset

# Применить миграции заново
npx prisma migrate dev
```

## Дополнительные возможности

### Добавить аутентификацию

Используйте `next-auth` для защиты `/admin/*`:

```bash
npm install next-auth
```

### Добавить загрузку медиа

Интегрируйте с существующей системой S3 через `/api/upload`

### Добавить аналитику

Отслеживайте продажи через модель `Deal` и создавайте отчеты




