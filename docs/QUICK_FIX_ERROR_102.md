# Быстрое исправление Error Code: -102

## ⚠️ Проблема

Вы пытались выполнить команды из домашней директории (`~`), а не из директории проекта.

## ✅ Решение

**Всегда переходите в директорию проекта перед выполнением команд:**

```bash
# Перейти в директорию проекта
cd /Users/anatolii/scooter-wraps-landing

# Затем выполнить команды
rm -rf .next
npm run dev
```

**Или используйте одну команду:**

```bash
cd /Users/anatolii/scooter-wraps-landing && rm -rf .next && npm run dev
```

## 🔧 Выполнено

✅ Кэш `.next` очищен  
✅ Dev server запущен в фоновом режиме

## 📋 Проверка

1. **Проверить, что сервер запущен:**
   ```bash
   lsof -i :3000
   ```

2. **Открыть в браузере:**
   ```
   http://localhost:3000
   ```

3. **Проверить консоль браузера (F12):**
   - Должен появиться лог: `✅ [Layout] model-viewer loaded successfully`
   - Или ошибка: `❌ [Layout] Failed to load model-viewer: ...`

## 🎯 Следующие шаги

1. Откройте http://localhost:3000 в браузере
2. Откройте DevTools (F12)
3. Проверьте Console tab для логов model-viewer
4. Проверьте Network tab для загрузки ресурсов

---

**Важно:** Всегда выполняйте команды из директории проекта `/Users/anatolii/scooter-wraps-landing`




