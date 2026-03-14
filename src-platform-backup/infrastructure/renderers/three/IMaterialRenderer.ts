import type { MaterialType } from '@/shared-core'
import type { Material } from '../../processors/IMaterialProcessor'

export interface IMaterialRenderer {
  readonly type: MaterialType
  render(material: Material, target: any): void
}


