# 🚀 Немедленный деплой на Vercel

## ⚠️ Проблема с правами доступа

Текущий пользователь `anatoliyagapov@gmail.com` не имеет доступа к команде `Stvolll's projects` на Vercel.

## ✅ Решение: Деплой через Vercel Dashboard

### Шаг 1: Откройте Vercel Dashboard

**Ссылка**: https://vercel.com/new

### Шаг 2: Import Git Repository

1. Нажмите **"Import Git Repository"**
2. Выберите **`Stvolll/scooter-wraps-landing`**
   - Или вставьте URL: `https://github.com/Stvolll/scooter-wraps-landing`
3. Если репозиторий не виден, убедитесь что:
   - Вы авторизованы в GitHub
   - У вас есть доступ к репозиторию `Stvolll/scooter-wraps-landing`

### Шаг 3: Настройка проекта

Vercel **автоматически определит**:
- ✅ Framework: **Next.js**
- ✅ Build Command: `npm run build`
- ✅ Output Directory: `.next`
- ✅ Install Command: `npm install`

**НЕ меняйте эти настройки!** Они правильные для Next.js.

### Шаг 4: Environment Variables

Добавьте переменные окружения (Settings → Environment Variables):

**Обязательные** (если используются):
```
DATABASE_URL=your_database_url
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=your_region
AWS_S3_BUCKET_NAME=your_bucket_name
NEXT_PUBLIC_S3_BUCKET=your_bucket_name
NEXT_PUBLIC_S3_REGION=your_region
```

**Опциональные**:
```
NEXT_PUBLIC_IMAGE_CDN_DOMAIN=your_cdn_domain
```

### Шаг 5: Deploy

1. Нажмите **"Deploy"**
2. Дождитесь завершения билда
3. Получите URL деплоя

## 🔗 Альтернатива: Добавить пользователя в команду

Если у вас есть доступ к настройкам команды `Stvolll's projects`:

1. Откройте: https://vercel.com/teams/stvollls-projects/settings/members
2. Добавьте `anatoliyagapov@gmail.com` в команду
3. Затем выполните:
   ```bash
   cd /Users/anatolii/scooter-wraps-landing
   npx vercel --prod --yes
   ```

## 📋 Текущий статус

- ✅ **Build**: Успешно (`npm run build` проходит)
- ✅ **Vercel CLI**: Установлен и авторизован
- ✅ **Проект**: Готов к деплою
- ❌ **Права доступа**: Требуется доступ к команде или деплой через Dashboard

## 🌐 После деплоя

1. Проверьте URL (будет показан в Vercel Dashboard)
2. Добавьте домены:
   - `txd.bike` - production/EN
   - `decalwrap.co` - staging/VN
3. Проверьте работу:
   - Главная страница
   - 3D модель
   - API endpoints
   - Админ панель

---

**Дата**: 2025-01-10
**Статус**: Готов к деплою через Dashboard



