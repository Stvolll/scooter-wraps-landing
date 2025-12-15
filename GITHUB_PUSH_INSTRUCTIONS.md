# Инструкция для Push в GitHub

## Текущий статус

✅ Коммиты готовы:
- `c00b3dd` - clean reupload: fresh project
- `f86e53e` - docs: add cleanup report and Vercel deployment guide
- `1ae23fb` - docs: add cleanup summary report

⏳ Требуется push в GitHub

## Репозиторий

**URL**: `https://github.com/Stvolll/scooter-wraps-landing.git`
**Ветка**: `main`

## Способы выполнения push

### Вариант 1: GitHub CLI (рекомендуется)

```bash
# Авторизация
gh auth login

# Выберите:
# - GitHub.com
# - HTTPS
# - Login with a web browser

# После авторизации:
git push origin main
```

### Вариант 2: Personal Access Token

1. **Создайте Personal Access Token:**
   - Перейдите: https://github.com/settings/tokens
   - Generate new token (classic)
   - Выберите scope: `repo`
   - Скопируйте токен

2. **Используйте токен при push:**
   ```bash
   git push https://YOUR_TOKEN@github.com/Stvolll/scooter-wraps-landing.git main
   ```

   Или настройте remote:
   ```bash
   git remote set-url origin https://YOUR_TOKEN@github.com/Stvolll/scooter-wraps-landing.git
   git push origin main
   ```

### Вариант 3: SSH ключ

Если у вас настроен SSH ключ:
```bash
git remote set-url origin git@github.com:Stvolll/scooter-wraps-landing.git
git push origin main
```

## Проверка после push

```bash
# Проверьте статус
git status

# Проверьте последние коммиты
git log --oneline -5

# Проверьте remote
git remote -v
```

## После успешного push

1. Проверьте репозиторий на GitHub: https://github.com/Stvolll/scooter-wraps-landing
2. Убедитесь, что все файлы загружены
3. Перейдите к настройке Vercel (см. `docs/DEPLOY_VERCEL.md`)





