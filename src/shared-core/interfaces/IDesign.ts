import { DesignId, DesignMetadata, MaterialId } from '../types/ValueObjects';
import { MaterialFormat } from '../types/MaterialFormat';
import { IMaterial } from './IMaterial';

/**
 * Агрегат для неупорядоченного набора Material[m].
 * НЕ содержит формат-специфичной логики.
 * НЕ зависит от других Design.
 */
export interface IDesign {
  readonly id: DesignId;
  readonly metadata: DesignMetadata;
  
  /**
   * Добавить материал в дизайн.
   */
  addMaterial(material: IMaterial): void;
  
  /**
   * Удалить материал из дизайна.
   */
  removeMaterial(materialId: MaterialId): boolean;
  
  /**
   * Получить материал по ID.
   */
  getMaterial(materialId: MaterialId): IMaterial | null;
  
  /**
   * Получить все материалы (неупорядоченный набор).
   */
  listMaterials(): ReadonlyArray<IMaterial>;
  
  /**
   * Получить материалы по формату.
   */
  getMaterialsByFormat(format: MaterialFormat): ReadonlyArray<IMaterial>;
  
  /**
   * Проверить наличие материала определенного формата.
   */
  hasMaterialFormat(format: MaterialFormat): boolean;
}


