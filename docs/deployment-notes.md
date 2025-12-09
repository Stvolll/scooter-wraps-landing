# Deployment Notes

Заметки по развертыванию проекта TXD Design Lifecycle System.

## Предварительные требования

### База данных

1. Создайте PostgreSQL базу данных (Supabase, Neon, Railway, или локально)
2. Получите `DATABASE_URL` connection string
3. Добавьте в `.env.local`:

```bash
DATABASE_URL=postgresql://user:password@host:5432/database
```

### S3 Storage

1. Создайте S3 bucket (AWS или Cloudflare R2)
2. Настройте CORS и bucket policy для публичного доступа
3. Получите credentials (Access Key ID, Secret Access Key)
4. Добавьте в `.env.local`:

```bash
S3_BUCKET=your-bucket-name
S3_REGION=us-east-1
S3_KEY=your-access-key
S3_SECRET=your-secret-key
S3_ENDPOINT=  # Оставьте пустым для AWS, укажите для R2
```

## Установка

### 1. Установить зависимости

```bash
npm install
```

### 2. Настроить переменные окружения

```bash
cp .env.example .env.local
# Отредактируйте .env.local с вашими значениями
```

### 3. Инициализировать базу данных

```bash
# Создать миграцию
npx prisma migrate dev --name design-lifecycle-init

# Сгенерировать Prisma Client
npx prisma generate
```

### 4. Сгенерировать оптимизированные изображения

```bash
npm run image:build
```

### 5. Запустить проект

```bash
npm run dev
```

## Production Build

```bash
# Собрать проект
npm run build

# Запустить production сервер
npm run start
```

## Миграции базы данных

### Development

```bash
npx prisma migrate dev --name your-migration-name
```

### Production

```bash
npx prisma migrate deploy
```

## Оптимизация 3D ассетов

### Перед деплоем

1. Оптимизируйте 3D модели:

   ```bash
   npm run gltf:compress
   ```

2. Оптимизируйте текстуры:

   ```bash
   npm run texture:optimize
   ```

3. Загрузите на S3/CDN и обновите пути в базе данных

## Переменные окружения для Production

Убедитесь, что все переменные из `.env.example` настроены в вашем hosting provider:

- Vercel: Settings → Environment Variables
- Railway: Variables tab
- Heroku: Config Vars

## Мониторинг

### Prisma Studio

Для визуального управления данными:

```bash
npx prisma studio
```

Откроется на `http://localhost:5555`

### Логи

Проверяйте логи на наличие ошибок:

- Database connection errors
- S3 upload errors
- Prisma query errors

## Troubleshooting

### Database connection failed

- Проверьте `DATABASE_URL` формат
- Убедитесь, что база данных доступна
- Проверьте firewall rules

### S3 upload failed

- Проверьте credentials
- Убедитесь, что bucket существует
- Проверьте CORS configuration
- Проверьте bucket policy для public-read

### Prisma Client not found

```bash
npx prisma generate
```

### Build errors

```bash
# Очистить кеш
rm -rf .next
npm run build
```

## CI/CD

Пример GitHub Actions workflow (`.github/workflows/ci.yml`):

```yaml
name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run lint:fix
      - run: npm run build
      - run: npm test
```
