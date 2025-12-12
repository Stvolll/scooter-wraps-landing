# SEO Optimization Guide

Руководство по SEO оптимизации проекта.

## Что сделано

### 1. Динамический Sitemap

Создан `app/sitemap.ts` который:

- ✅ Автоматически сканирует все маршруты из `config/scooters.js`
- ✅ Генерирует URL для всех дизайнов (`/designs/{model}/{slug}`)
- ✅ Включает статические страницы (главная, админ)
- ✅ Настраивает приоритеты и частоту обновления
- ✅ Доступен по `/sitemap.xml`

**Пример URL в sitemap:**

```xml
<url>
  <loc>https://decalwrap.co/designs/lead/01</loc>
  <lastmod>2025-12-09</lastmod>
  <changefreq>weekly</changefreq>
  <priority>0.8</priority>
</url>
```

### 2. Обновлен robots.txt

- ✅ Убрана ссылка на `decalwrap.vn`
- ✅ Добавлена правильная ссылка на `https://decalwrap.co/sitemap.xml`
- ✅ Добавлены `Disallow` для `/admin/` и `/api/`

**Содержимое:**

```
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/

Sitemap: https://decalwrap.co/sitemap.xml
```

### 3. GenerateMetadata для страниц дизайнов

Страница `/designs/[model]/[slug]` теперь:

- ✅ Загружает данные дизайна на сервере
- ✅ Генерирует уникальный `title` для каждого дизайна
- ✅ Создает SEO-friendly `description`
- ✅ Настраивает Open Graph мета-теги (`og:title`, `og:description`, `og:image`)
- ✅ Добавляет Twitter Card мета-теги
- ✅ Устанавливает `canonical` URL
- ✅ Добавляет релевантные keywords

**Пример метаданных:**

```typescript
{
  title: "Urban Street for Honda Lead | TXD Premium Vinyl Wraps",
  description: "Premium vinyl wrap design 'Urban Street' for Honda Lead. Professional installation included with 5-year warranty.",
  openGraph: {
    title: "Urban Street for Honda Lead | TXD Premium Vinyl Wraps",
    description: "...",
    images: [{ url: "https://decalwrap.co/images/designs/honda lead/honda-lead-0.jpg" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "...",
    images: ["..."],
  },
}
```

### 4. Server Component для SEO

Страница дизайна разделена на:

- **Server Component** (`page.tsx`) - для SEO и метаданных
- **Client Component** (`DesignDetailClient.tsx`) - для интерактивности

Это обеспечивает:

- ✅ Правильную генерацию метаданных на сервере
- ✅ Лучшую производительность
- ✅ Корректную индексацию поисковыми системами

## Структура файлов

```
app/
├── sitemap.ts                          # Динамический sitemap
└── designs/
    └── [model]/
        └── [slug]/
            ├── page.tsx                # Server component (SEO)
            └── DesignDetailClient.tsx  # Client component (UI)

public/
└── robots.txt                          # Обновлен с правильным sitemap URL
```

## Проверка

### Sitemap

```bash
# После деплоя
curl https://decalwrap.co/sitemap.xml
```

### Robots.txt

```bash
curl https://decalwrap.co/robots.txt
```

### Метаданные страницы

```bash
curl -s https://decalwrap.co/designs/lead/01 | grep -E "<title>|<meta.*og:|<meta.*twitter:"
```

## Переменные окружения

Добавьте в `.env.local`:

```bash
NEXT_PUBLIC_SITE_URL=https://decalwrap.co
```

Если не указано, используется значение по умолчанию: `https://decalwrap.co`

## Преимущества

- ✅ **Лучшая индексация** - все страницы дизайнов в sitemap
- ✅ **Rich snippets** - Open Graph и Twitter Cards
- ✅ **Уникальные метаданные** - каждая страница имеет свой title/description
- ✅ **Изображения для соцсетей** - og:image для каждого дизайна
- ✅ **Canonical URLs** - предотвращение дублирования контента

## Дополнительные рекомендации

1. **Structured Data (JSON-LD)**: Добавить schema.org разметку для продуктов
2. **Image optimization**: Использовать оптимизированные изображения для og:image
3. **Sitemap indexing**: Отправить sitemap в Google Search Console
4. **Analytics**: Настроить отслеживание индексации страниц


