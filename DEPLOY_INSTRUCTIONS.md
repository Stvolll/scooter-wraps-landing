# Инструкции по деплою

## Проблема с доступом к Vercel

Текущий пользователь (`anatoliyagapov@gmail.com`) не имеет доступа к команде Vercel "Stvolll's projects" для создания деплоев через CLI.

## Решения

### Вариант 1: Автоматический деплой через GitHub (рекомендуется)

Если в Vercel настроен автоматический деплой из GitHub:

1. **Запушить изменения в main ветку:**
   ```bash
   git push origin main
   ```

2. Vercel автоматически задеплоит изменения после push в main ветку.

### Вариант 2: Добавить пользователя в команду Vercel

1. Владелец команды должен:
   - Зайти в Vercel Dashboard
   - Перейти в Settings → Team Members
   - Добавить `anatoliyagapov@gmail.com` в команду

2. После добавления можно деплоить через CLI:
   ```bash
   npx vercel --prod
   ```

### Вариант 3: Использовать другой аккаунт Vercel

Если у вас есть доступ к другому аккаунту Vercel:
```bash
npx vercel logout
npx vercel login
npx vercel --prod
```

## Текущий статус

- ✅ Сборка проекта проходит успешно
- ✅ Все изменения закоммичены в ветку `feature/design-lifecycle-system-improvements`
- ✅ Изменения смержены в `main` ветку
- ⚠️ Нужен доступ к Vercel для деплоя

## Следующие шаги

1. Запушить изменения в main: `git push origin main`
2. Проверить, что Vercel автоматически задеплоил изменения
3. Или запросить доступ к команде Vercel у владельца

