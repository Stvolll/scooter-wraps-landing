# Быстрый push в GitHub

## Способ 1: GitHub CLI (самый простой)

```bash
# 1. Авторизоваться (интерактивно)
gh auth login

# 2. Запушить
git push origin main
```

## Способ 2: Personal Access Token

1. Создать токен: https://github.com/settings/tokens
   - Права: `repo` (полный доступ к репозиториям)

2. При push использовать токен как пароль:
   ```bash
   git push origin main
   # Username: ваш_github_username
   # Password: ваш_personal_access_token
   ```

## Способ 3: SSH ключ

```bash
# 1. Проверить ключ
ls -la ~/.ssh/id_*.pub

# 2. Если нет - создать
ssh-keygen -t ed25519 -C "your_email@example.com"

# 3. Добавить в GitHub
cat ~/.ssh/id_ed25519.pub
# Скопировать и добавить на https://github.com/settings/keys

# 4. Переключить remote
git remote set-url origin git@github.com:Stvolll/scooter-wraps-landing.git

# 5. Запушить
git push origin main
```

## Текущий статус

- ✅ Все изменения в `main` ветке
- ✅ Готово к push
- ⚠️ Нужна авторизация GitHub

**Рекомендация:** Используйте `gh auth login` - это самый простой способ.



