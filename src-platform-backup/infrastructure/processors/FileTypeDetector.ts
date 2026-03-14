import type { MaterialType } from '@/shared-core'
import { UnknownFileTypeError } from '@/shared-core'

export class FileTypeDetector {
  static detect(filename: string): MaterialType {
    if (/^UV-/i.test(filename)) return 'texture'
    if (/^PHOTO-/i.test(filename)) return 'photo'
    if (/^Video-/i.test(filename)) return 'video'
    if (/^panoram-/i.test(filename)) return 'background'

    throw new UnknownFileTypeError(filename)
  }
}


