# Инструкция по деплою в Vercel

## ⚠️ Важно: Это Next.js проект

Проект использует **Next.js 14 (App Router)**, а не статический HTML сайт. Настройки Vercel должны быть для Next.js.

## Правильные настройки Vercel

### Framework Preset
- **Framework Preset**: `Next.js`
- **НЕ используйте**: "Other" или "Static"

### Build Settings
- **Build Command**: `npm run build` (или оставить пустым - Vercel определит автоматически)
- **Output Directory**: `.next` (или оставить пустым - Vercel определит автоматически)
- **Install Command**: `npm install` (или оставить пустым)

### Environment Variables
Убедитесь, что установлены все переменные из `.env.example`:
- `DATABASE_URL`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION`
- `AWS_S3_BUCKET_NAME`
- `NEXT_PUBLIC_S3_BUCKET`
- `NEXT_PUBLIC_S3_REGION`
- `NEXT_PUBLIC_IMAGE_CDN_DOMAIN` (опционально)

## Автоматический деплой через GitHub

1. **Подключите репозиторий в Vercel:**
   - Зайдите в Vercel Dashboard
   - Нажмите "Add New Project"
   - Выберите репозиторий `Stvolll/scooter-wraps-landing`
   - Vercel автоматически определит Next.js

2. **Настройте переменные окружения:**
   - Settings → Environment Variables
   - Добавьте все переменные из `.env.example`

3. **Деплой:**
   - Vercel автоматически задеплоит при push в `main`
   - Или нажмите "Deploy" вручную

## Ручной деплой через Vercel CLI

```bash
# Установите Vercel CLI (если еще не установлен)
npm i -g vercel

# Логин в Vercel
vercel login

# Деплой
vercel --prod
```

## Очистка кеша Vercel

Если нужно очистить старые билды:
1. Vercel Dashboard → Project → Settings → General
2. Scroll down to "Clear Build Cache"
3. Нажмите "Clear Build Cache"

## Проверка деплоя

После деплоя проверьте:
- ✅ Главная страница загружается
- ✅ 3D модель отображается
- ✅ API endpoints работают (`/api/gallery`, `/api/testimonials`, `/api/contact`)
- ✅ Админ панель доступна (`/admin`)
- ✅ Все статические файлы загружаются

## Домены

Проект настроен для работы с двумя доменами:
- `txd.bike` - production/EN
- `decalwrap.co` - staging/VN

Убедитесь, что оба домена добавлены в Vercel Project Settings → Domains.



