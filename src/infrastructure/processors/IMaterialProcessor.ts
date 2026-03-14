import type { MaterialType } from '@/shared-core'
import type {
  TextureMaterial,
  PhotoMaterial,
  VideoMaterial,
  BackgroundMaterial,
} from '@/domain'

export type Material =
  | TextureMaterial
  | PhotoMaterial
  | VideoMaterial
  | BackgroundMaterial

export interface IMaterialProcessor {
  readonly type: MaterialType
  process(file: File | Buffer, path?: string): Promise<Material>
}


