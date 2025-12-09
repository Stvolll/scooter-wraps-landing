# AWS S3 Quick Start Guide

Быстрая настройка AWS S3 для загрузки файлов.

## Шаг 1: Создание S3 Bucket

1. Войдите в [AWS Console](https://console.aws.amazon.com/)
2. Перейдите в [S3](https://console.aws.amazon.com/s3/)
3. Нажмите **"Create bucket"**
4. Заполните:
   - **Bucket name**: `txd-uploads-2024` (должно быть уникальным)
   - **Region**: `us-east-1` (или ближайший к вам)
   - **Object Ownership**: `ACLs enabled` (рекомендуется)
   - **Block Public Access**: **Снимите все галочки** (или настройте bucket policy)
   - **Versioning**: `Enable` (опционально, для бэкапов)
   - **Encryption**: `Enable` → `SSE-S3` (рекомендуется)
5. Нажмите **"Create bucket"**

## Шаг 2: Настройка CORS

1. Откройте созданный bucket
2. Перейдите в **Permissions** → **Cross-origin resource sharing (CORS)**
3. Нажмите **"Edit"**
4. Вставьте конфигурацию из файла `scripts/aws-s3-cors.json`:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["PUT", "POST", "GET", "HEAD"],
    "AllowedOrigins": [
      "http://localhost:3000",
      "https://txd.bike",
      "https://decalwrap.co",
      "https://*.vercel.app"
    ],
    "ExposeHeaders": ["ETag", "x-amz-server-side-encryption"],
    "MaxAgeSeconds": 3000
  }
]
```

5. Нажмите **"Save changes"**

## Шаг 3: Создание IAM User

1. Перейдите в [IAM Console](https://console.aws.amazon.com/iam/)
2. **Users** → **"Add users"**
3. **User name**: `s3-upload-user`
4. **Access type**: Выберите **"Access key - Programmatic access"**
5. Нажмите **"Next: Permissions"**
6. Выберите **"Attach policies directly"**
7. Нажмите **"Create policy"** → **"JSON"**
8. Вставьте политику из `scripts/aws-s3-policy.json` (замените `YOUR-BUCKET-NAME` на имя вашего bucket):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:PutObjectAcl", "s3:GetObject"],
      "Resource": "arn:aws:s3:::txd-uploads-2024/*"
    },
    {
      "Effect": "Allow",
      "Action": ["s3:ListBucket"],
      "Resource": "arn:aws:s3:::txd-uploads-2024"
    }
  ]
}
```

9. **Policy name**: `S3UploadPolicy`
10. Нажмите **"Create policy"**
11. Вернитесь к созданию пользователя, обновите список и выберите `S3UploadPolicy`
12. Нажмите **"Next"** → **"Create user"**
13. **ВАЖНО**: Сохраните **Access Key ID** и **Secret Access Key** (они показываются только один раз!)

## Шаг 4: Настройка Bucket Policy (для публичного доступа)

1. Откройте bucket → **Permissions** → **Bucket policy**
2. Нажмите **"Edit"**
3. Вставьте (замените `txd-uploads-2024` на имя вашего bucket):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::txd-uploads-2024/*"
    }
  ]
}
```

4. Нажмите **"Save changes"**

## Шаг 5: Настройка переменных окружения

1. Откройте файл `.env.local` в корне проекта
2. Заполните значения:

```bash
# AWS Region (тот же, что выбрали при создании bucket)
AWS_REGION=us-east-1

# AWS Access Key ID (из шага 3)
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE

# AWS Secret Access Key (из шага 3)
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY

# S3 Bucket Name (имя bucket из шага 1)
AWS_S3_BUCKET_NAME=txd-uploads-2024

# CloudFront Domain (оставьте пустым, если не используете)
AWS_CLOUDFRONT_DOMAIN=
```

3. Сохраните файл

## Шаг 6: Проверка настройки

1. Перезапустите dev сервер:

   ```bash
   npm run dev
   ```

2. Откройте админ-панель: `http://localhost:3000/admin`

3. Попробуйте загрузить файл:
   - Создайте новый SKU
   - Загрузите изображение
   - Проверьте, что файл появился в S3 bucket

## Troubleshooting

### Ошибка: "AWS_S3_BUCKET_NAME is not configured"

- Проверьте, что `.env.local` существует и содержит `AWS_S3_BUCKET_NAME`
- Перезапустите dev сервер после изменения `.env.local`

### Ошибка: "Access Denied" при загрузке

- Проверьте IAM policy (должна включать `s3:PutObject`)
- Проверьте bucket policy (должна разрешать публичный доступ на чтение)
- Проверьте CORS конфигурацию

### Ошибка: "CORS policy" в браузере

- Проверьте CORS конфигурацию в bucket
- Убедитесь, что ваш домен добавлен в `AllowedOrigins`

### Файлы не видны после загрузки

- Проверьте bucket policy (должна разрешать `s3:GetObject`)
- Проверьте, что bucket не имеет "Block Public Access" включенным

## Дополнительно: CloudFront (опционально)

Для лучшей производительности и CDN:

1. Перейдите в [CloudFront Console](https://console.aws.amazon.com/cloudfront/)
2. **Create distribution**
3. **Origin domain**: выберите ваш S3 bucket
4. **Default cache behavior**: настройте кэширование
5. После создания добавьте `AWS_CLOUDFRONT_DOMAIN` в `.env.local`

## Безопасность

- ✅ Никогда не коммитьте `.env.local` в git (уже в `.gitignore`)
- ✅ Используйте минимальные IAM permissions
- ✅ Регулярно ротируйте access keys
- ✅ Включите MFA для AWS аккаунта
- ✅ Используйте CloudFront для дополнительной защиты

## Полезные ссылки

- [AWS S3 Console](https://console.aws.amazon.com/s3/)
- [IAM Console](https://console.aws.amazon.com/iam/)
- [CloudFront Console](https://console.aws.amazon.com/cloudfront/)
- Подробная документация: `S3_SETUP.md`
