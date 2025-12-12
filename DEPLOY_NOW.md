# 🚀 Инструкция для немедленного деплоя

## Текущий статус

✅ Проект очищен
✅ Коммиты готовы (8 коммитов)
❌ Push в GitHub требует аутентификации
❌ Vercel деплой требует настройки

## Вариант 1: Push через GitHub CLI (рекомендуется)

```bash
cd /Users/anatolii/scooter-wraps-landing

# Авторизация
gh auth login

# Выберите:
# - GitHub.com
# - HTTPS
# - Login with a web browser

# После авторизации:
git push origin main
```

## Вариант 2: Push через Personal Access Token

1. Создайте токен: https://github.com/settings/tokens
2. Выберите scope: `repo`
3. Выполните:
```bash
cd /Users/anatolii/scooter-wraps-landing
git push https://YOUR_TOKEN@github.com/Stvolll/scooter-wraps-landing.git main
```

## Вариант 3: Push через SSH (если настроен ключ)

```bash
cd /Users/anatolii/scooter-wraps-landing
git remote set-url origin git@github.com:Stvolll/scooter-wraps-landing.git
git push origin main
```

## После успешного push

### Vercel деплой через Dashboard:

1. Откройте: https://vercel.com/new
2. Import Git Repository → выберите `Stvolll/scooter-wraps-landing`
3. Vercel автоматически определит Next.js
4. Добавьте Environment Variables:
   - `DATABASE_URL`
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `AWS_REGION`
   - `AWS_S3_BUCKET_NAME`
   - `NEXT_PUBLIC_S3_BUCKET`
   - `NEXT_PUBLIC_S3_REGION`
5. Нажмите Deploy

### Vercel деплой через CLI:

```bash
cd /Users/anatolii/scooter-wraps-landing
npm install -g vercel
vercel login
vercel --prod
```

## Проверка деплоя

После деплоя проверьте:
- ✅ Главная страница загружается
- ✅ 3D модель отображается
- ✅ API endpoints работают
- ✅ Админ панель доступна

## Ссылки

- GitHub: https://github.com/Stvolll/scooter-wraps-landing
- Vercel: Настроить после push



