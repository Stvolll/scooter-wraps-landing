# Code Standards & Quality Guide

Руководство по стандартам кода и инструментам качества проекта.

## Установленные инструменты

### ESLint

- ✅ Настроен с `next/core-web-vitals`
- ✅ Интегрирован с Prettier через `eslint-config-prettier`
- ✅ Автоматическое исправление через `npm run lint:fix`

### Prettier

- ✅ Настроен для единообразного форматирования
- ✅ Конфигурация в `.prettierrc.json`
- ✅ Игнорирование файлов через `.prettierignore`

### Bundle Analyzer

- ✅ `@next/bundle-analyzer` для анализа размера бандла
- ✅ Интегрирован в `next.config.js`
- ✅ Запуск через `npm run analyze`

## Скрипты в package.json

### Форматирование и линтинг

```bash
# Автоматическое исправление ESLint ошибок
npm run lint:fix

# Форматирование всех файлов
npm run format

# Проверка форматирования (без изменений)
npm run format:check

# Стандартный линтинг
npm run lint
```

### Анализ бандла

```bash
# Анализ размера бандла (откроет браузер с визуализацией)
npm run analyze
```

Этот скрипт:

1. Собирает проект (`next build`)
2. Запускает повторную сборку с `ANALYZE=true`
3. Открывает интерактивную визуализацию размеров chunks

### Health Check

```bash
# Полная проверка здоровья проекта
npm run health

# Быстрая проверка (без полной сборки)
npm run health:quick
```

Health check проверяет:

1. ✅ Наличие основных файлов
2. ✅ Ошибки сборки
3. ✅ Ошибки импортов
4. ✅ Наличие необходимых скриптов
5. ✅ ESLint ошибки
6. ✅ Prettier форматирование
7. ✅ TypeScript компиляция
8. ✅ Зависимости
9. ✅ Конфигурационные файлы

## Конфигурация Prettier

```json
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "arrowParens": "avoid",
  "endOfLine": "lf"
}
```

### Игнорируемые файлы

- `node_modules/`
- `.next/`
- `out/`, `build/`, `dist/`
- `*.min.js`, `*.min.css`
- Lock files
- `.env*`
- `public/uploads/`

## Конфигурация ESLint

```json
{
  "extends": ["next/core-web-vitals", "prettier"],
  "plugins": ["prettier"],
  "rules": {
    "prettier/prettier": "warn"
  }
}
```

## Рекомендуемый workflow

### Перед коммитом

```bash
# 1. Исправить ESLint ошибки
npm run lint:fix

# 2. Отформатировать код
npm run format

# 3. Проверить здоровье проекта
npm run health:quick
```

### Перед деплоем

```bash
# 1. Полная проверка
npm run health

# 2. Анализ бандла (опционально)
npm run analyze

# 3. Сборка
npm run build
```

## Интеграция с IDE

### VS Code

Рекомендуемые расширения:

- ESLint
- Prettier - Code formatter

Настройки `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

## CI/CD Integration

### GitHub Actions пример

```yaml
name: Code Quality

on: [push, pull_request]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run format:check
      - run: npm run lint
      - run: npm run health:quick
```

## Troubleshooting

### ESLint ошибки не исправляются

```bash
# Убедитесь, что eslint-config-prettier установлен
npm install --save-dev eslint-config-prettier

# Очистите кеш
rm -rf .next
npm run lint:fix
```

### Prettier конфликтует с ESLint

Убедитесь, что в `.eslintrc.json` есть:

```json
{
  "extends": ["prettier"]
}
```

### Bundle Analyzer не открывается

```bash
# Проверьте, что порт 8888 свободен
lsof -ti:8888 | xargs kill -9

# Запустите снова
npm run analyze
```

## Дополнительные ресурсы

- [Next.js ESLint](https://nextjs.org/docs/basic-features/eslint)
- [Prettier Docs](https://prettier.io/docs/en/)
- [Bundle Analyzer](https://www.npmjs.com/package/@next/bundle-analyzer)

