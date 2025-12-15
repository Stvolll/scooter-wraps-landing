# Статус Vercel проекта и доменов

## ✅ Текущий статус

### Проект Vercel

- **Название**: `scooter-wraps-landing`
- **ID**: `prj_EkoJjumm3gf5BRCezkMWo2Z2WAbM`
- **Команда**: `Stvolll's projects`
- **Framework**: Next.js
- **Node.js**: 24.x
- **Статус**: ✅ Активен

### GitHub Репозиторий

- **URL**: `https://github.com/Stvolll/scooter-wraps-landing`
- **Remote**: ✅ Настроен
- **Связь с Vercel**: ⚠️ Требует проверки через веб-интерфейс

### Домены

#### ✅ decalwrap.co

- **Статус**: ✅ Работает
- **Привязан к проекту**: ✅ `scooter-wraps-landing`
- **Дополнительные домены**: `www.decalwrap.co`
- **HTTP статус**: ✅ 200 OK
- **Проверка**: `curl -I https://decalwrap.co` → работает

#### ⚠️ txd.bike

- **Статус**: ⚠️ Добавлен, требует настройки DNS
- **Привязан к проекту**: ✅ `scooter-wraps-landing`
- **DNS настройка**: Требуется A-запись `76.76.21.21`
- **Проверка**: После настройки DNS будет работать

## 🔍 Что нужно проверить

### 1. Подключение GitHub к Vercel

**Проверьте через веб-интерфейс:**

- https://vercel.com/stvollls-projects/scooter-wraps-landing/settings/git

**Ожидаемый результат:**

- Должен быть подключен: `Stvolll/scooter-wraps-landing`
- Production Branch: `main` или `master`

**Если не подключен:**

1. Нажмите "Connect Git Repository"
2. Выберите GitHub
3. Выберите `Stvolll/scooter-wraps-landing`
4. Нажмите "Import"

### 2. Настройка DNS для txd.bike

**В Namecheap:**

1. Domain List → txd.bike → Manage
2. Advanced DNS → Host Records
3. Добавьте A-запись:
   - Type: A
   - Host: @
   - Value: 76.76.21.21
   - TTL: Automatic

**Проверка после настройки:**

```bash
dig txd.bike A +short
# Должно вернуть: 76.76.21.21
```

### 3. Проверка автоматического деплоя

**Тест:**

```bash
# Сделайте небольшое изменение
echo "// test" >> app/page.tsx
git add .
git commit -m "test: verify auto-deploy"
git push origin main  # или ваша production ветка
```

**Проверка:**

- Откройте: https://vercel.com/stvollls-projects/scooter-wraps-landing/deployments
- Должен появиться новый деплой автоматически

## 📋 Резюме

### ✅ Работает:

- Проект Vercel настроен
- Домен `decalwrap.co` работает
- Домен `txd.bike` добавлен в проект

### ⚠️ Требует внимания:

- Проверка подключения GitHub (через веб-интерфейс)
- Настройка DNS для `txd.bike` (A-запись в Namecheap)

### 📝 Следующие шаги:

1. Проверить/подключить GitHub в настройках проекта Vercel
2. Настроить DNS для `txd.bike` в Namecheap
3. Протестировать автоматический деплой через `git push`

## 🔗 Полезные ссылки

- **Проект**: https://vercel.com/stvollls-projects/scooter-wraps-landing
- **Настройки Git**: https://vercel.com/stvollls-projects/scooter-wraps-landing/settings/git
- **Настройки доменов**: https://vercel.com/stvollls-projects/scooter-wraps-landing/settings/domains
- **Деплои**: https://vercel.com/stvollls-projects/scooter-wraps-landing/deployments
- **GitHub репозиторий**: https://github.com/Stvolll/scooter-wraps-landing




