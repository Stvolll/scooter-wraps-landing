# 🚀 Деплой на Vercel

## Текущий статус

✅ Проект готов к деплою
✅ Все коммиты готовы
✅ `vercel.json` настроен для Next.js

## Способ 1: Через Vercel Dashboard (рекомендуется)

1. **Откройте**: https://vercel.com/new
2. **Войдите** в аккаунт Vercel
3. **Import Git Repository**:
   - Выберите `Stvolll/scooter-wraps-landing`
   - Или вставьте URL: `https://github.com/Stvolll/scooter-wraps-landing`
4. **Vercel автоматически определит**:
   - Framework: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
5. **Добавьте Environment Variables**:
   - `DATABASE_URL` (если используется)
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `AWS_REGION`
   - `AWS_S3_BUCKET_NAME`
   - `NEXT_PUBLIC_S3_BUCKET`
   - `NEXT_PUBLIC_S3_REGION`
6. **Нажмите Deploy**

## Способ 2: Через Vercel CLI

```bash
cd /Users/anatolii/scooter-wraps-landing

# Локальная установка (если глобальная не работает)
npm install --save-dev vercel

# Логин
npx vercel login

# Деплой в production
npx vercel --prod
```

## Способ 3: Через GitHub (автоматический деплой)

1. **Сначала push в GitHub**:
   ```bash
   gh auth login
   git push origin main
   ```

2. **Затем в Vercel Dashboard**:
   - Import проект из GitHub
   - Vercel автоматически задеплоит при каждом push в `main`

## Важные настройки

### Framework
- ✅ **Framework Preset**: `Next.js` (автоматически определяется)
- ❌ НЕ используйте: "Other" или "Static"

### Build Settings
- Build Command: `npm run build` (или пусто - Vercel определит)
- Output Directory: `.next` (или пусто - Vercel определит)
- Install Command: `npm install` (или пусто)

### Environment Variables
Убедитесь, что все переменные из `.env.example` добавлены в Vercel:
- Settings → Environment Variables
- Добавьте для Production, Preview, Development

## После деплоя

1. Проверьте URL деплоя (будет показан в Vercel Dashboard)
2. Проверьте:
   - ✅ Главная страница загружается
   - ✅ 3D модель отображается
   - ✅ API endpoints работают
   - ✅ Админ панель доступна

## Домены

Проект настроен для работы с:
- `txd.bike` - production/EN
- `decalwrap.co` - staging/VN

Добавьте домены в Vercel:
- Project Settings → Domains
- Добавьте оба домена

---

**Дата**: 2025-01-10
**Статус**: Готов к деплою


