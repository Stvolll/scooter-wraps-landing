import { IDesign, IMaterial } from '../shared-core/interfaces';
import { DesignId, DesignMetadata, MaterialId } from '../shared-core/types/ValueObjects';
import { MaterialFormat } from '../shared-core/types/MaterialFormat';

/**
 * Агрегат для неупорядоченного набора Material[m].
 * НЕ содержит формат-специфичной логики.
 */
export class Design implements IDesign {
  private materials: Map<MaterialId, IMaterial> = new Map();
  
  constructor(
    public readonly id: DesignId,
    public readonly metadata: DesignMetadata
  ) {}
  
  addMaterial(material: IMaterial): void {
    this.materials.set(material.id, material);
  }
  
  removeMaterial(materialId: MaterialId): boolean {
    return this.materials.delete(materialId);
  }
  
  getMaterial(materialId: MaterialId): IMaterial | null {
    return this.materials.get(materialId) ?? null;
  }
  
  listMaterials(): ReadonlyArray<IMaterial> {
    return Array.from(this.materials.values());
  }
  
  getMaterialsByFormat(format: MaterialFormat): ReadonlyArray<IMaterial> {
    return Array.from(this.materials.values())
      .filter(m => m.format === format);
  }
  
  hasMaterialFormat(format: MaterialFormat): boolean {
    return this.getMaterialsByFormat(format).length > 0;
  }
}


