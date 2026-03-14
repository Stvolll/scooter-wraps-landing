import { ModelId, DesignId, MaterialId } from '../../shared-core/types/ValueObjects';

/**
 * Генератор уникальных ID.
 */
export class IdGenerator {
  static generateModelId(): ModelId {
    return ModelId(`model_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  }
  
  static generateDesignId(): DesignId {
    return DesignId(`design_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  }
  
  static generateMaterialId(): MaterialId {
    return MaterialId(`material_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  }
}


