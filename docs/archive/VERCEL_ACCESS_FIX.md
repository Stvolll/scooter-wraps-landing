# Решение проблемы доступа к Vercel команде

## Проблема

Email `anatoliyagapov@gmail.com` не является членом команды "Stvolll's projects" на Vercel.

## Решения (выберите один из вариантов)

### Вариант 1: Добавить пользователя в команду (Рекомендуется)

#### Через веб-интерфейс Vercel:

1. **Войдите в Vercel** как владелец команды "Stvolll's projects":
   - Откройте https://vercel.com/teams/stvollls-projects/settings/members
   - Или перейдите: Settings → Team → Members

2. **Добавьте члена команды:**
   - Нажмите кнопку **"Invite Member"** или **"Add Member"**
   - Введите email: `anatoliyagapov@gmail.com`
   - Выберите роль: **"Member"** или **"Developer"**
   - Нажмите **"Send Invitation"**

3. **Примите приглашение:**
   - Проверьте email `anatoliyagapov@gmail.com`
   - Нажмите на ссылку в письме от Vercel
   - Примите приглашение

4. **Проверьте доступ:**

   ```bash
   npx vercel whoami
   # Должно показать: anatoliyagapov-6027

   npx vercel teams ls
   # Должна быть команда: Stvolll's projects
   ```

#### Через Vercel CLI (если у вас есть права администратора):

```bash
# Войдите как администратор команды
npx vercel teams invite anatoliyagapov@gmail.com --team stvollls-projects
```

### Вариант 2: Подключить GitHub аккаунт

Если пользователь уже в команде, но GitHub не подключен:

1. **Войдите в Vercel:**
   - https://vercel.com/account

2. **Перейдите в настройки аутентификации:**
   - Settings → Authentication

3. **Подключите GitHub:**
   - Нажмите **"Connect"** рядом с GitHub
   - Авторизуйтесь через GitHub
   - Убедитесь, что GitHub аккаунт подключен

4. **Проверьте связь:**
   - Убедитесь, что GitHub username совпадает с аккаунтом, который имеет доступ к репозиторию

### Вариант 3: Сделать репозиторий публичным (Бесплатно)

Если репозиторий публичный, деплой через GitHub будет работать автоматически:

1. **Сделайте репозиторий публичным:**
   - Откройте: https://github.com/Stvolll/scooter-wraps-landing/settings
   - Прокрутите вниз до секции "Danger Zone"
   - Нажмите **"Change visibility"** → **"Make public"**
   - Подтвердите действие

2. **Подключите GitHub к Vercel:**
   - В Vercel: Settings → Git → Connect GitHub
   - Выберите репозиторий `scooter-wraps-landing`
   - Vercel автоматически будет деплоить при каждом push

3. **Деплой через Git:**
   ```bash
   git push origin checkpoint/2025-01-10-stable
   # Vercel автоматически задеплоит
   ```

### Вариант 4: Использовать личный аккаунт Vercel

Если у вас есть личный аккаунт Vercel:

1. **Создайте проект в личном аккаунте:**

   ```bash
   npx vercel --scope anatoliyagapov-6027
   ```

2. **Или переключитесь на личный аккаунт:**

   ```bash
   npx vercel logout
   npx vercel login
   # Войдите с email: anatoliyagapov@gmail.com
   ```

3. **Создайте новый проект:**

   ```bash
   npx vercel
   ```

4. **Добавьте домены:**
   ```bash
   npx vercel domains add txd.bike
   npx vercel domains add decalwrap.co
   ```

## Рекомендуемое решение

**Для продакшн деплоя рекомендуется Вариант 1** (добавить в команду), так как:

- Сохраняется централизованное управление
- Все домены уже настроены в команде
- Легче управлять доступом

**Для быстрого решения можно использовать Вариант 3** (публичный репозиторий), если:

- Код можно сделать публичным
- Нужен автоматический деплой через GitHub

## Проверка после настройки

После применения одного из решений:

```bash
# Проверка авторизации
npx vercel whoami

# Проверка доступа к команде
npx vercel teams ls

# Попытка деплоя
npx vercel --prod
```

## Альтернатива: Деплой через GitHub

Если настройка доступа займет время, можно использовать автоматический деплой:

1. **Подключите GitHub репозиторий к Vercel:**
   - В веб-интерфейсе Vercel: Add New Project → Import Git Repository
   - Выберите `Stvolll/scooter-wraps-landing`
   - Настройте проект

2. **Деплой через push:**

   ```bash
   git push origin checkpoint/2025-01-10-stable
   ```

3. **Vercel автоматически задеплоит** при каждом push в ветку

## Прямые ссылки

- **Настройки команды**: https://vercel.com/teams/stvollls-projects/settings/members
- **Настройки аутентификации**: https://vercel.com/account
- **Проект**: https://vercel.com/stvollls-projects/scooter-wraps-landing
