import { MaterialId, MaterialMetadata, ResourceReference } from '../types/ValueObjects';
import { MaterialFormat } from '../types/MaterialFormat';

/**
 * Самодостаточная единица контента.
 * НЕ ссылается на другие Material, Design или Model.
 */
export interface IMaterial {
  readonly id: MaterialId;
  readonly format: MaterialFormat;
  readonly metadata: MaterialMetadata;
  
  /**
   * Получить ссылку на ресурс.
   * Материал сам знает, как получить свои данные.
   */
  getResource(): ResourceReference;
}


