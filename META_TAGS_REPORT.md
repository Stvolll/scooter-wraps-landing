# Отчет о метатегах сайта

## 📊 Общий статус

### ✅ Есть метатеги (app/layout.tsx - базовые для всех страниц)

1. **Title** ✅
   - `TXD — Premium Vinyl Wraps for Scooters`

2. **Description** ✅
   - `Premium vinyl wrap cover-sets for multiple scooter models. Explore ready-made styles or create your own custom design.`

3. **Keywords** ✅
   - `vinyl wraps, scooter wraps, custom scooter design, premium vinyl, Honda Lead, Yamaha Nouvo, scooter customization`

4. **Icons** ✅
   - `/favicon.svg` (icon, shortcut, apple)

5. **Open Graph** ✅ (частично)
   - `og:title` ✅
   - `og:description` ✅
   - `og:type` ✅ (website)
   - `og:locale` ✅ (en_US)
   - `og:alternateLocale` ✅ (vi_VN)

6. **Robots** ✅
   - `index: true`
   - `follow: true`

7. **Viewport** ✅
   - `width: device-width`
   - `initialScale: 1`
   - `maximumScale: 1`
   - `userScalable: false`

8. **Theme Color** ✅
   - `#00ff88`

---

## ❌ Отсутствующие метатеги

### В базовом layout.tsx отсутствуют:

1. **Open Graph изображение** ❌
   - `og:image` - нет изображения для соцсетей
   - `og:image:width` - нет
   - `og:image:height` - нет
   - `og:image:alt` - нет

2. **Open Graph URL** ❌
   - `og:url` - нет канонического URL

3. **Open Graph site_name** ❌
   - `og:site_name` - нет названия сайта

4. **Twitter Card** ❌
   - `twitter:card` - нет (summary_large_image)
   - `twitter:title` - нет
   - `twitter:description` - нет
   - `twitter:image` - нет
   - `twitter:site` - нет
   - `twitter:creator` - нет

5. **Canonical URL** ❌
   - `rel="canonical"` - нет канонических ссылок

6. **Alternate languages** ❌
   - `hreflang` - нет альтернативных языков (en, vi, ko)

7. **Author** ❌
   - `author` - нет автора

8. **Structured Data (JSON-LD)** ❌
   - Schema.org Organization - нет
   - Schema.org Product - нет
   - Schema.org BreadcrumbList - нет

---

## 📄 Статус по страницам

### 1. Главная страница (`/`) - `app/page.tsx`
- **Статус:** ❌ Нет собственных метатегов
- **Использует:** Только базовые из layout.tsx
- **Проблема:** Client component, не может экспортировать metadata
- **Решение:** Нужно создать server component wrapper или использовать generateMetadata

### 2. Страница дизайна (`/designs/[model]/[slug]`) - `app/designs/[model]/[slug]/page.tsx`
- **Статус:** ❌ Нет метатегов
- **Критично:** Нет динамических метатегов для каждого дизайна
- **Отсутствует:**
  - Динамический title с названием дизайна
  - Динамический description
  - og:image с изображением дизайна
  - Twitter Card
  - Canonical URL
  - Schema.org Product

### 3. Корзина (`/cart`) - `app/cart/page.tsx`
- **Статус:** ❌ Нет метатегов
- **Использует:** Только базовые из layout.tsx
- **Отсутствует:**
  - Специфичный title ("Shopping Cart - TXD")
  - robots: noindex (корзина не должна индексироваться)
  - og:type: noindex

### 4. Coming Soon (`/coming-soon`) - `app/coming-soon/page.tsx`
- **Статус:** ❌ Нет метатегов
- **Отсутствует:**
  - Специфичный title
  - robots: noindex (заглушка не должна индексироваться)

### 5. Maintenance (`/maintenance`) - `app/maintenance/page.tsx`
- **Статус:** ❌ Нет метатегов
- **Отсутствует:**
  - robots: noindex
  - Специфичный title

### 6. Admin страницы (`/admin/*`)
- **Статус:** ❌ Нет метатегов
- **Критично:** Должны иметь robots: noindex
- **Отсутствует:**
  - robots: noindex, nofollow
  - Специфичные titles для каждой страницы

---

## 🔧 Рекомендации по исправлению

### Приоритет 1 (Критично для SEO):

1. **Добавить Open Graph изображение** в layout.tsx
2. **Добавить Twitter Card** метатеги
3. **Добавить generateMetadata** для страницы дизайна с динамическими метатегами
4. **Добавить canonical URLs** для всех страниц
5. **Добавить hreflang** для многоязычности

### Приоритет 2 (Важно):

1. **Добавить robots: noindex** для служебных страниц (cart, admin, maintenance, coming-soon)
2. **Добавить специфичные titles** для каждой страницы
3. **Добавить Schema.org разметку** (Organization, Product, BreadcrumbList)

### Приоритет 3 (Улучшения):

1. **Добавить author** метатег
2. **Добавить og:site_name**
3. **Оптимизировать keywords** для каждой страницы

---

## 📝 Примеры необходимых метатегов

### Для главной страницы:
```typescript
export const metadata: Metadata = {
  title: 'TXD — Premium Vinyl Wraps for Scooters',
  description: 'Premium vinyl wrap cover-sets for multiple scooter models...',
  openGraph: {
    title: 'TXD — Premium Vinyl Wraps for Scooters',
    description: '...',
    url: 'https://txd.bike',
    siteName: 'TXD',
    images: [{
      url: 'https://txd.bike/og-image.jpg',
      width: 1200,
      height: 630,
      alt: 'TXD Premium Vinyl Wraps',
    }],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TXD — Premium Vinyl Wraps for Scooters',
    description: '...',
    images: ['https://txd.bike/og-image.jpg'],
  },
  alternates: {
    canonical: 'https://txd.bike',
    languages: {
      'en-US': 'https://txd.bike',
      'vi-VN': 'https://txd.bike/vi',
      'ko-KR': 'https://txd.bike/ko',
    },
  },
}
```

### Для страницы дизайна:
```typescript
export async function generateMetadata({ params }: DesignPageProps): Promise<Metadata> {
  const { model, slug } = params
  const design = // получить дизайн
  
  return {
    title: `${design.name} - ${scooter.name} | TXD`,
    description: design.description,
    openGraph: {
      title: `${design.name} - ${scooter.name}`,
      description: design.description,
      images: [design.images[0]],
      type: 'product',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${design.name} - ${scooter.name}`,
      images: [design.images[0]],
    },
  }
}
```

---

## ✅ Итоговая статистика

- **Всего страниц проверено:** 11
- **Страниц с метатегами:** 1 (layout.tsx - базовые)
- **Страниц без метатегов:** 10
- **Критичных проблем:** 5
- **Рекомендуемых улучшений:** 8


