import { IModel, IDesign } from '../shared-core/interfaces';
import { ModelId, ModelMetadata, DesignId } from '../shared-core/types/ValueObjects';

/**
 * Изолированная модель самоката.
 * Является контейнером для Design[j].
 */
export class Model implements IModel {
  private designs: Map<DesignId, IDesign> = new Map();
  
  constructor(
    public readonly id: ModelId,
    public readonly metadata: ModelMetadata
  ) {}
  
  addDesign(design: IDesign): void {
    this.designs.set(design.id, design);
  }
  
  removeDesign(designId: DesignId): boolean {
    return this.designs.delete(designId);
  }
  
  getDesign(designId: DesignId): IDesign | null {
    return this.designs.get(designId) ?? null;
  }
  
  listDesigns(): ReadonlyArray<IDesign> {
    return Array.from(this.designs.values());
  }
}


