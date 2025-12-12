# Система авторизации для админки

## Обзор

Полноценная система авторизации с поддержкой:

- Логин через email или username
- Хеширование паролей (bcrypt)
- JWT токены для сессий
- Опциональная двухфакторная аутентификация (2FA) по email

## Установка

### 1. Установить зависимости

```bash
npm install bcryptjs jsonwebtoken nodemailer @types/bcryptjs @types/jsonwebtoken @types/nodemailer
```

### 2. Обновить базу данных

```bash
npx prisma migrate dev --name add_user_auth
# или
npx prisma db push
```

### 3. Создать первого пользователя

```bash
npm run create:admin <email> <username> <password>
# Пример:
npm run create:admin admin@txd.bike Stvolll a840309A
```

### 4. Настроить переменные окружения

Добавьте в `.env.local`:

```bash
# JWT Secret (обязательно измените в production!)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# SMTP для отправки 2FA кодов (опционально, для production)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@txd.bike
```

## Использование

### Логин

1. Перейдите на `/admin/login`
2. Введите email или username
3. Введите пароль
4. Если включена 2FA, введите код из email

### Регистрация нового пользователя

Через API:

```bash
curl -X POST http://localhost:3000/api/admin/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "username": "username",
    "password": "securepassword123"
  }'
```

Или через скрипт:

```bash
npm run create:admin user@example.com username securepassword123
```

## API Endpoints

### POST `/api/admin/auth/login`

Логин пользователя.

**Request:**

```json
{
  "emailOrUsername": "user@example.com",
  "password": "password123",
  "twoFactorCode": "123456" // опционально, если включена 2FA
}
```

**Response (успех):**

```json
{
  "success": true,
  "user": {
    "id": "...",
    "email": "user@example.com",
    "username": "username"
  }
}
```

**Response (требуется 2FA):**

```json
{
  "success": false,
  "requires2FA": true,
  "message": "2FA code sent to your email"
}
```

### POST `/api/admin/auth/register`

Регистрация нового пользователя.

**Request:**

```json
{
  "email": "user@example.com",
  "username": "username",
  "password": "password123"
}
```

### GET `/api/admin/auth/verify`

Проверка текущей сессии.

**Response:**

```json
{
  "authenticated": true,
  "user": {
    "id": "...",
    "email": "user@example.com",
    "username": "username"
  }
}
```

### POST `/api/admin/auth/logout`

Выход из системы.

## Безопасность

### Пароли

- Пароли хешируются с помощью bcrypt (12 rounds)
- Пароли никогда не хранятся в открытом виде
- Минимальная длина пароля: 8 символов

### JWT Токены

- Токены хранятся в HTTP-only cookies
- Срок действия: 24 часа
- В production используйте сильный `JWT_SECRET`

### 2FA

- 6-значные коды генерируются криптографически безопасно
- Коды действительны 10 минут
- Коды одноразовые (удаляются после использования)

## Структура базы данных

### User

```prisma
model User {
  id                String          @id @default(cuid())
  email             String          @unique
  username          String          @unique
  passwordHash      String          // bcrypt hashed
  twoFactorEnabled  Boolean         @default(false)
  twoFactorSecret   String?
  emailVerified     Boolean         @default(false)
  isActive          Boolean         @default(true)
  lastLoginAt       DateTime?
  createdAt         DateTime        @default(now())
  updatedAt         DateTime        @updatedAt
  twoFactorCodes    TwoFactorCode[]
}
```

### TwoFactorCode

```prisma
model TwoFactorCode {
  id        String   @id @default(cuid())
  userId    String
  code      String
  expiresAt DateTime
  used      Boolean  @default(false)
  createdAt DateTime @default(now())
}
```

## Включение 2FA для пользователя

2FA можно включить программно:

```typescript
import { prisma } from '@/lib/prisma'

await prisma.user.update({
  where: { id: userId },
  data: { twoFactorEnabled: true },
})
```

## Разработка

В режиме разработки 2FA коды выводятся в консоль сервера вместо отправки email.

Для production настройте SMTP в `.env.local`.

## Миграция с старой системы

Старая система использовала хардкодные логин/пароль. Новая система полностью заменяет её:

1. Старый endpoint `/api/admin/auth` удален
2. Новые endpoints: `/api/admin/auth/login`, `/api/admin/auth/register`
3. Layout проверяет JWT токен вместо простого cookie
4. Создайте первого пользователя через скрипт

## Troubleshooting

### "Prisma Client is not initialized"

Убедитесь, что `DATABASE_URL` установлен в `.env.local` и выполните:

```bash
npx prisma generate
npx prisma db push
```

### "Invalid credentials"

- Проверьте, что пользователь существует в базе
- Убедитесь, что пароль правильный
- Проверьте, что пользователь активен (`isActive: true`)

### 2FA коды не приходят

- В development: проверьте консоль сервера
- В production: настройте SMTP в `.env.local`


