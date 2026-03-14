# 🗄️ Настройка базы данных PostgreSQL

## Быстрый старт с Docker (рекомендуется)

### 1. Установите Docker Desktop
- **macOS**: https://www.docker.com/products/docker-desktop/
- Запустите Docker Desktop

### 2. Запустите PostgreSQL контейнер

```bash
docker run --name scooter-wraps-db \
  -e POSTGRES_USER=scooter_user \
  -e POSTGRES_PASSWORD=scooter_pass \
  -e POSTGRES_DB=scooter_wraps \
  -p 5432:5432 \
  -d postgres:16-alpine
```

### 3. Обновите `.env.local`

```bash
# Замените существующую строку DATABASE_URL на:
DATABASE_URL="postgresql://scooter_user:scooter_pass@localhost:5432/scooter_wraps?schema=public"
```

### 4. Запустите миграцию

```bash
cd /Users/anatolii/scooter-wraps-landing
npx prisma migrate dev
npx prisma generate
```

### 5. Заполните БД данными из config/scooters.js

```bash
npx tsx prisma/seed.ts
```

---

## Альтернатива: Локальная установка PostgreSQL

### macOS (через Homebrew)

```bash
# Установка
brew install postgresql@16

# Запуск
brew services start postgresql@16

# Создание БД
createdb scooter_wraps

# Обновите .env.local
DATABASE_URL="postgresql://$(whoami)@localhost:5432/scooter_wraps?schema=public"
```

---

## Проверка подключения

```bash
# Откройте Prisma Studio для просмотра данных
npx prisma studio
```

Откроется браузер с интерфейсом для просмотра и редактирования данных.

---

## Управление Docker контейнером

```bash
# Остановить
docker stop scooter-wraps-db

# Запустить снова
docker start scooter-wraps-db

# Удалить (ВНИМАНИЕ: удалит все данные!)
docker rm -f scooter-wraps-db
```

---

## Troubleshooting

### Ошибка: "port is already allocated"
```bash
# Проверьте, не запущен ли уже PostgreSQL
lsof -i :5432

# Остановите существующий процесс или измените порт в команде docker run
```

### Ошибка: "Can't reach database server"
```bash
# Проверьте статус контейнера
docker ps -a

# Посмотрите логи
docker logs scooter-wraps-db
```

---

## Production (Vercel + Neon/Supabase)

Для production рекомендуется использовать управляемую PostgreSQL БД:

### Вариант 1: Neon (рекомендуется)
1. Зарегистрируйтесь на https://neon.tech
2. Создайте новый проект
3. Скопируйте connection string
4. Добавьте в Vercel Environment Variables:
   ```
   DATABASE_URL=postgresql://...
   ```

### Вариант 2: Supabase
1. Зарегистрируйтесь на https://supabase.com
2. Создайте новый проект
3. Settings → Database → Connection string
4. Добавьте в Vercel Environment Variables

---

## Полезные команды Prisma

```bash
# Создать новую миграцию после изменений в schema.prisma
npx prisma migrate dev --name описание_изменений

# Применить миграции в production
npx prisma migrate deploy

# Сгенерировать Prisma Client
npx prisma generate

# Сбросить БД и применить все миграции
npx prisma migrate reset

# Открыть Prisma Studio
npx prisma studio
```






