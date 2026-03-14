/**
 * FileTypeDetector - определяет тип материала по имени файла
 * Согласно MODEL_DESIGN_SYSTEM_AUTONOMOUS.md и ADMIN_PANEL_MODEL_DESIGN_SYSTEM.md
 */

export type MaterialType = 'texture' | 'photo' | 'video' | 'background' | 'model' | 'unknown'

export class FileTypeDetector {
  /**
   * Определяет тип материала по имени файла
   * Согласно документации:
   * - UV-* → TextureMaterial (texture)
   * - PHOTO-* → PhotoMaterial (photo)
   * - Video-* → VideoMaterial (video)
   * - panoram-* → BackgroundMaterial (background)
   * - MODEL-* или *.glb → Model (model)
   */
  static detect(filename: string): MaterialType {
    if (!filename) return 'unknown'

    const normalizedName = filename.toLowerCase().trim()

    // Проверка по префиксам (приоритет)
    if (normalizedName.startsWith('uv-')) {
      return 'texture'
    }
    if (normalizedName.startsWith('photo-')) {
      return 'photo'
    }
    if (normalizedName.startsWith('video-')) {
      return 'video'
    }
    if (normalizedName.startsWith('panoram-')) {
      return 'background'
    }
    if (normalizedName.startsWith('model-')) {
      return 'model'
    }

    // Проверка по расширению
    if (filename.endsWith('.glb') || filename.endsWith('.gltf')) {
      return 'model'
    }
    if (filename.endsWith('.mp4') || filename.endsWith('.webm')) {
      return 'video'
    }
    if (filename.endsWith('.hdr') || filename.endsWith('.exr')) {
      return 'background'
    }
    if (filename.endsWith('.jpg') || filename.endsWith('.jpeg') || filename.endsWith('.png') || filename.endsWith('.webp')) {
      // Для изображений нужно проверить контекст (панорама или фото)
      if (normalizedName.includes('panoram') || normalizedName.includes('bg') || normalizedName.includes('background')) {
        return 'background'
      }
      // По умолчанию - фото, если не указано иначе
      return 'photo'
    }

    return 'unknown'
  }

  /**
   * Определяет folder для сохранения файла на основе типа
   */
  static getFolderForType(type: MaterialType): string {
    switch (type) {
      case 'texture':
      case 'photo':
      case 'background':
        return 'images'
      case 'video':
        return 'videos'
      case 'model':
        return 'models'
      default:
        return 'images'
    }
  }

  /**
   * Проверяет, является ли файл валидным для указанного типа
   */
  static isValidForType(filename: string, expectedType: MaterialType): boolean {
    const detectedType = this.detect(filename)
    
    // Специальные случаи
    if (expectedType === 'texture' && detectedType === 'photo') {
      // Фото может быть текстурой, если имя начинается с UV-
      return filename.toLowerCase().startsWith('uv-')
    }
    
    if (expectedType === 'background' && (detectedType === 'photo' || detectedType === 'background')) {
      return true
    }

    return detectedType === expectedType || detectedType === 'unknown'
  }
}




