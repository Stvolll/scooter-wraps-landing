# 📦 Создание репозитория на GitHub

## 🚀 Способ 1: Автоматический (через GitHub CLI)

### Шаг 1: Установите и авторизуйтесь в GitHub CLI

```bash
# Установка
brew install gh

# Авторизация
gh auth login
```

Следуйте инструкциям:
1. Выберите **GitHub.com**
2. Выберите **HTTPS**
3. Выберите **Login with a web browser**
4. Авторизуйтесь в браузере

### Шаг 2: Создайте репозиторий

```bash
cd /Users/anatolii/scooter-wraps-landing
bash create_repo.sh
```

Или вручную:

```bash
cd /Users/anatolii/scooter-wraps-landing
gh repo create Stvolll/scooter-wraps-landing --public --source=. --remote=origin --push
```

---

## 🌐 Способ 2: Через веб-интерфейс (если нет GitHub CLI)

### Шаг 1: Создайте репозиторий на GitHub

1. Откройте: **https://github.com/new**
2. **Repository name**: `scooter-wraps-landing`
3. **Description** (опционально): "Scooter wraps landing page"
4. Выберите: **Public**
5. **НЕ** отмечайте:
   - ❌ Add a README file
   - ❌ Add .gitignore
   - ❌ Choose a license
6. Нажмите **"Create repository"**

### Шаг 2: Настройте remote и выполните push

После создания репозитория GitHub покажет инструкции. Выполните:

```bash
cd /Users/anatolii/scooter-wraps-landing

# Настройте remote (если еще не настроен)
git remote add origin https://github.com/Stvolll/scooter-wraps-landing.git

# Или обновите существующий
git remote set-url origin https://github.com/Stvolll/scooter-wraps-landing.git

# Проверьте remote
git remote -v

# Выполните push
git push -u origin main
```

Если запросит пароль, используйте **Personal Access Token** (см. `HOW_TO_GET_GITHUB_TOKEN.md`)

---

## ✅ После создания репозитория

### Автоматический деплой Vercel:

1. **Если Vercel уже подключен к GitHub:**
   - Vercel автоматически обнаружит новый репозиторий
   - Начнется автоматический деплой
   - Через 1-3 минуты сайты обновятся:
     - ✅ **txd.bike**
     - ✅ **decalwrap.co**

2. **Если Vercel не подключен:**
   - Откройте: https://vercel.com/dashboard
   - Нажмите **"Add New Project"**
   - Выберите репозиторий `Stvolll/scooter-wraps-landing`
   - Нажмите **"Deploy"**

---

## 🔍 Проверка

После создания репозитория проверьте:

```bash
# Проверить remote
git remote -v

# Должно показать:
# origin  https://github.com/Stvolll/scooter-wraps-landing.git (fetch)
# origin  https://github.com/Stvolll/scooter-wraps-landing.git (push)

# Проверить статус
git status

# Выполнить push (если еще не выполнен)
git push -u origin main
```

---

## 🆘 Решение проблем

### Проблема: "Repository already exists"
- Репозиторий уже создан
- Просто выполните: `git push -u origin main`

### Проблема: "Permission denied"
- Проверьте авторизацию: `gh auth status`
- Или используйте Personal Access Token

### Проблема: "Remote origin already exists"
- Обновите URL: `git remote set-url origin https://github.com/Stvolll/scooter-wraps-landing.git`

---

## 📝 Что дальше?

После создания репозитория и push:
1. ✅ Код будет на GitHub
2. ✅ Vercel автоматически задеплоит
3. ✅ Сайты обновятся через 1-3 минуты

Проверьте статус: https://vercel.com/dashboard

