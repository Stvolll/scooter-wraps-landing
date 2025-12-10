# 🚀 Статус деплоя на Vercel

## ✅ Что готово:

1. **Проект собран**: `npm run build` проходит успешно
2. **Vercel CLI установлен**: v49.1.2
3. **Проект привязан к Vercel**:
   - Project ID: `prj_EkoJjumm3gf5BRCezkMWo2Z2WAbM`
   - Organization ID: `team_jbDwVuZO005vC2iAkYDY08Ap`
   - Project Name: `scooter-wraps-landing`
4. **GitHub Actions workflow создан**: `.github/workflows/deploy.yml`
5. **Vercel Dashboard открыт**: готов к импорту

## ⚠️ Проблема:

**Git author `anatoliyagapov@gmail.com` не имеет доступа к команде `Stvolll's projects` на Vercel.**

## 🔧 Решения:

### Вариант 1: Добавить пользователя в команду (рекомендуется)

1. Откройте: https://vercel.com/teams/stvollls-projects/settings/members
2. Добавьте `anatoliyagapov@gmail.com` в команду
3. Затем выполните:
   ```bash
   cd /Users/anatolii/scooter-wraps-landing
   npx vercel --prod --yes
   ```

### Вариант 2: Деплой через Vercel Dashboard

1. Откройте: https://vercel.com/new
2. Найдите репозиторий `scooter-wraps-landing` или `TXD`
3. Нажмите "Import"
4. Vercel автоматически определит Next.js
5. Добавьте Environment Variables (если нужны)
6. Нажмите "Deploy"

### Вариант 3: GitHub Actions (автоматический деплой)

1. Добавьте secrets в GitHub:
   - `VERCEL_TOKEN` - токен из https://vercel.com/account/tokens
   - `VERCEL_ORG_ID` - `team_jbDwVuZO005vC2iAkYDY08Ap`
   - `VERCEL_PROJECT_ID` - `prj_EkoJjumm3gf5BRCezkMWo2Z2WAbM`

2. При каждом push в `main` будет автоматический деплой

## 📋 Environment Variables для Vercel:

Если используются, добавьте в Vercel Dashboard:
- `DATABASE_URL`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION`
- `AWS_S3_BUCKET_NAME`
- `NEXT_PUBLIC_S3_BUCKET`
- `NEXT_PUBLIC_S3_REGION`

## 🌐 После деплоя:

1. Проверьте URL (будет показан в Vercel Dashboard)
2. Добавьте домены:
   - `txd.bike` - production/EN
   - `decalwrap.co` - staging/VN
3. Проверьте работу всех функций

---

**Дата**: 2025-01-10
**Статус**: Готов к деплою, требуется доступ к команде

