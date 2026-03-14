# Настройка S3 хранилища для загрузки файлов

## 🔧 Требуемые переменные окружения

Добавьте следующие переменные в файл `.env.local`:

```bash
# Вариант 1: Использование S3 переменных
S3_BUCKET=your-bucket-name
S3_KEY=your-access-key-id
S3_SECRET=your-secret-access-key
S3_REGION=us-east-1
S3_ENDPOINT=  # Опционально, для S3-совместимых хранилищ (Cloudflare R2, MinIO и т.д.)

# Вариант 2: Использование AWS переменных (альтернатива)
AWS_S3_BUCKET_NAME=your-bucket-name
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key
AWS_REGION=us-east-1

# Опционально: CloudFront CDN
AWS_CLOUDFRONT_DOMAIN=your-cloudfront-domain.cloudfront.net
NEXT_PUBLIC_IMAGE_CDN_DOMAIN=your-cloudfront-domain.cloudfront.net
```

## 📋 Шаги настройки

### 1. AWS S3

1. Создайте S3 bucket в AWS Console
2. Настройте CORS для bucket:
   ```json
   [
     {
       "AllowedHeaders": ["*"],
       "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
       "AllowedOrigins": ["http://localhost:3000", "https://yourdomain.com"],
       "ExposeHeaders": ["ETag"]
     }
   ]
   ```
3. Создайте IAM пользователя с политикой доступа к S3
4. Скопируйте Access Key ID и Secret Access Key
5. Добавьте переменные в `.env.local`

### 2. Cloudflare R2 (альтернатива)

1. Создайте R2 bucket в Cloudflare Dashboard
2. Создайте API Token с правами на чтение/запись
3. Используйте переменные:
   ```bash
   S3_BUCKET=your-r2-bucket-name
   S3_KEY=your-r2-access-key-id
   S3_SECRET=your-r2-secret-access-key
   S3_REGION=auto
   S3_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com
   ```

## ⚠️ Важно

- **Никогда не коммитьте `.env.local`** в Git
- Переменные должны быть установлены **до запуска** dev сервера
- После изменения переменных **перезапустите** dev сервер

## 🧪 Проверка настройки

После настройки попробуйте загрузить файл через админку. Если настройка корректна, файл загрузится без ошибок.

Если видите ошибку "S3 bucket not configured", проверьте:
1. Существует ли файл `.env.local`
2. Правильно ли указаны переменные
3. Перезапущен ли dev сервер после добавления переменных






