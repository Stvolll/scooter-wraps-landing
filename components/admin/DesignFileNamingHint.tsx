'use client'

/**
 * Подсказка по соглашению имён файлов дизайна.
 * Показывать только при создании/редактировании ДИЗАЙНА (не модели).
 * Модель: GLB может называться как угодно.
 */
export default function DesignFileNamingHint() {
  return (
    <div className="rounded-2xl p-4 bg-[#007AFF]/10 border border-[#007AFF]/20 text-sm text-white/90">
      <p className="font-semibold text-white mb-2">Соглашение имён файлов дизайна</p>
      <ul className="space-y-1 text-white/80">
        <li><strong>UV-*.jpg / UV-*.png</strong> — текстура дизайна (накладывается на меш)</li>
        <li><strong>panoram-*.webp</strong> — фон сцены</li>
        <li><strong>photo-*.png</strong> — фото для карточки</li>
        <li><strong>video-*.mp4</strong> — видео для карточки</li>
      </ul>
      <p className="mt-2 text-white/60 text-xs">Используйте эти префиксы в именах файлов при загрузке материалов дизайна.</p>
    </div>
  )
}
