# Design System: iOS 26 Style для TXD

## 🎨 Цветовая палитра

### Основные цвета:

```css
/* Фон */
--bg-primary: rgba(0, 0, 0, 1);
--bg-secondary: rgba(15, 15, 15, 1);
--bg-tertiary: rgba(18, 18, 18, 0.1);

/* Акценты */
--accent-green: #00FFA9;
--accent-blue: #00D4FF;
--accent-purple: #B77EFF;
--accent-yellow: #FFB800;

/* Текст */
--text-primary: rgba(255, 255, 255, 1);
--text-secondary: rgba(255, 255, 255, 0.8);
--text-tertiary: rgba(255, 255, 255, 0.6);
--text-quaternary: rgba(255, 255, 255, 0.4);

/* Границы */
--border-primary: rgba(255, 255, 255, 0.12);
--border-secondary: rgba(255, 255, 255, 0.1);
--border-accent: rgba(0, 255, 169, 0.3);
```

## 🔲 Компоненты

### Карточки (Cards)

```tsx
// Базовая карточка
<div
  className="p-6 rounded-3xl"
  style={{
    background: 'rgba(255, 255, 255, 0.08)',
    backdropFilter: 'blur(20px) saturate(180%)',
    WebkitBackdropFilter: 'blur(20px) saturate(180%)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: '0 8px 32px -4px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.1) inset',
  }}
>
  {/* Контент */}
</div>
```

### Кнопки (Buttons)

```tsx
// Primary кнопка
<button
  className="px-6 py-4 rounded-2xl font-semibold text-black transition-all hover:scale-105"
  style={{
    background: 'linear-gradient(135deg, #00FFA9 0%, #00D4FF 100%)',
    boxShadow: '0 8px 32px -4px rgba(0, 255, 169, 0.4)',
  }}
>
  Текст кнопки
</button>

// Secondary кнопка
<button
  className="px-6 py-4 rounded-2xl font-semibold text-white transition-all hover:bg-white/10"
  style={{
    background: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  }}
>
  Текст кнопки
</button>
```

### Формы (Forms)

```tsx
// Input поле
<input
  className="w-full px-4 py-3 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm focus:ring-2 focus:ring-[#00FFA9] focus:border-[#00FFA9] transition-all text-white placeholder:text-white/30"
  style={{
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2) inset',
  }}
/>

// Label
<label className="block text-sm font-medium text-white/80 mb-1">
  LABEL TEXT
</label>
```

### Секции (Sections)

```tsx
// Стандартная секция
<section className="relative py-24 md:py-32">
  <div className="container mx-auto px-4 md:px-8 lg:px-16">
    {/* Контент */}
  </div>
</section>

// Секция с фоном
<section
  className="relative py-24 md:py-32"
  style={{
    background: 'linear-gradient(180deg, rgba(0, 0, 0, 1) 0%, rgba(15, 15, 15, 1) 5%, rgba(15, 15, 15, 1) 100%)',
  }}
>
  {/* Контент */}
</section>
```

## ✨ Эффекты

### Центральное свечение (Central Glow)

```tsx
<div className="absolute inset-0">
  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#00FFA9] rounded-full blur-[150px] opacity-15" />
</div>
```

### Glassmorphism

```tsx
style={{
  background: 'rgba(255, 255, 255, 0.08)',
  backdropFilter: 'blur(20px) saturate(180%)',
  WebkitBackdropFilter: 'blur(20px) saturate(180%)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  boxShadow: '0 8px 32px -4px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.1) inset',
}}
```

## 📐 Типографика

### Заголовки

```tsx
// H1 (главный заголовок)
<h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
  Заголовок
</h1>

// H2 (секция)
<h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2">
  Заголовок секции
</h2>

// H3 (подсекция)
<h3 className="text-xl md:text-2xl font-bold text-white mb-2">
  Подзаголовок
</h3>
```

### Текст

```tsx
// Основной текст
<p className="text-base md:text-lg text-white/70 leading-relaxed">
  Основной текст
</p>

// Вторичный текст
<p className="text-sm text-white/60">
  Вторичный текст
</p>

// Мелкий текст
<p className="text-xs text-white/40">
  Мелкий текст
</p>
```

## 🎭 Анимации

### Framer Motion паттерны

```tsx
// Появление снизу
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6 }}
>
  {/* Контент */}
</motion.div>

// Масштабирование
<motion.div
  initial={{ opacity: 0, scale: 0.9 }}
  animate={{ opacity: 1, scale: 1 }}
  transition={{ duration: 0.6, delay: 0.2 }}
>
  {/* Контент */}
</motion.div>

// Scroll-linked анимация
const { scrollYProgress } = useScroll({
  target: ref,
  offset: ['start end', 'end start'],
})
const y = useTransform(scrollYProgress, [0, 1], [0, -50])
```

## 📱 Адаптивность

### Breakpoints

- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

### Паттерны

```tsx
// Адаптивные отступы
className="px-4 md:px-8 lg:px-16"

// Адаптивные размеры текста
className="text-2xl md:text-3xl lg:text-4xl"

// Адаптивная сетка
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
```

## 🎯 Принципы использования

1. **Консистентность**: Всегда используйте одни и те же стили для одинаковых элементов
2. **Иерархия**: Используйте размеры и цвета для создания визуальной иерархии
3. **Пространство**: Давайте элементам дышать (достаточные отступы)
4. **Контраст**: Обеспечивайте достаточный контраст для читаемости
5. **Премиум**: Каждый элемент должен выглядеть дорого и профессионально

---

**Последнее обновление**: 2025-01-10
**Версия**: 1.0





