# Проверка и обновление связей Vercel ↔ GitHub ↔ Домены

## Текущий статус

### Проект Vercel

- **Название**: `scooter-wraps-landing`
- **ID**: `prj_EkoJjumm3gf5BRCezkMWo2Z2WAbM`
- **Команда**: `Stvolll's projects`
- **Framework**: Next.js
- **Node.js**: 24.x

### GitHub Репозиторий

- **URL**: `https://github.com/Stvolll/scooter-wraps-landing`
- **Remote**: настроен как `origin`

### Домены

- ✅ `decalwrap.co` - добавлен (4 дня назад)
- ✅ `txd.bike` - добавлен (34 минуты назад)

## Проверка подключения GitHub к Vercel

### Через веб-интерфейс:

1. **Откройте настройки проекта:**
   - https://vercel.com/stvollls-projects/scooter-wraps-landing/settings/git

2. **Проверьте подключение:**
   - Должен быть подключен репозиторий: `Stvolll/scooter-wraps-landing`
   - Production Branch: обычно `main` или `master`

3. **Если репозиторий не подключен:**
   - Нажмите **"Connect Git Repository"**
   - Выберите **GitHub**
   - Выберите репозиторий: `Stvolll/scooter-wraps-landing`
   - Нажмите **"Import"**

### Через CLI (проверка):

```bash
# Проверка связи проекта
npx vercel project inspect scooter-wraps-landing

# Проверка доменов
npx vercel domains ls

# Проверка последних деплоев
npx vercel ls
```

## Проверка доменов

### decalwrap.co

```bash
npx vercel domains inspect decalwrap.co
```

**Ожидаемый результат:**

- Домен должен быть привязан к проекту `scooter-wraps-landing`
- Статус: Active/Verified
- Production URL должен указывать на деплой

### txd.bike

```bash
npx vercel domains inspect txd.bike
```

**Текущий статус:**

- Домен добавлен, но требует настройки DNS (A-запись: 76.76.21.21)

## Обновление связей

### 1. Обновить связь проекта с GitHub

Если нужно переподключить:

1. **В веб-интерфейсе Vercel:**
   - https://vercel.com/stvollls-projects/scooter-wraps-landing/settings/git
   - Нажмите **"Disconnect"** (если нужно)
   - Затем **"Connect Git Repository"**
   - Выберите `Stvolll/scooter-wraps-landing`

### 2. Проверить Production Branch

Убедитесь, что Production Branch настроен правильно:

1. **В настройках проекта:**
   - https://vercel.com/stvollls-projects/scooter-wraps-landing/settings/general
   - Проверьте **"Production Branch"**
   - Должен быть: `main`, `master`, или ваша основная ветка

### 3. Настроить автоматический деплой

После подключения GitHub, автоматический деплой работает так:

- **Production**: деплой при push в Production Branch
- **Preview**: деплой при push в другие ветки
- **Pull Requests**: автоматические preview деплои

## Проверка работы автоматического деплоя

### Тест деплоя через GitHub:

```bash
# Сделайте изменения
git add .
git commit -m "test: verify Vercel auto-deploy"

# Push в ветку (если это production branch, будет production деплой)
git push origin checkpoint/2025-01-10-stable

# Или push в main/master для production
git push origin main
```

### Проверка деплоя:

1. **В Vercel Dashboard:**
   - https://vercel.com/stvollls-projects/scooter-wraps-landing
   - Должен появиться новый деплой
   - Статус: Building → Ready

2. **Через CLI:**
   ```bash
   npx vercel ls
   # Покажет последние деплои
   ```

## Настройка доменов для веток

### Production домены (для main/master ветки):

- `decalwrap.co` → Production деплой
- `txd.bike` → Production деплой (после настройки DNS)

### Preview домены (для других веток):

- Автоматически: `scooter-wraps-landing-{hash}-stvollls-projects.vercel.app`

## Обновление доменов

### Если нужно перепривязать домен:

```bash
# Проверка текущей привязки
npx vercel domains inspect decalwrap.co

# Если нужно перепривязать (обычно не требуется)
npx vercel domains add decalwrap.co --project scooter-wraps-landing
```

## Проверка работоспособности

### 1. Проверка сайта:

```bash
# Проверка decalwrap.co
curl -I https://decalwrap.co

# Проверка txd.bike (после настройки DNS)
curl -I https://txd.bike
```

### 2. Проверка автоматического деплоя:

1. Сделайте небольшое изменение в коде
2. Закоммитьте и запушьте в GitHub
3. Проверьте Vercel Dashboard - должен появиться новый деплой

## Прямые ссылки для проверки

- **Проект**: https://vercel.com/stvollls-projects/scooter-wraps-landing
- **Настройки Git**: https://vercel.com/stvollls-projects/scooter-wraps-landing/settings/git
- **Настройки доменов**: https://vercel.com/stvollls-projects/scooter-wraps-landing/settings/domains
- **Деплои**: https://vercel.com/stvollls-projects/scooter-wraps-landing/deployments

## Резюме текущего состояния

✅ **Проект**: Настроен и работает  
✅ **Домен decalwrap.co**: Добавлен и работает  
⚠️ **Домен txd.bike**: Добавлен, требует настройки DNS  
❓ **GitHub интеграция**: Требует проверки через веб-интерфейс

## Следующие шаги

1. ✅ Проверить подключение GitHub через веб-интерфейс
2. ✅ Настроить DNS для txd.bike (A-запись: 76.76.21.21)
3. ✅ Протестировать автоматический деплой через git push
4. ✅ Убедиться, что оба домена работают


