# Инструкции по push в GitHub

## Проблема с аутентификацией

Git требует аутентификацию для push в GitHub. Remote настроен на HTTPS: `https://github.com/Stvolll/scooter-wraps-landing.git`

## Решения

### Вариант 1: Использовать GitHub CLI (gh) - самый простой

1. Установить GitHub CLI (если не установлен):
   ```bash
   brew install gh
   ```

2. Авторизоваться:
   ```bash
   gh auth login
   ```

3. Запушить изменения:
   ```bash
   git push origin main
   ```

### Вариант 2: Использовать Personal Access Token (PAT)

1. Создать Personal Access Token на GitHub:
   - Перейти: https://github.com/settings/tokens
   - Создать новый token с правами `repo`

2. Использовать token при push:
   ```bash
   git push https://<TOKEN>@github.com/Stvolll/scooter-wraps-landing.git main
   ```

   Или настроить credential helper:
   ```bash
   git config --global credential.helper osxkeychain
   git push origin main
   ```
   (при запросе использовать token вместо пароля)

### Вариант 3: Переключить на SSH

1. Проверить наличие SSH ключа:
   ```bash
   ls -la ~/.ssh/id_*.pub
   ```

2. Если ключа нет, создать:
   ```bash
   ssh-keygen -t ed25519 -C "your_email@example.com"
   ```

3. Добавить ключ в GitHub:
   - Скопировать публичный ключ: `cat ~/.ssh/id_ed25519.pub`
   - Добавить в GitHub: https://github.com/settings/keys

4. Переключить remote на SSH:
   ```bash
   git remote set-url origin git@github.com:Stvolll/scooter-wraps-landing.git
   ```

5. Запушить:
   ```bash
   git push origin main
   ```

## Текущий статус

- ✅ Все изменения закоммичены в `main`
- ✅ Готово к push
- ⚠️ Требуется аутентификация GitHub

## Рекомендация

Использовать **GitHub CLI (gh)** - самый простой и безопасный способ.





