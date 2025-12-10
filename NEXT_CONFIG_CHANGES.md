# Next.js Config Changes - Cache-Control Headers

## Изменения в `next.config.js`

### ✅ Что исправлено:

1. **Убран глобальный Cache-Control header** для `/:path*`
   - Ранее все файлы кэшировались на 1 год, что неправильно для HTML/API

2. **Добавлены специфичные headers для статических путей:**
   - `/_next/static/:path*` → `public, max-age=31536000, immutable`
   - `/models/:path*` → `public, max-age=31536000, immutable`
   - `/textures/:path*` → `public, max-age=31536000, immutable`
   - `/images/:path*` → `public, max-age=31536000, immutable`
   - `/hdr/:path*` → `public, max-age=31536000, immutable`
   - `/wraps/:path*` → `public, max-age=31536000, immutable`
   - `/favicon.svg` → `public, max-age=31536000, immutable`
   - `/robots.txt` → `public, max-age=3600` (1 час)
   - `/manifest.json` → `public, max-age=3600` (1 час)

3. **HTML и API routes:**
   - `/:path*.html` → `no-cache, must-revalidate`
   - `/` → `no-cache, must-revalidate`
   - `/api/:path*` → `no-cache, must-revalidate`

4. **Обновлены `images.remotePatterns` для CDN/S3:**
   - `**.amazonaws.com` - все S3 buckets
   - `**.cloudfront.net` - все CloudFront distributions
   - Можно добавить конкретные домены в комментариях

## Как добавить свой CDN домен

Откройте `next.config.js` и добавьте в `remotePatterns`:

```javascript
images: {
  remotePatterns: [
    // ... существующие паттерны ...
    {
      protocol: 'https',
      hostname: 'your-cdn-domain.com',
      pathname: '/**',
    },
  ],
}
```

## Проверка headers

После деплоя проверьте headers:

```bash
# Статические файлы (должен быть long cache)
curl -I https://decalwrap.co/models/yamaha-nvx.glb
# Cache-Control: public, max-age=31536000, immutable

# HTML страницы (должен быть no-cache)
curl -I https://decalwrap.co/
# Cache-Control: no-cache, must-revalidate

# API routes (должен быть no-cache)
curl -I https://decalwrap.co/api/skus
# Cache-Control: no-cache, must-revalidate
```

## Преимущества

- ✅ **Статические файлы** кэшируются на 1 год (immutable)
- ✅ **HTML страницы** всегда свежие (no-cache)
- ✅ **API responses** не кэшируются (no-cache)
- ✅ **CDN/S3 изображения** поддерживаются через remotePatterns
- ✅ **Оптимизация производительности** за счет правильного кэширования

## Примечания

- `immutable` означает, что файл никогда не изменится (для версионированных файлов)
- `must-revalidate` означает, что браузер должен проверить актуальность перед использованием
- `max-age=31536000` = 1 год в секундах
- `max-age=3600` = 1 час в секундах

